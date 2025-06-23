import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore} from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  form!: FormGroup;
  formErrors: any = {};
  constructor(private fb: FormBuilder,
              private router: Router,
              private afAuth: AngularFireAuth,
              private firestore: AngularFirestore) {
    this.buildForm();
 }


  buildForm() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async login() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('Пользователь вошёл:', user);
      this.router.navigate(['/chats']).then();
    } catch (error) {
      console.error('Ошибка входа:', error);
      alert('Неверные учетные данные');
    }
  }

  back(): void {
    this.router.navigate(['/']).then();
  }

  markAllAsTouched() {
    Object.keys(this.form.controls).forEach(field => {
      const control = this.form.get(field);
      if (control) {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }
}
