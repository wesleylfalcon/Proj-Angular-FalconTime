// Core
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

// Router
import { provideRouter } from '@angular/router';

// Charts
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Material
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

// Interno
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),

    provideNativeDateAdapter(),

    {
      provide: MAT_DATE_LOCALE,
      useValue: 'pt-BR',
    },
  ],
};
