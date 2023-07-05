const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SEVICE_KEY;

const supabase = createClient("https://ghukjxfokoeacobbajae.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWtqeGZva29lYWNvYmJhamFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY2Mzk0NzcyNywiZXhwIjoxOTc5NTIzNzI3fQ.I2l0n_mA16puKRDg2A4IIPwjKWuvaQeSB0CpMtTx7H4");
module.exports = supabase;
