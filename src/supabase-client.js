import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with your credentials
const supabaseUrl = "https://kzfmunxbdfdfxumerulj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6Zm11bnhiZGZkZnh1bWVydWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODI3ODAsImV4cCI6MjA2ODY1ODc4MH0.loX0aIS6RsXCO6_WlmmkvcHXgZH0WPlLR3exRAFXFA0";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;