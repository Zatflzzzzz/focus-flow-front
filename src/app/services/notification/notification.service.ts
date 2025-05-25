// notification.service.ts
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications: any[] = [];
  private nextId = 0;

  getNotifications() {
    return this.notifications;
  }

  show(message: string, type: 'success' | 'error' = 'success') {
    const id = this.nextId++;
    const notification = {
      id,
      message,
      type,
      state: 'in'
    };
    this.notifications.push(notification);

    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  remove(id: number) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.state = 'void';
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 300); // Должно совпадать с длительностью анимации
    }
  }
}
