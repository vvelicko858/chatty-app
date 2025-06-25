import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import { NewUser } from '../shared/data';
import {HttpService} from '../shared/http.service';


@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form!: FormGroup;
  formErrors: any = {};

  constructor(private fb: FormBuilder, private router: Router,
              private afAuth: AngularFireAuth,
              private firestore: AngularFirestore,
              private http: HttpService) {
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
    this.form.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.validateConfirmPassword();
    });
  }

  validateConfirmPassword() {
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.formErrors.confirmPassword = 'Пароли не совпадают';
    } else {
      delete this.formErrors.confirmPassword;
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

  async register() {
    console.log(this.form.value);
    if (this.form.invalid) return;

    const { email, password, name, username } = this.form.value;

    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('Регистрация успешна:', user);

      alert('Вы успешно зарегистрированы!');
      const newUser: NewUser = {
        UID: user.uid,
        name,
        username,
        email
      };

      this.http.pushUserInBD(newUser);
      this.router.navigate(['/']).then();

    } catch (error) {
      console.error('Ошибка регистрации:', error);
      alert('Ошибка регистрации: ' + error.message);
    }
  }
}
