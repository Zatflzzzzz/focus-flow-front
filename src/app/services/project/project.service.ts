import {Injectable} from '@angular/core';
import {Project} from '../../projects/models/project.model';
import {Layouts} from '../../projects/models/enums/layouts.enum';
import {TaskState} from '../../projects/models/task-state.model';
import {Task} from '../../projects/models/task.model';
import {Priority} from '../../projects/models/enums/priority.enum';
import {Category} from '../../projects/models/enums/category.enum';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: Project[] = [];
  private lastId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    const sampleProject: Project = {
      id: 1,
      name: 'Мой первый проект',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      taskStates: [
        {
          id: 1,
          name: 'To Do',
          typeOfLayout: Layouts.BOARD,
          createdAt: new Date(),
          project: null as any,
          tasks: []
        },
        {
          id: 2,
          name: 'In Progress',
          typeOfLayout: Layouts.BOARD,
          createdAt: new Date(),
          project: null as any,
          tasks: []
        }
      ]
    };
    this.projects.push(sampleProject);
    this.lastId = 2;
  }

  // Project methods
  getProjects(): Project[] {
    return this.projects;
  }

  getProjectById(id: number): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  createProject(name: string, userId: number): Project {
    const newProject: Project = {
      id: ++this.lastId,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      taskStates: []
    };
    this.projects.push(newProject);
    return newProject;
  }

  updateProject(id: number, name: string): Project | undefined {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      project.name = name;
      project.updatedAt = new Date();
      return project;
    }
    return undefined;
  }

  deleteProject(id: number): boolean {
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects.splice(index, 1);
      return true;
    }
    return false;
  }

  // TaskState methods
  addTaskState(projectId: number, name: string, layout: Layouts): TaskState | undefined {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return undefined;

    const newTaskState: TaskState = {
      id: ++this.lastId,
      name,
      typeOfLayout: layout,
      createdAt: new Date(),
      project: project,
      tasks: []
    };
    project.taskStates.push(newTaskState);
    project.updatedAt = new Date();
    return newTaskState;
  }

  updateTaskState(projectId: number, stateId: number, name: string, layout: Layouts): TaskState | undefined {
    const state = this.projects
      .find(p => p.id === projectId)
      ?.taskStates.find(ts => ts.id === stateId);

    if (state) {
      state.name = name;
      state.typeOfLayout = layout; // ← Добавлено обновление layout
      return state;
    }
    return undefined;
  }


  deleteTaskState(projectId: number, stateId: number): boolean {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return false;

    const index = project.taskStates.findIndex(ts => ts.id === stateId);
    if (index !== -1) {
      project.taskStates.splice(index, 1);
      project.updatedAt = new Date();
      return true;
    }
    return false;
  }

  // Task methods
  addTask(projectId: number, stateId: number, task: Omit<Task, 'id' | 'taskState' | 'createdAt' | 'updatedAt'>): Task | undefined {
    const state = this.projects
      .find(p => p.id === projectId)
      ?.taskStates.find(ts => ts.id === stateId);

    if (!state) return undefined;

    const newTask: Task = {
      id: ++this.lastId,
      ...task,
      taskState: state,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    state.tasks.push(newTask);
    return newTask;
  }

  updateTask(
    projectId: number, stateId: number, taskId: number, updatedData: {
      title: string;
      description: string;
      deadline: Date;
      priority: Priority;
      category: Category;
    } ): Task | undefined {
    const task = this.projects
      .find(p => p.id === projectId)
      ?.taskStates.find(ts => ts.id === stateId)
      ?.tasks.find(t => t.id === taskId);

    if (task) {
      task.title = updatedData.title;
      task.description = updatedData.description;
      task.deadline = updatedData.deadline;
      task.priority = updatedData.priority;
      task.category = updatedData.category;
      task.updatedAt = new Date();
      return task;
    }
    return undefined;
  }


  deleteTask(projectId: number, stateId: number, taskId: number): boolean {
    const state = this.projects
      .find(p => p.id === projectId)
      ?.taskStates.find(ts => ts.id === stateId);

    if (!state) return false;

    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      state.tasks.splice(index, 1);
      return true;
    }
    return false;
  }
}
