// Core
import { Component, inject } from '@angular/core';

// Common
import { AsyncPipe } from '@angular/common';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

// Router
import { Router, RouterLink } from '@angular/router';

// RxJS
import { map } from 'rxjs';

// Interno
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    AsyncPipe,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
  ],
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

  readonly user$ = this.authService.session$.pipe(
    map((session) => {
      const user = session?.user;

      if (!user) {
        return null;
      }

      const email = user.email ?? '';

      const name =
        user.user_metadata?.['full_name'] ??
        user.user_metadata?.['name'] ??
        email.split('@')[0] ??
        'Usuário';

      const initials = this.getInitials(name);

      return {
        email,
        name,
        initials,

        avatarUrl: user.user_metadata?.['avatar_url'] ?? user.user_metadata?.['picture'] ?? null,
      };
    }),
  );

  /**
   * Retorna até duas iniciais para o avatar do usuário.
   */
  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) {
      return 'U';
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
