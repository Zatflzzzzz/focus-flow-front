import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';
import {Habit} from '../../models/habit.model';
import {HabitLog} from '../../models/habit-log.model';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private apiUrl = 'http://localhost:3246/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthParams(): HttpParams {
    const token = this.authService.getAuthToken();
    return new HttpParams().set('token', token || '');
  }

  private formatDateForRequest(date: Date | string): string {
    return moment(date).format('YYYY-MM-DD');
  }

  // Habit methods
  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(
      `${this.apiUrl}/habits`,
      { params: this.getAuthParams() }
    ).pipe(catchError(this.handleError));
  }

  getHabitById(habitId: number): Observable<Habit> {
    return this.http.get<Habit>(
      `${this.apiUrl}/habits/${habitId}`,
      { params: this.getAuthParams() }
    ).pipe(catchError(this.handleError));
  }

  createHabit(
    title: string,
    description: string,
    timeToComplete: string,
    dueDate: Date | string
  ): Observable<Habit> {
    const formattedTime = timeToComplete.includes(':')
      ? timeToComplete.split(':').length === 2
        ? `${timeToComplete}:00`
        : timeToComplete
      : '08:00:00';

    const params = this.getAuthParams()
      .append('title', title)
      .append('description', description)
      .append('time_to_complete', formattedTime)
      .append('due_date', moment(dueDate).format('YYYY-MM-DDTHH:mm:ss'));

    return this.http.post<Habit>(
      `${this.apiUrl}/habits`,
      null,
      { params }
    ).pipe(catchError(this.handleError));
  }

  updateHabit(habitId: number, habitData: Partial<Habit>): Observable<Habit> {
    const params = this.getAuthParams()
      .append('title', habitData.title || '')
      .append('description', habitData.description || '')
      .append('time_to_complete', habitData.timeToComplete || '08:00:00') // ⬅️ только время
      .append(
        'due_date',
        habitData.dueDate ? moment(habitData.dueDate).format('YYYY-MM-DDTHH:mm:ss') : ''
      );

    return this.http.patch<Habit>(
      `${this.apiUrl}/habits/${habitId}`,
      null,
      { params }
    ).pipe(catchError(this.handleError));
  }

  deleteHabit(habitId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/habits/${habitId}`,
      { params: this.getAuthParams() }
    ).pipe(catchError(this.handleError));
  }

  // HabitLog methods
  getHabitLogs(habitId: number): Observable<HabitLog[]> {
    return this.http.get<HabitLog[]>(
      `${this.apiUrl}/habit-logs/${habitId}`,
      { params: this.getAuthParams() }
    ).pipe(catchError(this.handleError));
  }

  createHabitLog(habitId: number, logData: Omit<HabitLog, 'id' | 'habitId'>): Observable<HabitLog> {
    const formattedDate = moment(logData.scheduledDate).format('YYYY-MM-DDTHH:mm:ss');

    const params = this.getAuthParams()
      .append('scheduled_date', formattedDate)
      .append('is_completed', logData.completed.toString()); // ✔️ Убрали habitId

    return this.http.post<HabitLog>(
      `${this.apiUrl}/habit-logs/${habitId}`, // ✔️ habitId только в URL
      null,
      { params }
    );
  }

  updateHabitLog(habitLogId: number, logData: Partial<HabitLog>): Observable<HabitLog> {
    const formattedDate = logData.scheduledDate
      ? moment(logData.scheduledDate).format('YYYY-MM-DDTHH:mm:ss')
      : '';

    const params = new HttpParams()
      .set('token', this.authService.getAuthToken() || '')
      .set('scheduled_date', formattedDate)
      .set('is_completed', logData.completed?.toString() || 'false')
      .set('habit_id', logData.habitId?.toString() || ''); // Add habit_id parameter

    return this.http.patch<HabitLog>(
      `${this.apiUrl}/habit-logs/${habitLogId}`,
      null,
      { params }
    ).pipe(catchError(this.handleError));
  }

  deleteHabitLog(habitLogId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/habit-logs/${habitLogId}`,
      { params: this.getAuthParams() }
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error.error?.error_description || 'Произошла ошибка. Пожалуйста, попробуйте снова.'));
  }
}
