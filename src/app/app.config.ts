// Core
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

// Router
import { provideRouter } from '@angular/router';

// Charts
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Interno
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
  ],
};
