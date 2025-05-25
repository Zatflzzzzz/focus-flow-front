import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {ProjectsListComponent} from './projects/projects-list/projects-list.component';
import {AuthGuard} from './guards/auth.guard';
import {AuthService} from './services/auth/auth.service';
import {AppRoutingModule} from './app-routing.module';
import {ProjectDetailsComponent} from './projects/project-details/project-details.component';
import {NotificationComponent} from './notification/notification.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HabitsListComponent} from './habits/habits-list/habits-list.component';
import {HabitDetailsComponent} from './habits/habit-details/habit-details.component';
import {CdkDrag, CdkDragHandle, CdkDropList, CdkDropListGroup} from '@angular/cdk/drag-drop';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AuthInterceptor} from './services/project/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProjectsListComponent,
    ProjectDetailsComponent,
    NotificationComponent,
    HabitsListComponent,
    HabitDetailsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CdkDropList,
    HttpClientModule,
    CdkDropListGroup,
    CdkDrag,
    CdkDragHandle
  ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
