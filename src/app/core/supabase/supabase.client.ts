// Supabase
import { createClient } from '@supabase/supabase-js';

// Environment
import { environment } from '../../../environments/environment';

/**
 * Cliente compartilhado utilizado para comunicação
 * com os serviços do Supabase.
 */
export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabasePublishableKey,
);