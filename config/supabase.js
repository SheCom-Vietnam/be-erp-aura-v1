const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SEVICE_KEY;
console.log(supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);
module.exports = supabase;
