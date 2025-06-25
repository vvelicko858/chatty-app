import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NewUser } from './data';
import {catchError, map, Observable, of} from 'rxjs';
import {AngularFireDatabase} from '@angular/fire/compat/database';


const url = 'https://chatty-app-4b5e9-default-rtdb.europe-west1.firebasedatabase.app/users';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  users: NewUser[] = [];

  constructor(private http: HttpClient,private db: AngularFireDatabase) {}


  generateChatId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  chatExists(chatId: string) {
    console.log('Calling chatExists with chatId:', chatId);
    console.log('this.db is:', this.db);
    return this.db.object(`/chats/${chatId}`).valueChanges();
  }

  createChatWithFirstMessage(currentUserId: string, otherUserId: string, text: string) {
    const chatId = this.generateChatId(currentUserId, otherUserId);
    const messageId = this.db.createPushId();
    const timestamp = Date.now();

    const chatData = {
      participants: {
        [currentUserId]: true,
        [otherUserId]: true
      },
      lastMessage: {
        text,
        senderId: currentUserId,
        timestamp
      }
    };

    const messageData = {
      senderId: currentUserId,
      text,
      timestamp
    };

    const updates: any = {};
    updates[`/chats/${chatId}`] = chatData;
    updates[`/messages/${chatId}/${messageId}`] = messageData;

    return this.db.object('/').update(updates);
  }

  sendMessageToChat(chatId: string, senderId: string, text: string) {
    const messageId = this.db.createPushId();
    const timestamp = Date.now();

    const messageData = {
      senderId,
      text,
      timestamp
    };

    const updates: any = {};
    updates[`/messages/${chatId}/${messageId}`] = messageData;
    updates[`/chats/${chatId}/lastMessage`] = {
      text,
      senderId,
      timestamp
    };

    return this.db.object('/').update(updates);
  }


  pushUserInBD(user: NewUser): void {
    this.http.post<{ name: string }>(`${url}.json`, user, httpOptions)
      .pipe(
        catchError(this.errorHandler<{ name: string }>('POST'))
      )
      .subscribe(res => {
        if (res?.name) {
          this.users.push({ id: res.name, ...user });
        }
      });
  }

  getUserByEmail(email: string): Observable<NewUser | undefined> {
    return this.http.get<{ [key: string]: NewUser }>(`${url}.json`, httpOptions)
      .pipe(
        catchError(this.errorHandler<{ [key: string]: NewUser }>('GET')),
        map(res => {
          if (!res) return undefined;
          return Object.entries(res)
            .map(([id, user]) => ({ id, ...user }))
            .find(user => user.email === email);
        })
      );
  }

  getUserByUID(uid: string): Observable<NewUser | undefined> {
    return this.http.get<Record<string, NewUser>>(`${url}.json`).pipe(
      map(usersObj => {
        return Object.values(usersObj).find(user => user.UID === uid);
      }),
      catchError(err => {
        console.error('Ошибка при получении пользователя по UID', err);
        return of(undefined);
      })
    );
  }



  private errorHandler<T>(operation: string, result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
