import { Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {HttpService} from '../../shared/http.service';
import {Observable} from 'rxjs';
import {NewUser} from '../../shared/data';
import {AngularFireAuth} from '@angular/fire/compat/auth';

@Component({
  selector: 'app-chat-area',
  standalone: false,
  templateUrl: './chat-area.component.html',
  styleUrl: './chat-area.component.scss'
})
export class ChatAreaComponent {

user$!: Observable<NewUser | undefined> | null;
currentUserId: string = '';
otherUserId: string = '';
messageText: string = '';


constructor(private router: Router, private route: ActivatedRoute, private http: HttpService, private afAuth: AngularFireAuth) {
}


    getData() {
    this.user$ = this.http.getUserByUID(this.otherUserId)
      console.log(this.user$)
    }

  sendMessage() {
  console.log(this.messageText);
    this.http.chatExists('1').subscribe();
    // if (!this.messageText.trim()) return;
    //
    // const chatId = this.http.generateChatId(this.currentUserId, this.otherUserId);
    //
    // this.http.chatExists(chatId).subscribe(chat => {
    //   if (chat) {
    //     this.http.sendMessageToChat(chatId, this.currentUserId, this.messageText)
    //       .then(() => this.messageText = '')
    //       .catch(err => console.error(err));
    //   } else {
    //     this.http.createChatWithFirstMessage(this.currentUserId, this.otherUserId, this.messageText)
    //       .then(() => this.messageText = '')
    //       .catch(err => console.error(err));
    //   }
    // });
  }


  ngOnInit(): void {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.http.getUserByEmail(user.email).subscribe(dbUser => {
          this.currentUserId = dbUser.name;
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
  }
}
