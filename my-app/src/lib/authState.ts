import { shallowRef } from 'vue';
import { supabase } from './supabaseClient';

export const currentUser = shallowRef<null | { id: string; email: string }>(null);
export const authReady = shallowRef(false);

export async function initAuth() {
  const { data } = await supabase.auth.getUser();
  currentUser.value = data.user ? { id: data.user.id, email: data.user.email! } : null;
  authReady.value = true;

  // keep in sync with auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser.value = session?.user ? { id: session.user.id, email: session.user.email! } : null;
  });
}
