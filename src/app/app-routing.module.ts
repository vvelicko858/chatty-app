import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RegisterComponent} from './register/register.component';
import {AuthComponent} from './auth/auth.component';
import {ChatsComponent} from './chats/chats.component';
import {AuthGuard} from './shared/auth.guard';
import {ChatAreaComponent} from './chats/chat-area/chat-area.component';

const routes: Routes = [
  {path: 'register', component: RegisterComponent },
  {path:'login', component: AuthComponent},
  {path:'chats', component: ChatsComponent, canActivate: [AuthGuard],
    children:[
      {path: 'chat/:uid', component: ChatAreaComponent  },
    ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
