import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RegisterComponent} from './register/register.component';
import {AuthComponent} from './auth/auth.component';
import {ChatsComponent} from './chats/chats.component';
import {AuthGuard} from './shared/auth.guard';

const routes: Routes = [
  {path: 'register', component: RegisterComponent },
  {path:'login', component: AuthComponent},
  {path:'chats', component: ChatsComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
