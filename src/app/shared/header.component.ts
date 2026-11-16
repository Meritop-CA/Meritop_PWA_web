import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Encabezado común a todas las pantallas: logo de xtracash (lleva al inicio).
 * Fondo claro → logo_version_color.png. Sobre fondos de color se usa logo_version_blanca.png.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="hdr">
      <div class="hdr__bar">
        <a routerLink="/" class="hdr__logo" aria-label="xtracash · ir al inicio">
          <img class="hdr__partner" src="logo_version_color.png" alt="xtracash por Meritop" />
        </a>
      </div>
    </header>
  `,
  styles: [`
    .hdr { max-width: 1180px; margin: 0 auto; padding: 1.75rem 1.5rem 0; }
    .hdr__bar { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding: .4rem 0 1rem; }
    .hdr__partner { height: 80px; width: auto; display: block; }
    @media (max-width: 640px) {
      .hdr { padding-top: 1.25rem; }
      .hdr__partner { height: 56px; }
    }
  `]
})
export class HeaderComponent {}
