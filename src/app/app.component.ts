import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main class="page">
      <router-outlet />
    </main>
    <footer class="footer">© {{ anio }} Meritop</footer>
  `,
  styles: [`
    .page { position: relative; min-height: calc(100vh - 170px); display: flex; align-items: flex-start; justify-content: center; padding: 2.5rem 1.25rem 3rem; }
    .footer { text-align: center; color: var(--m-muted); font-size: var(--fs-texto-sm); font-weight: var(--fw-regular); padding: 1.2rem; }
  `]
})
export class AppComponent {
  anio = new Date().getFullYear();
}
