// Core
import { Injectable } from '@angular/core';

// RxJS
import { BehaviorSubject } from 'rxjs';

// Supabase
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

// Interno
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly sessionSubject = new BehaviorSubject<Session | null>(null);

  readonly session$ = this.sessionSubject.asObservable();

  constructor() {
    void this.initializeSession();

    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      this.sessionSubject.next(session);
    });
  }

  /**
   * Recupera a sessão já existente no navegador.
   */
  private async initializeSession(): Promise<void> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    this.sessionSubject.next(data.session);
  }

  /**
   * Autentica o usuário com e-mail e senha.
   */
  async signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }

  /**
   * Finaliza a sessão do usuário atual.
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  /**
   * Retorna o usuário atualmente autenticado.
   */
  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return data.user;
  }
}