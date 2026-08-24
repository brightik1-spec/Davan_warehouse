import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Kirish talab qilinadi' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await callerClient.auth.getUser(token);
  if (userErr || !userData?.user) return res.status(401).json({ error: "Login noto'g'ri" });

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: profile } = await admin.from('profiles').select('role').eq('id', userData.user.id).single();
  if (profile?.role !== 'admin') return res.status(403).json({ error: "Faqat admin o'chira oladi" });

  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId kerak' });
  if (userId === userData.user.id) return res.status(400).json({ error: "O'zingizni o'chira olmaysiz" });

  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) return res.status(400).json({ error: delErr.message });

  return res.status(200).json({ ok: true });
}
