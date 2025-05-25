import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HabitService} from '../../services/habit/habit.service';
import {NotificationService} from '../../services/notification/notification.service';

import moment from 'moment';
import {Habit} from '../../models/habit.model';
import {HabitLog} from '../../models/habit-log.model';

interface CalendarDay {
  day: number;
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  logId?: number;
}

@Component({
  selector: 'app-habit-details',
  templateUrl: './habit-details.component.html',
  styleUrls: ['./habit-details.component.css'],
  standalone: false
})
export class HabitDetailsComponent implements OnInit {
  habit: Habit | null = null;
  logs: HabitLog[] = [];
  calendarDays: CalendarDay[] = [];
  isLoading = true;
  error: string | null = null;
  showEditModal = false;



  editedHabit = {
    title: '',
    description: '',
    timeToComplete: '',
    dueDate: ''
  };

  selectedDate = moment();
  weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private habitService: HabitService,
    public notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const habitId = this.route.snapshot.paramMap.get('id');
    if (habitId && !isNaN(+habitId)) {
      this.loadHabitDetails(+habitId);
    } else {
      this.error = 'Неверный ID привычки';
      this.isLoading = false;
    }
  }

  private loadHabitDetails(habitId: number): void {
    this.isLoading = true;

    this.habitService.getHabitById(habitId).subscribe({
      next: (habit) => {
        this.habit = habit;
        this.editedHabit = {
          title: habit.title,
          description: habit.description,
          timeToComplete: habit.timeToComplete.split(':').slice(0, 2).join(':'),
          dueDate: moment(habit.dueDate).format('YYYY-MM-DD')
        };
        this.loadHabitLogs(habitId);
      },
      error: (err) => this.handleError('Ошибка загрузки привычки', err)
    });
  }

  private loadHabitLogs(habitId: number): void {
    this.isLoading = true;

    this.habitService.getHabitLogs(habitId).subscribe({
      next: (logs) => {
        console.log('Raw logs from server:', logs);
        this.logs = logs.map(log => ({
          ...log,
          // Normalize the date format if needed
          scheduledDate: moment(log.scheduledDate).format('YYYY-MM-DDTHH:mm:ss')
        }));
        this.generateCalendar();
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError('Ошибка загрузки логов привычки', err);
        this.isLoading = false;
      }
    });
  }

  generateCalendar(): void {
    const startDate = this.selectedDate.clone().startOf('month');
    const daysInMonth = startDate.daysInMonth();
    const today = moment().format('YYYY-MM-DD');

    this.calendarDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = startDate.clone().date(day);
      const dateStr = date.format('YYYY-MM-DD');

      // Находим соответствующий лог
      const log = this.logs.find(l =>
        moment(l.scheduledDate).format('YYYY-MM-DD') === dateStr
      );

      this.calendarDays.push({
        day,
        date: dateStr,
        isCompleted: log ? log.completed : false, // Исправлено с log.isCompleted на log.completed
        isToday: today === dateStr,
        isFuture: moment(dateStr).isAfter(today),
        logId: log?.id
      });
    }
  }

  changeMonth(offset: number): void {
    this.selectedDate.add(offset, 'months');
    if (this.habit) {
      this.loadHabitLogs(this.habit.id); // снова загружаем логи для нового месяца
    }
  }

  isProcessing = false;

  toggleDay(day: CalendarDay): void {
    if (!this.habit || day.isFuture || !day.date) return;

    // Временно меняем состояние для мгновенного отклика UI
    day.isCompleted = !day.isCompleted;

    if (day.logId) {
      this.updateHabitLog(day.logId, day.isCompleted, day);
    } else {
      this.createHabitLog(day.date, day);
    }
  }

  private updateHabitLog(logId: number, isCompleted: boolean, day: CalendarDay): void {
    if (!this.habit) return;

    const logIndex = this.logs.findIndex(l => l.id === logId);
    if (logIndex === -1) return;

    const updateData = {
      scheduledDate: this.logs[logIndex].scheduledDate,
      completed: isCompleted,
      habitId: this.habit.id
    };

    this.habitService.updateHabitLog(logId, updateData).subscribe({
      next: (updatedLog) => {
        this.logs[logIndex] = updatedLog;
        // Явно обновляем состояние дня
        day.isCompleted = updatedLog.completed;
        day.logId = updatedLog.id;
      },
      error: (err) => {
        console.error('Update log error:', err);
        // Откатываем изменение при ошибке
        day.isCompleted = !isCompleted;
        this.handleError('Ошибка обновления лога', err);
      }
    });
  }

  private createHabitLog(date: string, day: CalendarDay): void {
    if (!this.habit) return;

    const scheduledDate = moment(date).format('YYYY-MM-DDTHH:mm:ss');

    this.habitService.createHabitLog(this.habit.id, {
      scheduledDate,
      completed: day.isCompleted // Используем текущее состояние дня
    }).subscribe({
      next: (newLog) => {
        this.logs = [...this.logs, newLog];
        day.logId = newLog.id;
        // Подтверждаем состояние после успешного создания
        day.isCompleted = newLog.completed;
      },
      error: (err) => {
        // Откатываем при ошибке
        day.isCompleted = !day.isCompleted;
        this.handleError('Ошибка сохранения лога', err);
      }
    });
  }

  updateHabit(): void {
    if (!this.habit) return;

    const habitData = {
      title: this.editedHabit.title,
      description: this.editedHabit.description,
      timeToComplete: this.editedHabit.timeToComplete + ':00', // ⬅️ только время HH:mm:ss
      dueDate: moment(this.editedHabit.dueDate).format('YYYY-MM-DDTHH:mm:ss') // ⬅️ datetime
    };

    this.habitService.updateHabit(this.habit.id, habitData).subscribe({
      next: (updatedHabit) => {
        this.habit = updatedHabit;
        this.showEditModal = false;
        this.notificationService.show('Привычка успешно обновлена', 'success');
      },
      error: (err) => this.handleError('Ошибка обновления привычки', err)
    });
  }

  deleteHabit(): void {
    if (!this.habit) return;

    if (confirm('Вы уверены, что хотите удалить эту привычку?')) {
      this.habitService.deleteHabit(this.habit.id).subscribe({
        next: () => {
          this.notificationService.show('Привычка удалена', 'success');
          this.router.navigate(['/habits']);
        },
        error: (err) => this.handleError('Ошибка удаления привычки', err)
      });
    }
  }

  formatDate(dateString: string): string {
    return moment(dateString).format('DD.MM.YYYY');
  }

  formatTime(timeString: string): string {
    return moment(timeString, 'HH:mm:ss').format('HH:mm');
  }

  getMonthName(): string {
    return this.selectedDate.format('MMMM YYYY');
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error = error.message || message;
    this.isLoading = false;
    this.notificationService.show(this.error!.toString(), 'error');
  }
}
