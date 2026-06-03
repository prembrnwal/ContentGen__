import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing! Check your .env file.');
}

const client = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

// Intercept auth calls for dev bypass
const originalGetSession = client.auth.getSession.bind(client.auth);
client.auth.getSession = async () => {
  if (localStorage.getItem('dev_bypass') === 'true') {
    return {
      data: {
        session: {
          access_token: 'mock-dev-token',
          user: {
            id: 'dev-user-id',
            email: 'dev@example.com',
          }
        }
      },
      error: null
    };
  }
  return originalGetSession();
};

const originalOnAuthStateChange = client.auth.onAuthStateChange.bind(client.auth);
client.auth.onAuthStateChange = (callback) => {
  if (localStorage.getItem('dev_bypass') === 'true') {
    // Fire callback immediately with mock session
    setTimeout(() => {
      callback('SIGNED_IN', {
        access_token: 'mock-dev-token',
        user: {
          id: 'dev-user-id',
          email: 'dev@example.com',
        }
      });
    }, 0);
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
  return originalOnAuthStateChange(callback);
};

const originalSignOut = client.auth.signOut.bind(client.auth);
client.auth.signOut = async () => {
  localStorage.removeItem('dev_bypass');
  const res = await originalSignOut();
  // Reload the page to clear any in-memory app state and reset auth flows
  window.location.reload();
  return res;
};

export const supabase = client;

