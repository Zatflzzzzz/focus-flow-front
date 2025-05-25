import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';
import {NotificationService} from '../services/notification/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });

    if (this.authService.isLoggedIn) {
      this.router.navigate(['/projects']).catch(err => console.error('Navigation error:', err));
    }

    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/projects';
    });
  }

  public get username(): FormControl {
    return this.loginForm.get('username') as FormControl;
  }

  public get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  public errorMessage: string = '';

  login(): void {
    if (this.loginForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        const secondsLeft = this.authService.getTokenTimeLeft();
        const message = secondsLeft !== null
          ? `Вход выполнен успешно`
          : 'Вход выполнен успешно';
        this.notificationService.show(message, 'success');
        this.router.navigate([this.returnUrl]);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Неверное имя пользователя или пароль';
        this.notificationService.show(this.errorMessage, 'error');
        this.isLoading = false;
      }
    });
  }



  private markAllAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
