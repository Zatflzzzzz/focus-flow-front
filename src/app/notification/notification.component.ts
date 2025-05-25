// notification.component.ts
import {Component} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {NotificationService} from '../services/notification/notification.service';

@Component({
  selector: 'app-notification',
  standalone: false,
  template: `
    <div class="notification-container">
      <div *ngFor="let notification of notificationService.getNotifications()"
           [@notificationState]="notification.state"
           class="notification {{notification.type}}">
        {{notification.message}}
        <button (click)="close(notification.id)"></button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    .notification {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      color: white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.16);
      position: relative;
      overflow: hidden;
    }
    .success {
      background-color: #4CAF50;
    }
    .error {
      background-color: #f44336;
    }
    button {
      position: absolute;
      top: 5px;
      right: 5px;
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 16px;
    }
  `],
  animations: [
    trigger('notificationState', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('in', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('void => in', animate('300ms ease-out')),
      transition('in => void', animate('300ms ease-in'))
    ])
  ]
})
export class NotificationComponent {
  constructor(public notificationService: NotificationService) {}

  close(id: number) {
    this.notificationService.remove(id);
  }
}
