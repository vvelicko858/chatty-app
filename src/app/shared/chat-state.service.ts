import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatStateService {
  private isChatOpenSubject = new BehaviorSubject<boolean>(false);
  isChatOpen$ = this.isChatOpenSubject.asObservable();

  openChat() {
    this.isChatOpenSubject.next(true);
  }

  closeChat() {
    this.isChatOpenSubject.next(false);
  }
}
