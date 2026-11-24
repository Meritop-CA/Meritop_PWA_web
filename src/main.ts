import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { currentBrand } from './app/core/brand';

document.querySelector<HTMLLinkElement>('#brand-favicon')!.href = currentBrand.favicon;

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
