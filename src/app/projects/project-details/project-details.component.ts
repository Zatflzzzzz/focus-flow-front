import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Project} from '../../models/project.model';
import {Layouts} from '../../models/enums/layouts.enum';
import {Priority} from '../../models/enums/priority.enum';
import {Category} from '../../models/enums/category.enum';
import {CategoryMap, LayoutMap, PriorityMap} from '../../services/enum-maps';
import {ProjectService} from '../../services/project/project.service';
import {NotificationService} from '../../services/notification/notification.service';
import {TaskState} from '../../models/task-state.model';
import {Task} from '../../models/task.model';
import {CdkDragDrop, CdkDragStart, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  standalone: false
})
export class ProjectDetailsComponent implements OnInit {
  project?: Project;
  taskStates: TaskState[] = [];
  loading = false;
  isDraggingStates = false;
  isDraggingTasks = false;

  // For modals
  showTaskStateModal = false;
  showTaskModal = false;
  showEditProjectModal = false;
  showTaskDetailsModal = false;
  showEditTaskStateModal = false;

  // Current selected items
  selectedState?: TaskState;
  selectedTask?: Task;

  // Forms
  newTaskState = {
    name: '',
    layout: Layouts.BOARD
  };

  editTaskState = {
    name: '',
    layout: Layouts.BOARD
  };

  newTask = {
    title: '',
    description: '',
    deadline: new Date(),
    priority: Priority.MEDIUM,
    category: Category.WORK
  };

  editTask = {
    title: '',
    description: '',
    deadline: new Date(),
    priority: Priority.MEDIUM,
    category: Category.WORK
  };

  editProjectData = {
    name: ''
  };

  // Enum mappings
  layouts = Object.values(Layouts);
  priorities = Object.values(Priority);
  categories = Object.values(Category);
  layoutMap = LayoutMap;
  priorityMap = PriorityMap;
  categoryMap = CategoryMap;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    protected notificationService: NotificationService,
    private authService: AuthService
  ) {}

  onTaskStateDrop(event: CdkDragDrop<TaskState[]>): void {
    this.isDraggingStates = false;
    document.querySelector('.task-states-container')?.classList.remove('drag-active');

    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const previousOrder = [...this.taskStates];
    moveItemInArray(this.taskStates, event.previousIndex, event.currentIndex);

    const movedState = this.taskStates[event.currentIndex];
    const rightStateId = event.currentIndex < this.taskStates.length - 1
      ? this.taskStates[event.currentIndex + 1].id
      : undefined;

    this.projectService.changeTaskStatePosition(movedState.id, rightStateId).subscribe({
      error: () => {
        this.taskStates = previousOrder;
        this.notificationService.show('Ошибка при перемещении колонки', 'error');
      }
    });
  }

  getConnectedTaskLists(): string[] {
    return this.taskStates.map(state => `tasks-${state.id}`);
  }

  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    this.isDraggingTasks = false;

    if (event.previousContainer === event.container &&
      event.previousIndex === event.currentIndex) {
      return;
    }

    const previousContainerId = +event.previousContainer.id.replace('tasks-', '');
    const currentContainerId = +event.container.id.replace('tasks-', '');

    const previousState = this.taskStates.find(s => s.id === previousContainerId);
    const currentState = this.taskStates.find(s => s.id === currentContainerId);

    if (!previousState || !currentState) return;

    const previousTasks = [...previousState.tasks || []];
    const currentTasks = [...currentState.tasks || []];

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const movedTask = event.container.data[event.currentIndex];
      movedTask.taskStateId = currentContainerId;
    }

    const taskId = event.container.data[event.currentIndex].id;
    const lowerTaskId = event.currentIndex < event.container.data.length - 1
      ? event.container.data[event.currentIndex + 1].id
      : undefined;

    this.projectService.changeTaskPosition(taskId, lowerTaskId).subscribe({
      error: () => {
        if (previousState) previousState.tasks = previousTasks;
        if (currentState) currentState.tasks = currentTasks;
        this.notificationService.show('Ошибка при перемещении задачи', 'error');
      }
    });
  }

  onDragStarted(event: CdkDragStart, type: 'state' | 'task'): void {
    if (type === 'state') {
      this.isDraggingStates = true;
      // Добавляем класс для анимации
      document.querySelector('.task-states-container')?.classList.add('drag-active');
    } else {
      this.isDraggingTasks = true;
    }
  }

  onDragEnded(type: 'state' | 'task'): void {
    if (type === 'state') {
      this.isDraggingStates = false;
      // Удаляем класс для анимации
      document.querySelector('.task-states-container')?.classList.remove('drag-active');
    } else {
      this.isDraggingTasks = false;
    }
  }

  // Остальные методы остаются без изменений
  loadProject(id: number): void {
    this.loading = true;
    this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        this.project = project;
        this.editProjectData.name = project.name;
        this.loadTaskStates(project.id);
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  loadTaskStates(projectId: number): void {
    this.projectService.getTaskStates(projectId).subscribe({
      next: (taskStates) => {
        this.taskStates = taskStates
          .filter(state => state.id !== undefined && state.id !== null)
          .map(state => ({ ...state, tasks: [] }));
        this.loadTasksForAllStates();
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  loadTasksForAllStates(): void {
    this.taskStates.forEach(state => {
      if (state?.id != null) {
        this.loadTasks(state.id);
      } else {
        console.warn('TaskState ID is invalid:', state);
      }
    });
  }

  loadTasks(taskStateId: number | undefined): void {
    if (!taskStateId) {
      console.warn('Попытка загрузить задачи для колонки с несуществующим ID');
      return;
    }
    this.projectService.getTasks(taskStateId).subscribe({
      next: (tasks) => {
        this.taskStates = this.taskStates.map(state =>
          state.id === taskStateId ? { ...state, tasks } : state
        );
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  addTaskState(): void {
    if (this.project && this.newTaskState.name.trim()) {
      this.projectService.createTaskState(
        this.project.id,
        this.newTaskState.name,
        this.newTaskState.layout
      ).subscribe({
        next: (newState) => {
          this.notificationService.show('Колонка успешно добавлена', 'success');
          // Add the new state to our local array
          this.taskStates = [...this.taskStates, newState];
          this.resetTaskStateForm();
          this.showTaskStateModal = false;
        },
        error: () => {
          this.notificationService.show('Ошибка при добавлении колонки', 'error');
        }
      });
    }
  }

  addTask(): void {
    if (this.selectedState && this.newTask.title.trim()) {
      // Преобразуем строку даты в объект Date перед отправкой
      const deadlineDate = new Date(this.newTask.deadline);

      this.projectService.createTask(
        this.selectedState.id,
        this.newTask.title,
        this.newTask.description,
        deadlineDate,  // Передаем объект Date
        this.newTask.category,
        this.newTask.priority
      ).subscribe({
        next: () => {
          this.notificationService.show('Задача успешно добавлена', 'success');
          this.loadTasks(this.selectedState!.id);
          this.resetTaskForm();
          this.showTaskModal = false;
        },
        error: (err) => {  // Добавлен параметр err для отладки
          console.error('Error adding task:', err);
          this.notificationService.show('Ошибка при добавлении задачи', 'error');
        }
      });
    }
  }

  updateProject(): void {
    if (this.project) {
      this.projectService.createOrUpdateProject(this.project.id, this.editProjectData.name).subscribe({
        next: () => {
          this.notificationService.show('Проект успешно обновлён', 'success');
          this.loadProject(this.project!.id);
          this.showEditProjectModal = false;
        },
        error: () => {
          this.notificationService.show('Ошибка при обновлении проекта', 'error');
        }
      });
    }
  }

  updateTaskState(): void {
    if (this.project && this.selectedState && this.editTaskState.name.trim()) {
      if (!this.editTaskState.layout) {
        this.notificationService.show('Тип отображения обязателен', 'error');
        return;
      }
      const nameChanged = this.editTaskState.name !== this.selectedState.name;
      const layoutChanged = this.editTaskState.layout !== this.selectedState.typeOfLayout;

      // Если ничего не изменилось, просто закрываем модальное окно
      if (!nameChanged && !layoutChanged) {
        this.showEditTaskStateModal = false;
        return;
      }

      // Проверка на дублирование имени (на фронте)
      const isDuplicate = this.taskStates.some(
        s =>
          s.id !== this.selectedState!.id &&
          s.name.trim().toLowerCase() === this.editTaskState.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        this.notificationService.show('Колонка с таким именем уже существует', 'error');
        return;
      }

      this.editTaskState.name = this.editTaskState.name.trim();

      // Ensure layout is sent as a string
      const layoutString = Layouts[this.editTaskState.layout] || this.editTaskState.layout.toString();

      this.projectService.updateTaskState(
        this.selectedState.id,
        this.editTaskState.name.trim(),
        layoutString
      ).subscribe({
        next: () => {
          this.notificationService.show('Колонка успешно обновлена', 'success');
          this.loadTaskStates(this.project!.id);
          this.showEditTaskStateModal = false;
        },
        error: (err) => {
          // Показывать причину ошибки с сервера, если есть
          const msg = err?.error?.message || 'Ошибка при обновлении колонки';
          this.notificationService.show(msg, 'error');
        }
      });
    } else {
      this.notificationService.show('Название колонки не может быть пустым', 'error');
    }
  }

  deleteTaskState(stateId: number): void {
    if (this.project && confirm('Удалить эту колонку и все задачи в ней?')) {
      this.projectService.deleteTaskState(stateId).subscribe({
        next: () => {
          this.notificationService.show('Колонка успешно удалена', 'success');
          this.loadTaskStates(this.project!.id);
        },
        error: () => {
          this.notificationService.show('Ошибка при удалении колонки', 'error');
        }
      });
    }
  }

  openEditTaskStateModal(state: TaskState): void {
    this.selectedState = state;
    this.editTaskState = {
      name: state.name,
      layout: state.typeOfLayout
    };
    this.showEditTaskStateModal = true;
  }

  updateTask(): void {
    if (this.project && this.selectedTask && this.editTask.title.trim()) {
      // Ensure data is valid before calling the service
      const deadlineDate = new Date(this.editTask.deadline);
      if (isNaN(deadlineDate.getTime())) {
        this.notificationService.show('Некорректная дата дедлайна', 'error');
        return;
      }

      this.projectService.updateTask(
        this.selectedTask.id,
        this.editTask.title,
        this.editTask.description,
        deadlineDate,
        this.editTask.category,
        this.editTask.priority
      ).subscribe({
        next: (updatedTask) => {
          this.notificationService.show('Задача успешно обновлена', 'success');

          // Обновляем задачу локально без перезагрузки
          this.taskStates = this.taskStates.map(state => {
            if (!state.tasks) return state;

            const updatedTasks = state.tasks.map(task =>
              task.id === updatedTask.id ? updatedTask : task
            );

            return { ...state, tasks: updatedTasks };
          });

          this.showTaskDetailsModal = false;
        },
        error: (err) => {
          console.error('Error updating task:', err);
          this.notificationService.show('Ошибка при обновлении задачи', 'error');
        }
      });
    }
  }

  deleteTask(taskId: number, event: Event): void {
    event.stopPropagation(); // Prevent parent click handlers from being triggered
    if (confirm('Удалить эту задачу?')) {
      const task = this.taskStates
        .flatMap(state => state.tasks || [])
        .find(t => t.id === taskId);

      this.projectService.deleteTask(taskId).subscribe({
        next: () => {
          this.notificationService.show('Задача успешно удалена', 'success');
          if (task) {
            this.loadTasks(task.taskStateId); // Reload tasks for the affected state
          }
        },
        error: () => {
          this.notificationService.show('Ошибка при удалении задачи', 'error');
        }
      });
    }
  }

  openTaskModal(state: TaskState): void {
    this.selectedState = state;
    this.resetTaskForm();
    this.showTaskModal = true;
  }

  openTaskDetails(event: MouseEvent, task: Task) {
    if (this.isDraggingStates || this.isDraggingTasks) {
      return;
    }

    this.selectedTask = task;
    this.editTask = {
      title: task.title,
      description: task.description,
      deadline: new Date(task.deadline),
      priority: task.priority,
      category: task.category
    };
    this.showTaskDetailsModal = true;
  }

  resetTaskStateForm(): void {
    this.newTaskState = {
      name: '',
      layout: Layouts.BOARD
    };
  }

  resetTaskForm(): void {
    this.newTask = {
      title: '',
      description: '',
      deadline: new Date(),
      priority: Priority.MEDIUM,
      category: Category.WORK
    };
  }

  private handleError(err: any): void {
    this.loading = false;
    if (err.status === 401) {
      this.notificationService.show('Сессия истекла. Пожалуйста, войдите снова.', 'error');
      this.authService.logout();
    } else {
      this.notificationService.show('Ошибка при загрузке данных', 'error');
    }
  }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadProject(id);
  }
}
