import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Mock client for development
export const createMockClient = () => {
  return {
    auth: {
      signInWithOAuth: async (options: any) => ({ data: { user: { id: "mock-user" } }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: { id: "mock-user" } }, error: null }),
    },
  };
};
