import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HabitService} from '../../services/habit/habit.service';
import {NotificationService} from '../../services/notification/notification.service';
import {Habit} from '../../models/habit.model';
import moment from 'moment';

@Component({
  selector: 'app-habits-list',
  templateUrl: './habits-list.component.html',
  styleUrls: ['./habits-list.component.css'],
  standalone:false
})
export class HabitsListComponent implements OnInit {
  habits: Habit[] = [];
  isLoading = true;
  showCreateHabitModal = false;

  newHabit = {
    title: '',
    description: '',
    timeToComplete: '08:00',
    dueDate: moment().add(30, 'days').format('YYYY-MM-DD')
  };

  constructor(
    private habitService: HabitService,
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.isLoading = true;
    this.habitService.getHabits().subscribe({
      next: (habits) => {
        this.habits = habits;
        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.show('Ошибка загрузки привычек', 'error');
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  viewHabitDetails(habitId: number): void {
    this.router.navigate(['/habits', habitId]);
  }

  createHabit(): void {
    if (!this.newHabit.title) {
      this.notificationService.show('Введите название привычки', 'error');
      return;
    }

    const habitData = {
      title: this.newHabit.title,
      description: this.newHabit.description,
      timeToComplete: this.newHabit.timeToComplete + ':00', // Добавляем секунды
      dueDate: this.newHabit.dueDate
    };

    this.habitService.createHabit(this.newHabit.title,this.newHabit.description,this.newHabit.timeToComplete + ':00', this.newHabit.dueDate).subscribe({
      next: () => {
        this.notificationService.show('Привычка успешно создана', 'success');
        this.showCreateHabitModal = false;
        this.resetHabitForm();
        this.loadHabits();
      },
      error: (err) => {
        this.notificationService.show('Ошибка при создании привычки', 'error');
        console.error('Error creating habit:', err);
      }
    });
  }

  cancelHabitCreation(): void {
    this.showCreateHabitModal = false;
    this.resetHabitForm();
  }

  private resetHabitForm(): void {
    this.newHabit = {
      title: '',
      description: '',
      timeToComplete: '08:00',
      dueDate: moment().add(30, 'days').format('YYYY-MM-DD')
    };
  }

  formatDate(dateString: string): string {
    return moment(dateString).format('DD.MM.YYYY');
  }
}
