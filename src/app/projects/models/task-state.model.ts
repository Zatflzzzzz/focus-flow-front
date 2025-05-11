import {Layouts} from './enums/layouts.enum';
import {Project} from './project.model';
import {Task} from './task.model';


export interface TaskState {
  id: number;
  name: string;
  typeOfLayout: Layouts;
  leftTaskState?: TaskState;
  rightTaskState?: TaskState;
  createdAt: Date;
  project: Project;
  tasks: Task[];
}
