import { Injectable } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate: CanActivateFn = (route, state) => {
    return this.authService.isLoggedIn().pipe(
      map(loggedIn => {
        if (loggedIn) {
          console.log('Logged in', loggedIn);
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  };
}
