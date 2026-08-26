import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // Disponibiliza o Angular Router para toda a aplicação.
    provideRouter(routes),

    // Disponibiliza o HttpClient para realização de requisições HTTP.
    provideHttpClient()
  ]
};