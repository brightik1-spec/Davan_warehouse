import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Kirish talab qilinadi' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1) Confirm the caller is a logged-in admin
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await callerClient.auth.getUser(token);
  if (userErr || !userData?.user) return res.status(401).json({ error: "Login noto'g'ri" });

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: profile } = await admin.from('profiles').select('role').eq('id', userData.user.id).single();
  if (profile?.role !== 'admin') return res.status(403).json({ error: 'Faqat admin foydalanuvchi qo\'sha oladi' });

  // 2) Create the new user with the service role (server-side only)
  const { email, password, full_name, role } = req.body || {};
  if (!email || !password || !full_name) return res.status(400).json({ error: "Ma'lumotlar to'liq emas" });

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name },
  });
  if (createErr) return res.status(400).json({ error: createErr.message });

  await admin.from('profiles').update({ role: role === 'admin' ? 'admin' : 'hodim', full_name, email })
    .eq('id', created.user.id);

  return res.status(200).json({ ok: true });
}
