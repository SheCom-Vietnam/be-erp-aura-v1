const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SEVICE_KEY;

const supabase = createClient("https://ghukjxfokoeacobbajae.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0eHZzcmZ3bWJmeHNvZHd1dnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njc0MDE3NjgsImV4cCI6MTk4Mjk3Nzc2OH0.ZraLICYhlmsLyv7C40WbdQPmPr5-5aDAv5Y8W68d1lM");
module.exports = supabase;
