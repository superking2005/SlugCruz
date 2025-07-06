import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hlwgpwqdviwtwqnuhyee.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd2dwd3Fkdml3dHdxbnVoeWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2ODQ5NjIsImV4cCI6MjA2NzI2MDk2Mn0.IefZhUj-LFK7znoAGALJdAKB2FJpOPg-0ZyODYoiXHk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
