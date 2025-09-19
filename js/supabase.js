// supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// --- CONFIGURA TU SUPABASE ---
const supabaseUrl = "https://vzxmcaxbqdrxahxfucuj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6eG1jYXhicWRyeGFoeGZ1Y3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzk1NjEsImV4cCI6MjA3MzgxNTU2MX0.iMeANU2EJUb9yZLFCbEYWHFDPzoHsgV59gdJC2O0a2g";

export const supabase = createClient(supabaseUrl, supabaseKey);
