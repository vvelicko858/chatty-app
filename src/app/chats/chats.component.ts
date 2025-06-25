import { Component } from '@angular/core';
import {HttpService} from '../shared/http.service';
import {Observable} from 'rxjs';
import {NewUser} from '../shared/data';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import { Router} from '@angular/router';

@Component({
  selector: 'app-chats',
  standalone: false,
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss'
})
export class ChatsComponent {

  constructor(private http: HttpService, private afAuth: AngularFireAuth, private router: Router) {
  }
public currentUser:any
public userName: string;
public searchUser= ''
user$!: Observable<NewUser | undefined> | null;

  searhUser() {
      this.user$ = this.http.getUserByEmail(this.searchUser);
    }

  redirect(uid:string) {
    this.router.navigate(['/chats/chat', uid ]).then();
    this.searchUser=''
    this.user$ = null
  }


  ngOnInit(): void {
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
