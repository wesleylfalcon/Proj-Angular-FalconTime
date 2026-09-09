// Core
import { Component, inject } from '@angular/core';

// Common
import { AsyncPipe } from '@angular/common';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Router
import { Router } from '@angular/router';

// RxJS
import { map } from 'rxjs';

// Interno
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, MatToolbarModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Finaliza a sessão e retorna para a tela de login.
   */
  async logout(): Promise<void> {
    await this.authService.signOut();

    await this.router.navigate(['/login']);
  }

  readonly userEmail$ = this.authService.session$.pipe(map((session) => session?.user.email ?? ''));
}
