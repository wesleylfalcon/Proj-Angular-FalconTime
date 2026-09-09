// Core
import { inject } from '@angular/core';

// Router
import { CanActivateFn, Router } from '@angular/router';

// Interno
import { supabase } from '../supabase/supabase.client';

/**
 * Permite acesso às rotas protegidas
 * somente para usuários autenticados.
 */
export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);

  const { data, error } = await supabase.auth.getSession();

  if (!error && data.session) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
