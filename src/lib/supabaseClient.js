import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xowegexcklulqyifmmnp.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvd2VnZXhja2x1bHF5aWZtbW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzczMDYsImV4cCI6MjA5MzMxMzMwNn0._JoopnpYYBeXDTyYBCAjUVs166PCnI6quNMX6itG-6A";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);