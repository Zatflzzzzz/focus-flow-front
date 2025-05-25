import {Layouts} from './enums/layouts.enum';
import {Task} from './task.model';


export interface TaskState {
  id: number;
  name: string;
  typeOfLayout: Layouts;
  leftTaskStateId?: number;
  rightTaskStateId?: number;
  createdAt: Date;
  tasks: Task[];
}
