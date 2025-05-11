import {TaskState} from './task-state.model';

export interface Project {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  taskStates: TaskState[];
}
