import { createClient } from '@supabase/supabase-js'
import { isDemoMode } from '../config/runtime'
const url=import.meta.env.VITE_SUPABASE_URL as string|undefined
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string|undefined
export const supabase=!isDemoMode?createClient(url!,key!):null
