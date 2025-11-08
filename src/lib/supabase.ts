import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anon) {
  // Soft warn in dev; avoids crashing build but surfaces missing envs
  // eslint-disable-next-line no-console
  console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

const fallback: any = {
  auth: {
    signInWithPassword: async () => { throw new Error('Supabase not configured'); },
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
  },
  from: () => ({ select: async () => { throw new Error('Supabase not configured'); } }),
};

export const supabase = (url && anon) ? createClient(url, anon) : (fallback as any);
