import { Component } from '@angular/core';
import { HttpService } from '../../shared/http.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {forkJoin, map, switchMap} from 'rxjs';
import {Router} from '@angular/router';
import {ChatStateService} from '../../shared/chat-state.service';

@Component({
  selector: 'app-chat-list',
  standalone: false,
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent {
  chats: any[] = [];
  currentUserId: string;



  constructor(private http: HttpService, private afAuth: AngularFireAuth, private router: Router, private chatState: ChatStateService) {}

  ngOnInit(): void {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.http.getUserByEmail(user.email).subscribe(dbUser => {
          this.currentUserId = dbUser.UID;
          this.loadChats();
        });
      }
    });
  }


  loadChats(): void {
    setTimeout(() => {
      this.http.getChatsForUser(this.currentUserId).pipe(
        map((chats: any[]) =>
          chats.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp)
        ),
        switchMap(sortedChats => {
          const chatRequests = sortedChats.map(chat => {
            const otherUserId = Object.keys(chat.participants).find(
              id => id !== this.currentUserId
            );

            return this.http.getUserByUID(otherUserId).pipe(
              map((user: any) => ({
                ...chat,
                otherUserId: otherUserId,
                otherUserName: user.name
              }))
            );
          });

          return forkJoin(chatRequests);
        })
      ).subscribe((chatsWithUserNames: any[]) => {
        this.chats = chatsWithUserNames;
      });
    }, 100);
  }

  getIdChat(id) {
    this.chatState.openChat()
    this.router.navigate(['/chats/chat', id ]).then();
  }

}
