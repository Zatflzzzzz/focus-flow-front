import {Category} from './enums/category.enum';
import {Priority} from './enums/priority.enum';


export interface Task {
  id: number;
  title: string;
  description: string;
  deadline: Date;
  category: Category;
  priority: Priority;
  higherPriorityTaskId?: number;
  lowerPriorityTaskId?: number;
  taskStateId: number;
  updatedAt: Date;
  createdAt: Date;
}
