import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'Accept': 'application/json',
      },
    },
  }
)

// Cliente separado para el schema clickpet
export const supabaseClickpet = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'clickpet',
    },
    global: {
      headers: {
        'Accept': 'application/json',
      },
    },
  }
)