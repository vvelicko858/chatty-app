import { Component, ViewChild, ElementRef } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {HttpService} from '../../shared/http.service';
import {Observable, of} from 'rxjs';
import {NewUser} from '../../shared/data';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {ChatStateService} from '../../shared/chat-state.service';


@Component({
  selector: 'app-chat-area',
  standalone: false,
  templateUrl: './chat-area.component.html',
  styleUrl: './chat-area.component.scss',
})
export class ChatAreaComponent {

user$!: Observable<NewUser | undefined> | null;
currentUserId: string = '';
otherUserId: string = '';
messageText: string = '';
messages: any[] = [];

constructor(private router: Router, private route: ActivatedRoute, private http: HttpService, private afAuth: AngularFireAuth, private chatState: ChatStateService) {
}

  @ViewChild('chatContent') chatContent!: ElementRef;


  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.chatContent.nativeElement.scrollTop = this.chatContent.nativeElement.scrollHeight;
      } catch (err) {
        console.error('scrollToBottom error:', err);
      }
    }, 100);
  }

    getData() {
    this.user$ = this.http.getUserByUID(this.otherUserId)
    }



  sendMessage() {
    if (!this.messageText.trim()) return;

     const chatId = this.http.generateChatId(this.currentUserId, this.otherUserId);

    this.http.chatExists(chatId).subscribe(exists => {
      if (exists) {
        this.http.sendMessageToChat(chatId, this.currentUserId, this.messageText)

          .then(() => this.messageText = '')
          .catch(err => console.error(err));

        setTimeout(()=>{
          this.loadMessages(chatId)
        },200)
      } else {
        this.http.createChatWithFirstMessage(this.currentUserId, this.otherUserId, this.messageText)
          .then(() => this.messageText = '')
          .catch(err => console.error(err));
      }
    });
  }

  loadMessages(chatId: string): void {
    this.http.getMessages(chatId).subscribe(messages => {
      this.messages = messages.sort((a, b) => a.timestamp - b.timestamp);
      this.scrollToBottom();
    });
 }
  back(){
    this.router.navigate(['/chats']);
    this.chatState.closeChat()
  }

  ngOnInit(): void {

    this.afAuth.currentUser.then(user => {
      if (user) {
        this.http.getUserByEmail(user.email).subscribe(dbUser => {
          this.currentUserId = dbUser.UID;

        });
      }
    })
    this.route.paramMap.subscribe(params => {
      const uid = params.get('uid')!;
      if (uid) {
        this.otherUserId = uid;
        this.getData()

      }
    });


    setTimeout(() => {
      const chatId = this.http.generateChatId(this.currentUserId, this.otherUserId);
      this.loadMessages(chatId);
      }, 300);

    setInterval(()=>{
      const chatId = this.http.generateChatId(this.currentUserId, this.otherUserId);
      console.log(chatId);
      this.loadMessages(chatId)
    },4500)

   }
}
