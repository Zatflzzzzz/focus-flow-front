import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications: {id: number, message: string, type: 'success' | 'error'}[] = [];
  private nextId = 0;

  show(message: string, type: 'success' | 'error' = 'success'): void {
    const id = this.nextId++;
    this.notifications.push({id, message, type});
    setTimeout(() => this.remove(id), 5000);
  }

  private remove(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
}
