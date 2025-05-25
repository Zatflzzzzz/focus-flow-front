import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';
import {NotificationService} from '../services/notification/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      telegramLink: ['', Validators.pattern(/^https?:\/\/(t\.me|telegram\.me)\/.+$/)]
    });
  }

  get formControls() {
    return this.registerForm.controls;
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.registerForm.value;

    this.authService.register(
      formValue.email,
      formValue.password,
      formValue.username,
      formValue.firstName,
      formValue.lastName,
      formValue.telegramLink
    ).subscribe({
      next: () => {
        this.notificationService.show('Регистрация прошла успешно');
        this.router.navigate(['/projects']);
      },
      error: (err:any) => {
        this.notificationService.show(err?.error?.message || 'Ошибка при регистрации', 'error');
        this.isLoading = false;
      }
    });
  }

  private markAllAsTouched(): void {
    Object.values(this.registerForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
