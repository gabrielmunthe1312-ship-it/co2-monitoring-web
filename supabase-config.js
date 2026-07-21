// === Konfigurasi Supabase ===
// Masukkan Supabase URL Anda di sini (Contoh: https://xxxx.supabase.co)
const SUPABASE_URL = "https://monitoring-co2-84021.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JwRGs5hgFVY7K-j85_UplA_8MwmPcfI";

// === Inisialisasi Supabase Client ===
let supabaseClient = null;

if (typeof supabase !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase Client terinisialisasi.");
  } catch (e) {
    console.error("Gagal menginisialisasi Supabase Client:", e);
  }
}
