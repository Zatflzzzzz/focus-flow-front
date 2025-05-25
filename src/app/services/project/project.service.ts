import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';
import {Project} from '../../models/project.model';
import {Layouts} from '../../models/enums/layouts.enum';
import {TaskState} from '../../models/task-state.model';
import {Task} from '../../models/task.model';
import {Priority} from '../../models/enums/priority.enum';
import {Category} from '../../models/enums/category.enum';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private gatewayUrl = 'http://localhost:3246';

  constructor(private http: HttpClient) {}

  // Project methods
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.gatewayUrl}/api/projects`);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.gatewayUrl}/api/projects/${id}`);
  }

  searchProjects(prefix: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.gatewayUrl}/api/projects`, {
      params: { prefix_name: prefix }
    }).pipe(
      catchError(error => {
        console.error('Search error:', error);
        return of([]);
      })
    );
  }

  createOrUpdateProject(id: number | null, name: string): Observable<Project> {
    const params: any = { project_name: name };
    if (id) {
      params.project_id = id.toString();
    }
    return this.http.put<Project>(`${this.gatewayUrl}/api/projects`, null, { params });
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/api/projects/${id}`);
  }

  getTaskStates(projectId: number): Observable<TaskState[]> {
    return this.http.get<TaskState[]>(
      `${this.gatewayUrl}/api/projects/${projectId}/tasks-states`
    ).pipe(
      catchError(error => {
        console.error('Error loading task states:', error);
        return of([]);
      })
    );
  }

  createTaskState(projectId: number, name: string, layout: Layouts): Observable<TaskState> {
    return this.http.post<TaskState>(
      `${this.gatewayUrl}/api/projects/${projectId}/tasks-states`,
      null,
      {
        params : {
          task_state_name: name,
          type_of_layout: layout
        }
      }
    ).pipe(
      catchError(error => {
        console.error('Error creating task state:', error);
        throw error;
      })
    );
  }

  updateTaskState(taskStateId: number, name: string, layout: Layouts | string): Observable<TaskState> {
    // Convert layout to string if it's an enum value
    const layoutString = typeof layout === 'string' ? layout : Layouts[layout];

    return this.http.patch<TaskState>(
      `${this.gatewayUrl}/api/tasks-states/${taskStateId}`,
      null,
      {
        params: {
          task_state_name: name,
          type_of_layout: layoutString
        }
      }
    ).pipe(
      catchError(error => {
        console.error('Error updating task state:', error);
        throw error;
      })
    );
  }

  changeTaskStatePosition(taskStateId: number, rightTaskStateId?: number): Observable<TaskState> {
    const params: any = {};
    if (rightTaskStateId) {
      params.right_task_state_id = rightTaskStateId;
    }
    return this.http.patch<TaskState>(
      `${this.gatewayUrl}/api/tasks-states/${taskStateId}/position/change`,
      null,
      { params }
    );
  }

  deleteTaskState(taskStateId: number): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/api/tasks-states/${taskStateId}`);
  }

  getTasks(taskStateId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.gatewayUrl}/api/task-state/${taskStateId}/tasks`);
  }

  createTask(
    taskStateId: number,
    title: string,
    description: string,
    deadline: string | Date,
    category: Category,
    priority: Priority
  ): Observable<Task> {
    // Форматируем дату в ISO 8601 без Z и без миллисекунд (LocalDateTime формат)
    const formatDeadline = (d: Date): string => {
      const pad = (n: number): string => n.toString().padStart(2, '0');

      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const deadlineStr = deadline instanceof Date ? formatDeadline(deadline) : deadline;

    return this.http.post<Task>(
      `${this.gatewayUrl}/api/task-state/${taskStateId}/tasks`,
      null,
      {
        params: {
          title,
          description,
          deadline: deadlineStr,
          category: category.toString(),
          priority: priority.toString()
        }
      }
    );
  }

  updateTask(
    taskId: number,
    title: string,
    description: string,
    deadline: Date,
    category: Category,
    priority: Priority
  ): Observable<Task> {
    const formatDeadline = (d: Date): string => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const formattedDeadline = formatDeadline(deadline);

    return this.http.patch<Task>(
      `${this.gatewayUrl}/api/tasks/${taskId}`,
      null,
      {
        params: {
          title: title.trim(),
          description: description || '',
          deadline: formattedDeadline,
          category: category.toString(),
          priority: priority.toString()
        }
      }
    ).pipe(
      catchError(error => {
        console.error('Error updating task:', error);
        throw error;
      })
    );
  }

  changeTaskPosition(taskId: number, lowerTaskId?: number): Observable<Task> {
    const params: any = {};
    if (lowerTaskId) {
      params.lower_task_id = lowerTaskId;
    }
    return this.http.patch<Task>(
      `${this.gatewayUrl}/api/tasks/${taskId}/position/change`,
      null,
      { params }
    );
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/api/tasks/${taskId}`);
  }
}
