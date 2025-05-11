import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ProjectService} from '../../services/project/project.service';
import {Project} from '../models/project.model';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.css'],
  standalone: false
})
export class ProjectsListComponent implements OnInit {
  projects: Project[] = [];
  newProjectName = '';
  showCreateForm = false;
  currentUserId = 1;

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projects = this.projectService.getProjects();
  }

  createProject(): void {
    if (this.newProjectName.trim()) {
      this.projectService.createProject(this.newProjectName, this.currentUserId);
      this.projects = this.projectService.getProjects();
      this.newProjectName = '';
      this.showCreateForm = false;
    }
  }

  deleteProject(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить проект?')) {
      this.projectService.deleteProject(id);
      this.projects = this.projectService.getProjects();
    }
  }

  navigateToProject(id: number): void {
    this.router.navigate(['/projects', id]);
  }
}
