import {TaskState} from "./task-state.model";

export interface Project {
  id: number;
  name: string;
  createdAt?: Date;   // можно оставить как опциональное
  updatedAt?: Date;   // можно оставить как опциональное
  userId: string;
  taskStates?: TaskState[];

  create_at: string;  // изменено на create_at (как в API)
  update_at: string;
}
