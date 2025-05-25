import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.addEventListener('token-expiring', this.handleTokenExpiring.bind(this));
  }

  handleTokenExpiring(): void {
    const confirmRefresh = window.confirm('Сессия скоро истекает. Обновить токен и продолжить?');

    if (confirmRefresh) {
      this.authService.refreshAuthToken().subscribe({
        next: () => {
          console.log('Токен обновлён');
        },
        error: () => {
          this.logout();
        }
      });
    } else {
      this.logout();
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']).catch(err => console.error('Navigation error:', err));
    });
  }
}
