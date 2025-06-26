import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NewUser } from './data';
import {catchError, map, Observable, of} from 'rxjs';
import {AngularFireDatabase} from '@angular/fire/compat/database';


const url = 'https://chatty-app-4b5e9-default-rtdb.europe-west1.firebasedatabase.app/users';
const url2 = 'https://chatty-app-4b5e9-default-rtdb.europe-west1.firebasedatabase.app/';

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

  generatePushId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}_${random}`;
  }

  chatExists(chatId: string): Observable<boolean> {
    const chatsUrl = `${url2}/chats.json`;

    return this.http.get<any>(chatsUrl, httpOptions).pipe(
      map(chats => {
        if (!chats) {
          return false;
        }
        return Object.keys(chats).some(key => key === chatId);
      }),
      catchError(err => {
        console.error(`Ошибка при проверке чата с id "${chatId}":`, err);
        return of(false);
      })
    );
  }

  createChatWithFirstMessage(currentUserId: string, otherUserId: string, messageText: string): Promise<any> {
    const chatId = this.generateChatId(currentUserId, otherUserId);
    const messageId = this.generatePushId();

    const newChatData = {
      participants: {
        [currentUserId]: true,
        [otherUserId]: true
      },
      lastMessage: {
        text: messageText,
        senderId: currentUserId,
        timestamp: Date.now()
      },
      messages: {
        [messageId]: {
          senderId: currentUserId,
          text: messageText,
          timestamp: Date.now()
        }
      }
    };

    const chatUrl = `${url2}/chats/${chatId}.json`;

    return this.http.put(chatUrl, newChatData, httpOptions)
      .toPromise()
      .catch(err => {
        console.error('Ошибка при создании чата:', err);
        throw err;
      });
  }

  sendMessageToChat(chatId: string, senderId: string, text: string): Promise<any> {
    const timestamp = Date.now();
    const messageId = this.generatePushId();

    const messageData = {
      senderId,
      text,
      timestamp
    };

    const messageUrl = `${url2}/chats/${chatId}/messages.json`;
    const lastMessageUrl = `${url2}/chats/${chatId}/lastMessage.json`;

    return this.http.get<any>(messageUrl).pipe(
      catchError(() => of({}))
    ).toPromise().then(existingMessages => {
      const updatedMessages = {
        ...existingMessages,
        [messageId]: messageData
      };

      return this.http.put(messageUrl, updatedMessages, httpOptions).toPromise().then(() => {
        return this.http.put(lastMessageUrl, messageData, httpOptions).toPromise();
      });
    }).catch(err => {
      console.error('Ошибка при отправке сообщения в чат:', err);
      throw err;
    });
  }



  getMessages(chatId: string): Observable<any[]> {
    const messagesUrl = `${url2}/chats/${chatId}/messages.json`;
    return this.http.get<any>(messagesUrl).pipe(
      map(response => {
        if (!response) return [];
        return Object.keys(response).map(key => ({
          id: key,
          ...response[key]
        }));
      }),
      catchError(err => {
        console.error('Ошибка при загрузке сообщений:', err);
        return of([]);
      })
    );
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

  getChatsForUser(userId: string): Observable<any[]> {
    const chatsUrl = `${url2}/chats.json`;
    return this.http.get<any>(chatsUrl).pipe(
      map(chats => {
        if (!chats) return [];
        return Object.keys(chats)
          .filter(chatId => chats[chatId].participants?.[userId])
          .map(chatId => ({
            id: chatId,
            ...chats[chatId]
          }));
      }),
      catchError(err => {
        console.error('Ошибка при загрузке чатов:', err);
        return of([]);
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
