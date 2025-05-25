import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {User} from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private authToken: string | null = null;
  private tokenRefreshToken: string | null = null;
  private expirationTimeout: any = null;

  private readonly API_BASE_URL = 'http://localhost:3246';

  constructor(private router: Router) {
    this.checkAuthState();
  }

  private checkAuthState(): void {
    const authData = localStorage.getItem('authData');
    if (authData) {
      const { user, authToken, tokenRefreshToken, expiresAt } = JSON.parse(authData);
      this.currentUserSubject.next(user);
      this.authToken = authToken;
      this.tokenRefreshToken = tokenRefreshToken;

      if (expiresAt) {
        this.startTokenExpirationWatcher(expiresAt);
      }
    }
  }

  private saveAuthData(user: User, authToken: string, refreshToken: string, expiresInSeconds: number): void {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const authData = { user, authToken, tokenRefreshToken: refreshToken, expiresAt };
    localStorage.setItem('authData', JSON.stringify(authData));
    this.currentUserSubject.next(user);
    this.authToken = authToken;
    this.tokenRefreshToken = refreshToken;
    this.startTokenExpirationWatcher(expiresAt);
  }

  private clearAuthData(): void {
    localStorage.removeItem('authData');
    this.currentUserSubject.next(null);
    this.authToken = null;
    this.tokenRefreshToken = null;

    if (this.expirationTimeout) {
      clearTimeout(this.expirationTimeout);
    }
  }

  private startTokenExpirationWatcher(expiresAt: number): void {
    if (this.expirationTimeout) {
      clearTimeout(this.expirationTimeout);
    }

    const timeLeft = expiresAt - Date.now() - 30_000; // за 30 сек до истечения

    if (timeLeft <= 0) {
      this.handleTokenExpiration();
      return;
    }

    this.expirationTimeout = setTimeout(() => {
      this.handleTokenExpiration();
    }, timeLeft);
  }

  private handleTokenExpiration(): void {
    const event = new CustomEvent('token-expiring');
    window.dispatchEvent(event);
  }

  private async sendRequest(
    url: string,
    method: string = 'GET',
    body: any = null,
    params: Record<string, string> = {},
    headers: Record<string, string> = {}
  ): Promise<any> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    if (this.authToken && !url.includes('/login') && !url.includes('/register')) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.authToken}`
      };
    }

    const queryParams = new URLSearchParams(params).toString();
    const fullUrl = `${this.API_BASE_URL}${url}${queryParams ? `?${queryParams}` : ''}`;

    try {
      const response = await fetch(fullUrl, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  login(username: string, password: string): Observable<User> {
    return new Observable(observer => {
      this.sendRequest('/api/login', 'POST', null, { username, password })
        .then(response => {
          const user: User = {
            id: response.userId,
            email: response.email,
            username: response.username,
            firstName: response.firstName,
            lastName: response.lastName,
            role: response.role,
            status: response.status,
            registrationDate: new Date(response.registrationDate || Date.now()),
            telegramLink: response.telegramLink
          };
          // используем expires_in из ответа
          this.saveAuthData(user, response.access_token, response.refresh_token, response.expires_in);
          observer.next(user);
          observer.complete();
        })
        .catch(error => {
          observer.error({ error: { message: error.message || 'Login failed' } });
        });
    });
  }


  register(
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    telegramLink?: string
  ): Observable<User> {
    return new Observable(observer => {
      this.sendRequest(
        '/api/register',
        'POST',
        null,
        {
          email,
          password,
          username,
          first_name: firstName,
          last_name: lastName,
          telegram_link: telegramLink || ''
        }
      )
        .then(() => {
          this.login(username, password).subscribe({
            next: user => observer.next(user),
            error: err => observer.error(err)
          });
        })
        .catch(error => {
          observer.error({ error: { message: error.message || 'Registration failed' } });
        });
    });
  }

  logout(): Observable<void> {
    return new Observable(observer => {
      if (!this.authToken) {
        this.clearAuthData();
        observer.next();
        observer.complete();
        return;
      }

      this.sendRequest('/api/logout', 'POST')
        .then(() => {
          this.clearAuthData();
          this.router.navigate(['/login']);
          observer.next();
          observer.complete();
        })
        .catch(error => {
          console.error('Logout failed:', error);
          this.clearAuthData();
          this.router.navigate(['/login']);
          observer.next();
          observer.complete();
        });
    });
  }

  refreshAuthToken(): Observable<void> {
    if (!this.tokenRefreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return new Observable(observer => {
      this.sendRequest(
        '/api/refresh_token',
        'POST',
        null,
        { refresh_token: this.tokenRefreshToken! }
      )
        .then(response => {
          this.authToken = response.access_token;
          this.tokenRefreshToken = response.refresh_token;

          // используем expires_in из ответа
          const expiresAt = Date.now() + response.expires_in * 1000;

          const authData = localStorage.getItem('authData');
          if (authData) {
            const data = JSON.parse(authData);
            data.authToken = response.access_token;
            data.tokenRefreshToken = response.refresh_token;
            data.expiresAt = expiresAt;
            localStorage.setItem('authData', JSON.stringify(data));

            this.startTokenExpirationWatcher(expiresAt);
          }

          observer.next();
          observer.complete();
        })
        .catch(error => {
          console.error('Token refresh failed:', error);
          this.clearAuthData();
          observer.error(error);
        });
    });
  }

  getTokenTimeLeft(): number | null {
    const authData = localStorage.getItem('authData');
    if (!authData) return null;
    const { expiresAt } = JSON.parse(authData);
    if (!expiresAt) return null;
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }
}
