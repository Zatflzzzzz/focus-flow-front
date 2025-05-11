import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Project} from '../models/project.model';
import {Layouts} from '../models/enums/layouts.enum';
import {Priority} from '../models/enums/priority.enum';
import {Category} from '../models/enums/category.enum';
import {CategoryMap, LayoutMap, PriorityMap} from '../../services/enum-maps';
import {ProjectService} from '../../services/project/project.service';
import {NotificationService} from '../../services/notification/notification.service';
import {TaskState} from '../models/task-state.model';
import {Task} from '../models/task.model';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  standalone:false
})
export class ProjectDetailsComponent implements OnInit {
  project?: Project;

  // Для модальных окон
  showTaskStateModal = false;
  showTaskModal = false;
  showEditProjectModal = false;
  showTaskDetailsModal = false;
  showEditTaskStateModal = false;

  // Текущие выбранные элементы
  selectedState?: TaskState;
  selectedTask?: Task;

  // Формы
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

  // Маппинги enum
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
    protected notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadProject(id);
  }

  loadProject(id: number): void {
    this.project = this.projectService.getProjectById(id);
    if (!this.project) {
      this.router.navigate(['/']);
      this.notificationService.show('Проект не найден', 'error');
    } else {
      this.editProjectData.name = this.project.name;
    }
  }

  // Project methods
  updateProject(): void {
    if (this.project) {
      this.projectService.updateProject(this.project.id, this.editProjectData.name);
      this.notificationService.show('Проект успешно обновлён');
      this.loadProject(this.project.id);
      this.showEditProjectModal = false;
    }
  }

  // TaskState methods
  addTaskState(): void {
    if (this.project && this.newTaskState.name.trim()) {
      this.projectService.addTaskState(
        this.project.id,
        this.newTaskState.name,
        this.newTaskState.layout
      );
      this.notificationService.show('Колонка успешно добавлена');
      this.loadProject(this.project.id);
      this.resetTaskStateForm();
      this.showTaskStateModal = false;
    }
  }

  updateTaskState(): void {
    if (this.project && this.selectedState && this.editTaskState.name.trim()) {
      this.projectService.updateTaskState(
        this.project.id,
        this.selectedState.id,
        this.editTaskState.name,
        this.editTaskState.layout
      );
      this.notificationService.show('Колонка успешно обновлена');
      this.loadProject(this.project.id);
      this.showEditTaskStateModal = false;
    }
  }

  deleteTaskState(stateId: number): void {
    if (this.project && confirm('Удалить эту колонку и все задачи в ней?')) {
      this.projectService.deleteTaskState(this.project.id, stateId);
      this.notificationService.show('Колонка успешно удалена');
      this.loadProject(this.project.id);
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

  // Task methods
  addTask(): void {
    if (this.project && this.selectedState && this.newTask.title.trim()) {
      this.projectService.addTask(
        this.project.id,
        this.selectedState.id,
        this.newTask
      );
      this.notificationService.show('Задача успешно добавлена');
      this.loadProject(this.project.id);
      this.resetTaskForm();
      this.showTaskModal = false;
    }
  }

  updateTask(): void {
    if (this.project && this.selectedTask && this.editTask.title.trim()) {
      this.projectService.updateTask(
        this.project.id,
        this.selectedTask.taskState.id,
        this.selectedTask.id,
        this.editTask
      );
      this.notificationService.show('Задача успешно обновлена');
      this.loadProject(this.project.id);
      this.showTaskDetailsModal = false;
    }
  }

  deleteTask(stateId: number, taskId: number, event: Event): void {
    event.stopPropagation();
    if (this.project && confirm('Удалить эту задачу?')) {
      this.projectService.deleteTask(this.project.id, stateId, taskId);
      this.notificationService.show('Задача успешно удалена');
      this.loadProject(this.project.id);
    }
  }

  openTaskModal(state: TaskState): void {
    this.selectedState = state;
    this.resetTaskForm();
    this.showTaskModal = true;
  }

  openTaskDetails(task: Task): void {
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

  protected resetTaskStateForm(): void {
    this.newTaskState = {
      name: '',
      layout: Layouts.BOARD
    };
  }

  protected resetTaskForm(): void {
    this.newTask = {
      title: '',
      description: '',
      deadline: new Date(),
      priority: Priority.MEDIUM,
      category: Category.WORK
    };
  }
}
