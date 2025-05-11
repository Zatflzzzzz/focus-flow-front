import {Category} from './enums/category.enum';
import {Priority} from './enums/priority.enum';
import {TaskState} from './task-state.model';


export interface Task {
  id: number;
  title: string;
  description: string;
  deadline: Date;
  category: Category;
  priority: Priority;
  higherPriorityTask?: Task;
  lowerPriorityTask?: Task;
  taskState: TaskState;
  updatedAt: Date;
  createdAt: Date;
}
