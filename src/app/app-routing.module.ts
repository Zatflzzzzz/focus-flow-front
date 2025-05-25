import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectsListComponent} from './projects/projects-list/projects-list.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {AuthGuard} from './guards/auth.guard';
import {ProjectDetailsComponent} from './projects/project-details/project-details.component';
import {HabitsListComponent} from './habits/habits-list/habits-list.component';
import {HabitDetailsComponent} from './habits/habit-details/habit-details.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'projects',
    component: ProjectsListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'projects/:id',
    component: ProjectDetailsComponent,
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: 'habits', component: HabitsListComponent, canActivate: [AuthGuard] },
  { path: 'habits/:id', component: HabitDetailsComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
