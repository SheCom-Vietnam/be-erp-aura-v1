const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = 'https://ghukjxfokoeacobbajae.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWtqeGZva29lYWNvYmJhamFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM5NDc3MjcsImV4cCI6MTk3OTUyMzcyN30.LndnChFvtsHpCcF9WZTCP67SsaYzfmDEDJQAmlWgnWc';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
module.exports = supabase;
