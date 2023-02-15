const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SEVICE_KEY;
console.log(supabaseUrl);
// console.log(supabaseAnonKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);
module.exports = supabase;
