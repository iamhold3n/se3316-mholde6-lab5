import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuilderComponent } from './builder/builder.component';
import { SavedComponent } from './saved/saved.component';

const routes: Routes = [
  { path: '', redirectTo: '/builder', pathMatch: 'full' },
  { path: 'builder', component: BuilderComponent },
  { path: 'saved', component: SavedComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
