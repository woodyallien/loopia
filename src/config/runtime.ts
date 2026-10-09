const configuredMode = import.meta.env.VITE_APP_MODE
export const hasSupabaseCredentials = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
export const isDemoMode = configuredMode !== 'production' || !hasSupabaseCredentials
