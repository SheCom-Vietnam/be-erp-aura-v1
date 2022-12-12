const {createClient} = require('@supabase/supabase-js')
//Product
// const supabaseUrl = 'https://ghukjxfokoeacobbajae.supabase.co'
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWtqeGZva29lYWNvYmJhamFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM5NDc3MjcsImV4cCI6MTk3OTUyMzcyN30.LndnChFvtsHpCcF9WZTCP67SsaYzfmDEDJQAmlWgnWc'
// export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Staging
 const supabase = createClient(
  "https://wmysxhtwbtmjxrrczjuj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndteXN4aHR3YnRtanhycmN6anVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjkxOTkwMTQsImV4cCI6MTk4NDc3NTAxNH0.j43SS5xG9HbhvEX9vaVBSi7Az1FDclrYVj3_Z4WjG2c"
 );

module.exports = {
    supabase
};
