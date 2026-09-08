// Core
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

// HTTP
import { provideHttpClient } from '@angular/common/http';

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
    provideHttpClient(),
    provideCharts(withDefaultRegisterables()),
  ],
};
