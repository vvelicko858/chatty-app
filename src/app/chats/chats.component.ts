import { Component } from '@angular/core';
import {HttpService} from '../shared/http.service';
import {Observable} from 'rxjs';
import {NewUser} from '../shared/data';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import { Router} from '@angular/router';
import {ChatStateService} from '../shared/chat-state.service';

@Component({
  selector: 'app-chats',
  standalone: false,
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss'
})
export class ChatsComponent {

  constructor(private http: HttpService, private afAuth: AngularFireAuth, private router: Router, public chatState: ChatStateService) {
  }
public currentUser:any
public userName: string;
public searchUser= ''
user$!: Observable<NewUser | undefined> | null;
isMobile = false;
chatOpenOnMobile = false;

  searhUser() {
      this.user$ = this.http.getUserByEmail(this.searchUser);
    }


  redirect(uid:string) {
    this.chatState.openChat();
    this.router.navigate(['/chats/chat', uid ]).then();
    this.searchUser=''
    this.user$ = null
  }
  checkScreenSize() {
    this.isMobile = window.innerWidth < 750;
  }


  ngOnInit(): void {
    this.checkScreenSize();

    window.addEventListener('resize', () => this.checkScreenSize());

    this.chatState.isChatOpen$.subscribe((isOpen) => {
      this.chatOpenOnMobile = this.isMobile && isOpen;
    });
      this.afAuth.currentUser.then(user => {
      if (user) {
        this.http.getUserByEmail(user.email).subscribe(dbUser => {
          this.currentUser = dbUser
          this.userName=dbUser.name;
        });
      } else {
        console.log('Пользователь не залогинен');
      }
    });
  }

}
