import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {ProjectsListComponent} from './projects/projects-list/projects-list.component';
import {ProjectDetailsComponent} from './projects/project-details/project-details.component';

@NgModule({
  declarations: [
    AppComponent,
    ProjectsListComponent,
    ProjectDetailsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: ProjectsListComponent },
      { path: 'projects/:id', component: ProjectDetailsComponent },
      { path: '**', redirectTo: '' }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
