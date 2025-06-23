import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map } from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  getAuthState() {
    return this.afAuth.authState;
  }

  isLoggedIn(): Observable<boolean> {
    return this.getAuthState().pipe(
      map(user => user !== null)
    );
  }
}
