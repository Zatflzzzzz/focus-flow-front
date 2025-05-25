// projects-list.component.ts
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ProjectService} from '../../services/project/project.service';
import {Project} from '../../models/project.model';
import {NotificationService} from '../../services/notification/notification.service';
import {AuthService} from '../../services/auth/auth.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.css'],
  standalone:false
})
export class ProjectsListComponent implements OnInit {
  projects: Project[] = [];
  newProjectName = '';
  newProjectDescription = '';
  showCreateForm = false;
  loading = false;
  searchTerm$ = new Subject<string>();
  filteredProjects: Project[] = [];

  constructor(
    private projectService: ProjectService,
    private router: Router,
    protected notificationService: NotificationService,
    private authService: AuthService,

  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = [...projects]; // Инициализируем filteredProjects
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  searchQuery: string = '';
  isSearching: boolean = false;

  applySearch(): void {
    if (this.searchQuery.trim()) {
      this.isSearching = true;
      this.loading = true; // Показываем индикатор загрузки

      this.projectService.searchProjects(this.searchQuery).subscribe({
        next: (projects) => {
          console.log(projects);
          this.filteredProjects = projects;
          this.isSearching = false;
          this.loading = false;
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    } else {
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.isSearching = false;
    this.filteredProjects = [...this.projects]; // Возвращаем полный список
  }

  private handleError(err: any): void {
    this.loading = false;
    if (err.status === 401) {
      this.notificationService.show('Сессия истекла. Пожалуйста, войдите снова.', 'error');
      this.authService.logout();
    } else {
      this.notificationService.show('Произошла ошибка', 'error');
    }
  }

  createProject(): void {
    if (this.newProjectName.trim()) {
      this.projectService.createOrUpdateProject(null, this.newProjectName).subscribe({
        next: () => {
          this.notificationService.show('Проект успешно создан', 'success');
          this.showCreateForm = false;
          this.newProjectName = '';
          this.loadProjects();
        },
        error: () => {
          this.notificationService.show('Ошибка при создании проекта', 'error');
        }
      });
    } else {
      this.notificationService.show('Введите название проекта', 'error');
    }
  }

  deleteProject(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить проект?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => {
          this.loadProjects();
          this.notificationService.show('Проект успешно удалён', 'success');
        },
        error: () => {
          this.notificationService.show('Ошибка при удалении проекта', 'error');
        }
      });
    }
  }

  navigateToProject(id: number): void {
    this.router.navigate(['/projects', id]);
  }

  getTaskCount(project: Project): number {
    if (!project.taskStates) return 0;
    return project.taskStates.reduce((sum, state) => sum + (state.tasks?.length || 0), 0);
  }

  getColumnCount(project: Project): number {
    return project.taskStates?.length || 0;
  }
}
