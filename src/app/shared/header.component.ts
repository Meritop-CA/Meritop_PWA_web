import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { currentBrand } from '../core/brand';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="hdr">
      <div class="hdr__bar">
        <a routerLink="/" class="hdr__logo" [attr.aria-label]="brand.name + ' · ir al inicio'">
          <img class="hdr__partner" [src]="brand.logo" [alt]="brand.alt" />
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
export class HeaderComponent {
  readonly brand = currentBrand;
}
