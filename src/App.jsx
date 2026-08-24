import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, ArrowDownCircle, ArrowUpCircle, LayoutDashboard, Search, AlertTriangle, Plus, X, Trash2, ClipboardList, TrendingUp, Boxes, LogOut, ShieldCheck, Users } from 'lucide-react';
import { supabase } from './supabaseClient';

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');`;

const COLORS = {
  bg: '#f3f1ec', surface: '#ffffff', ink: '#1c2430', inkSoft: '#5b6472',
  line: '#e2ddd2', amber: '#dc8a1f', amberDeep: '#a5620f', teal: '#2f6f63',
  rust: '#a13d2b', navy: '#22314a',
};
const CATEGORY_COLORS = ['#dc8a1f', '#2f6f63', '#22314a', '#a13d2b', '#6b5b95', '#4a7a8c'];
const todayISO = () => new Date().toISOString().slice(0, 10);

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 7, border: `1px solid ${COLORS.line}`,
  fontFamily: 'Inter', fontSize: 14, color: COLORS.ink, marginBottom: 12, boxSizing: 'border-box', background: '#faf9f6',
};
const labelStyle = { fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: COLORS.inkSoft, marginBottom: 5, display: 'block' };

function PrimaryButton({ children, onClick, tone = 'navy', type = 'button', disabled }) {
  const bg = { navy: COLORS.navy, amber: COLORS.amber, rust: COLORS.rust }[tone];
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#c9c4b8' : bg, color: '#fff', border: 'none', borderRadius: 7,
      padding: '10px 18px', fontFamily: 'Inter', fontWeight: 700, fontSize: 13.5,
      cursor: disabled ? 'not-allowed' : 'pointer', width: '100%', letterSpacing: 0.2,
    }}>{children}</button>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone = 'ink' }) {
  const toneColor = { ink: COLORS.ink, amber: COLORS.amberDeep, teal: COLORS.teal, rust: COLORS.rust }[tone];
  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${toneColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={toneColor} />
        </div>
        <span style={{ fontFamily: 'Inter', fontSize: 12.5, color: COLORS.inkSoft, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 26, fontWeight: 700, color: COLORS.ink, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'Inter', fontSize: 12, color: COLORS.inkSoft }}>{sub}</div>}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '10px 14px',
      borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? COLORS.navy : 'transparent',
      color: active ? '#fff' : COLORS.inkSoft, fontFamily: 'Inter', fontSize: 14, fontWeight: 600,
    }}>
      <Icon size={17} /><span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && <span style={{ background: active ? '#ffffff33' : COLORS.rust, color: '#fff', fontSize: 11, borderRadius: 999, padding: '1px 7px', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{badge}</span>}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#1c243088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: COLORS.surface, borderRadius: 12, padding: 24, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px #1c243033', border: `1px solid ${COLORS.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'Oswald', fontSize: 19, color: COLORS.ink, margin: 0, textTransform: 'uppercase' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginScreen() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
    setLoading(false);
    if (error) setError("Login yoki parol noto'g'ri");
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', padding: 16 }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: '32px 28px', width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, justifyContent: 'center' }}>
          <Boxes size={24} color={COLORS.amberDeep} />
          <span style={{ fontFamily: 'Oswald', fontSize: 19, fontWeight: 600 }}>OMBORXONA</span>
        </div>
        {error && <div style={{ background: '#a13d2b12', color: COLORS.rust, fontSize: 12.5, padding: '8px 12px', borderRadius: 7, marginBottom: 14, fontWeight: 600 }}>{error}</div>}
        <form onSubmit={submit}>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoFocus />
          <label style={labelStyle}>Parol</label>
          <input style={inputStyle} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <PrimaryButton type="submit" disabled={loading}>{loading ? 'Kirilmoqda...' : 'Kirish'}</PrimaryButton>
        </form>
        <p style={{ fontSize: 11.5, color: COLORS.inkSoft, textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
          Hisobingiz yo'qmi? Admin sizga Supabase orqali email/parol yaratib beradi.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Barchasi');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showTxModal, setShowTxModal] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [toast, setToast] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', unit: 'dona', quantity: '', minStock: '', price: '' });
  const [txForm, setTxForm] = useState({ qty: '', note: '' });
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'hodim' });
  const [employees, setEmployees] = useState([]);
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  const loadData = useCallback(async () => {
    const { data: p } = await supabase.from('products').select('*').order('name');
    const { data: t } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(200);
    setProducts(p || []);
    setTransactions(t || []);
  }, []);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  const loadEmployees = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    setEmployees(data || []);
  }, []);

  useEffect(() => { if (session && profile?.role === 'admin') loadEmployees(); }, [session, profile, loadEmployees]);

  async function handleAddUser(e) {
    e.preventDefault();
    setUserError(''); setUserLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const res = await fetch('/api/create-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session.access_token}` },
      body: JSON.stringify(newUser),
    });
    const result = await res.json();
    setUserLoading(false);
    if (!res.ok) { setUserError(result.error || 'Xatolik yuz berdi'); return; }
    setNewUser({ email: '', password: '', full_name: '', role: 'hodim' });
    setShowAddUser(false); setToast("Foydalanuvchi qo'shildi"); loadEmployees();
  }

  async function handleDeleteUser(userId) {
    const { data: sessionData } = await supabase.auth.getSession();
    const res = await fetch('/api/delete-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session.access_token}` },
      body: JSON.stringify({ userId }),
    });
    const result = await res.json();
    if (!res.ok) { setToast(result.error || 'Xatolik'); return; }
    setToast("Foydalanuvchi o'chirildi"); loadEmployees();
  }

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2400); return () => clearTimeout(t); } }, [toast]);

  const isAdmin = profile?.role === 'admin';

  const categories = useMemo(() => ['Barchasi', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const filteredProducts = useMemo(() => products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'Barchasi' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  }), [products, search, categoryFilter]);
  const lowStock = useMemo(() => products.filter(p => p.quantity <= p.min_stock), [products]);
  const totalValue = useMemo(() => products.reduce((s, p) => s + p.quantity * p.price, 0), [products]);
  const totalItems = useMemo(() => products.reduce((s, p) => s + p.quantity, 0), [products]);
  const categoryChartData = useMemo(() => {
    const map = {}; products.forEach(p => { map[p.category] = (map[p.category] || 0) + p.quantity; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [products]);
  const last14days = useMemo(() => {
    const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().slice(0, 10)); }
    return days.map(date => {
      const dayTx = transactions.filter(t => t.created_at?.slice(0, 10) === date);
      return { date: date.slice(5), kirim: dayTx.filter(t => t.type === 'kirim').reduce((s, t) => s + Number(t.qty), 0), chiqim: dayTx.filter(t => t.type === 'chiqim').reduce((s, t) => s + Number(t.qty), 0) };
    });
  }, [transactions]);
  const productName = (id) => products.find(p => p.id === id)?.name || '—';

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.category.trim()) return;
    const { error } = await supabase.from('products').insert({
      name: newProduct.name.trim(), category: newProduct.category.trim(), unit: newProduct.unit.trim() || 'dona',
      quantity: Number(newProduct.quantity) || 0, min_stock: Number(newProduct.minStock) || 0, price: Number(newProduct.price) || 0,
    });
    if (error) { setToast('Xatolik: ' + error.message); return; }
    setNewProduct({ name: '', category: '', unit: 'dona', quantity: '', minStock: '', price: '' });
    setShowAddProduct(false); setToast("Mahsulot qo'shildi"); loadData();
  }

  async function handleDeleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { setToast('Xatolik: ' + error.message); return; }
    setToast("Mahsulot o'chirildi"); loadData();
  }

  function openTx(productId, type) { setTxForm({ qty: '', note: '' }); setShowTxModal({ productId, type }); }

  async function handleSubmitTx(e) {
    e.preventDefault();
    const qty = Number(txForm.qty);
    if (!qty || qty <= 0 || !showTxModal) return;
    const { productId, type } = showTxModal;
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (type === 'chiqim' && qty > product.quantity) { setToast("Yetarli qoldiq yo'q!"); return; }

    const newQty = type === 'kirim' ? product.quantity + qty : product.quantity - qty;
    const { error: upErr } = await supabase.from('products').update({ quantity: newQty }).eq('id', productId);
    if (upErr) { setToast('Xatolik: ' + upErr.message); return; }

    const { error: txErr } = await supabase.from('transactions').insert({
      product_id: productId, type, qty, note: txForm.note.trim(),
      by_name: profile?.full_name || '—', by_user: session.user.id,
    });
    if (txErr) { setToast('Xatolik: ' + txErr.message); return; }

    setShowTxModal(null);
    setToast(type === 'kirim' ? `+${qty} ${product.unit} kirim qilindi` : `-${qty} ${product.unit} chiqim qilindi`);
    loadData();
  }

  if (session === undefined) return <div style={{ fontFamily: 'Inter', padding: 40, color: COLORS.inkSoft }}><style>{FONT_IMPORT}</style>Yuklanmoqda...</div>;
  if (!session) return <LoginScreen />;
  if (!profile) return <div style={{ fontFamily: 'Inter', padding: 40, color: COLORS.inkSoft }}><style>{FONT_IMPORT}</style>Profil yuklanmoqda...</div>;

  const navTabs = isAdmin
    ? [{ id: 'dashboard', icon: LayoutDashboard, label: 'Bosh sahifa' }, { id: 'products', icon: Package, label: 'Mahsulotlar' }, { id: 'transactions', icon: ClipboardList, label: 'Amaliyotlar' }, { id: 'reports', icon: TrendingUp, label: 'Hisobot' }, { id: 'users', icon: Users, label: 'Hodimlar' }]
    : [{ id: 'products', icon: Package, label: 'Mahsulotlar' }, { id: 'transactions', icon: ClipboardList, label: 'Amaliyotlar' }];
  const activeTab = navTabs.some(t => t.id === tab) ? tab : navTabs[0].id;

  return (
    <div style={{ fontFamily: 'Inter', background: COLORS.bg, minHeight: '100vh', color: COLORS.ink, display: 'flex' }}>
      <style>{FONT_IMPORT}{`
        * { box-sizing: border-box; } ::placeholder { color: #9a9385; }
        table { border-collapse: collapse; width: 100%; } th, td { text-align: left; padding: 10px 12px; font-size: 13px; }
        tbody tr:hover { background: #faf7f0; }
        button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid ${COLORS.amber}; outline-offset: 1px; }
        @media (max-width: 760px) { .sidebar { display: none !important; } .mobile-nav { display: flex !important; } }
      `}</style>

      <div className="sidebar" style={{ width: 220, flexShrink: 0, background: COLORS.surface, borderRight: `1px solid ${COLORS.line}`, padding: '22px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 20px' }}>
          <Boxes size={22} color={COLORS.amberDeep} />
          <span style={{ fontFamily: 'Oswald', fontSize: 17, fontWeight: 600 }}>OMBORXONA</span>
        </div>
        {navTabs.map(t => <NavItem key={t.id} icon={t.icon} label={t.label} active={activeTab === t.id} onClick={() => setTab(t.id)} badge={t.id === 'products' ? lowStock.length : 0} />)}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${COLORS.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 10px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: isAdmin ? COLORS.amberDeep : COLORS.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
              {profile.full_name.slice(0, 1).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.full_name}</div>
              <div style={{ fontSize: 10.5, color: COLORS.inkSoft, display: 'flex', alignItems: 'center', gap: 3 }}>{isAdmin && <ShieldCheck size={10} />}{isAdmin ? 'Admin' : 'Hodim'}</div>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 8px', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft, fontSize: 13, fontWeight: 600 }}>
            <LogOut size={15} /> Chiqish
          </button>
        </div>
      </div>

      <div className="mobile-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: COLORS.surface, borderTop: `1px solid ${COLORS.line}`, padding: '8px 10px', justifyContent: 'space-around', zIndex: 40 }}>
        {navTabs.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', color: activeTab === item.id ? COLORS.amberDeep : COLORS.inkSoft, fontSize: 10.5, fontWeight: 600 }}>
            <item.icon size={19} />{item.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: '26px 28px 80px', minWidth: 0, maxWidth: 1180 }}>
        {activeTab === 'dashboard' && isAdmin && (
          <>
            <h1 style={{ fontFamily: 'Oswald', fontSize: 24, textTransform: 'uppercase', margin: '0 0 4px' }}>Bosh sahifa</h1>
            <p style={{ color: COLORS.inkSoft, fontSize: 13.5, margin: '0 0 20px' }}>{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 22 }}>
              <StatCard icon={Package} label="MAHSULOT TURLARI" value={products.length} tone="ink" />
              <StatCard icon={Boxes} label="JAMI QOLDIQ" value={totalItems.toLocaleString('fr-FR')} tone="teal" />
              <StatCard icon={TrendingUp} label="OMBOR QIYMATI" value={`${totalValue.toLocaleString('fr-FR')} so'm`} tone="amber" />
              <StatCard icon={AlertTriangle} label="KAM QOLDIQ" value={lowStock.length} tone="rust" sub={lowStock.length ? "diqqat talab qiladi" : "hammasi yaxshi"} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '18px 20px' }}>
                <h3 style={{ fontFamily: 'Oswald', fontSize: 14, textTransform: 'uppercase', margin: '0 0 14px', color: COLORS.inkSoft }}>Oxirgi 14 kun</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={last14days}>
                    <CartesianGrid stroke={COLORS.line} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.line}` }} />
                    <Line type="monotone" dataKey="kirim" stroke={COLORS.teal} strokeWidth={2.5} dot={false} name="Kirim" />
                    <Line type="monotone" dataKey="chiqim" stroke={COLORS.rust} strokeWidth={2.5} dot={false} name="Chiqim" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '18px 20px' }}>
                <h3 style={{ fontFamily: 'Oswald', fontSize: 14, textTransform: 'uppercase', margin: '0 0 14px', color: COLORS.inkSoft }}>Kategoriya bo'yicha</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={78} paddingAngle={2}>
                      {categoryChartData.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.line}` }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {lowStock.length > 0 && (
              <div style={{ background: '#a13d2b0d', border: `1px solid ${COLORS.rust}44`, borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <AlertTriangle size={16} color={COLORS.rust} />
                  <h3 style={{ fontFamily: 'Oswald', fontSize: 13.5, textTransform: 'uppercase', margin: 0, color: COLORS.rust }}>Kam qoldiqli mahsulotlar</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {lowStock.map(p => <span key={p.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 600 }}>{p.name} — <span style={{ fontFamily: 'JetBrains Mono', color: COLORS.rust }}>{p.quantity} {p.unit}</span></span>)}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'products' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <h1 style={{ fontFamily: 'Oswald', fontSize: 24, textTransform: 'uppercase', margin: 0 }}>Mahsulotlar</h1>
              {isAdmin && <button onClick={() => setShowAddProduct(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.navy, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}><Plus size={16} /> Yangi mahsulot</button>}
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={15} color={COLORS.inkSoft} style={{ position: 'absolute', left: 12, top: 11 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..." style={{ ...inputStyle, marginBottom: 0, paddingLeft: 34 }} />
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 170 }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr style={{ background: '#faf7f0', borderBottom: `1px solid ${COLORS.line}` }}>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Nomi</th>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Kategoriya</th>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Qoldiq</th>
                    {isAdmin && <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Narx</th>}
                    <th></th>
                  </tr></thead>
                  <tbody>
                    {filteredProducts.map(p => {
                      const low = p.quantity <= p.min_stock;
                      return (
                        <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ color: COLORS.inkSoft }}>{p.category}</td>
                          <td><span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: low ? COLORS.rust : COLORS.ink }}>{p.quantity} {p.unit}</span>{low && <AlertTriangle size={12} color={COLORS.rust} style={{ marginLeft: 5, verticalAlign: -1 }} />}</td>
                          {isAdmin && <td style={{ fontFamily: 'JetBrains Mono', color: COLORS.inkSoft }}>{p.price.toLocaleString('fr-FR')} so'm</td>}
                          <td>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button onClick={() => openTx(p.id, 'kirim')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.teal }}><ArrowDownCircle size={19} /></button>
                              <button onClick={() => openTx(p.id, 'chiqim')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.rust }}><ArrowUpCircle size={19} /></button>
                              {isAdmin && <button onClick={() => handleDeleteProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Trash2 size={16} /></button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredProducts.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: COLORS.inkSoft, padding: 30 }}>Hech narsa topilmadi</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <>
            <h1 style={{ fontFamily: 'Oswald', fontSize: 24, textTransform: 'uppercase', margin: '0 0 18px' }}>Amaliyotlar tarixi</h1>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr style={{ background: '#faf7f0', borderBottom: `1px solid ${COLORS.line}` }}>
                    <th style={{ color: COLORS.inkSoft, fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>Sana</th>
                    <th style={{ color: COLORS.inkSoft, fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>Mahsulot</th>
                    <th style={{ color: COLORS.inkSoft, fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>Turi</th>
                    <th style={{ color: COLORS.inkSoft, fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>Miqdor</th>
                    <th style={{ color: COLORS.inkSoft, fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>Kim</th>
                    <th style={{ color: COLORS.inkSoft, fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>Izoh</th>
                  </tr></thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                        <td style={{ fontFamily: 'JetBrains Mono', color: COLORS.inkSoft }}>{t.created_at?.slice(0, 10)}</td>
                        <td style={{ fontWeight: 600 }}>{productName(t.product_id)}</td>
                        <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: t.type === 'kirim' ? COLORS.teal : COLORS.rust }}>{t.type === 'kirim' ? <ArrowDownCircle size={13} /> : <ArrowUpCircle size={13} />}{t.type === 'kirim' ? 'Kirim' : 'Chiqim'}</span></td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{t.qty}</td>
                        <td style={{ color: COLORS.inkSoft }}>{t.by_name || '—'}</td>
                        <td style={{ color: COLORS.inkSoft }}>{t.note || '—'}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: COLORS.inkSoft, padding: 30 }}>Hozircha amaliyotlar yo'q</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'reports' && isAdmin && (
          <>
            <h1 style={{ fontFamily: 'Oswald', fontSize: 24, textTransform: 'uppercase', margin: '0 0 18px' }}>Hisobot</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 22 }}>
              <StatCard icon={Boxes} label="OMBOR QIYMATI" value={`${totalValue.toLocaleString('fr-FR')} so'm`} tone="amber" />
              <StatCard icon={ArrowDownCircle} label="JAMI KIRIM" value={transactions.filter(t => t.type === 'kirim').reduce((s, t) => s + Number(t.qty), 0).toLocaleString('fr-FR')} tone="teal" />
              <StatCard icon={ArrowUpCircle} label="JAMI CHIQIM" value={transactions.filter(t => t.type === 'chiqim').reduce((s, t) => s + Number(t.qty), 0).toLocaleString('fr-FR')} tone="rust" />
            </div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '18px 20px' }}>
              <h3 style={{ fontFamily: 'Oswald', fontSize: 14, textTransform: 'uppercase', margin: '0 0 14px', color: COLORS.inkSoft }}>Top 8 qiymat bo'yicha</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[...products].sort((a, b) => b.quantity * b.price - a.quantity * a.price).slice(0, 8).map(p => ({ name: p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name, value: p.quantity * p.price }))}>
                  <CartesianGrid stroke={COLORS.line} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.line }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.line}` }} formatter={(v) => `${v.toLocaleString('fr-FR')} so'm`} />
                  <Bar dataKey="value" fill={COLORS.amber} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'users' && isAdmin && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <h1 style={{ fontFamily: 'Oswald', fontSize: 24, textTransform: 'uppercase', margin: 0 }}>Hodimlar</h1>
              <button onClick={() => { setUserError(''); setShowAddUser(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.navy, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <Plus size={16} /> Yangi foydalanuvchi
              </button>
            </div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <table>
                <thead><tr style={{ background: '#faf7f0', borderBottom: `1px solid ${COLORS.line}` }}>
                  <th style={{ color: COLORS.inkSoft, fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>Ism</th>
                  <th style={{ color: COLORS.inkSoft, fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>Email</th>
                  <th style={{ color: COLORS.inkSoft, fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>Rol</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  {employees.map(u => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                      <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                      <td style={{ color: COLORS.inkSoft, fontFamily: 'JetBrains Mono', fontSize: 12.5 }}>{u.email || '—'}</td>
                      <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: u.role === 'admin' ? COLORS.amberDeep : COLORS.teal }}>{u.role === 'admin' && <ShieldCheck size={13} />}{u.role === 'admin' ? 'Admin' : 'Hodim'}</span></td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {u.id !== session.user.id && <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Trash2 size={16} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: COLORS.inkSoft, padding: 30 }}>Hodimlar yo'q</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showAddUser && isAdmin && (
        <Modal title="Yangi foydalanuvchi" onClose={() => setShowAddUser(false)}>
          {userError && <div style={{ background: '#a13d2b12', color: COLORS.rust, fontSize: 12.5, padding: '8px 12px', borderRadius: 7, marginBottom: 14, fontWeight: 600 }}>{userError}</div>}
          <form onSubmit={handleAddUser}>
            <label style={labelStyle}>To'liq ism</label>
            <input style={inputStyle} value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} placeholder="Masalan: Aziz Karimov" required />
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="aziz@misol.uz" required />
            <label style={labelStyle}>Parol</label>
            <input style={inputStyle} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Kamida 6 ta belgi" required minLength={6} />
            <label style={labelStyle}>Rol</label>
            <select style={inputStyle} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="hodim">Hodim</option>
              <option value="admin">Admin</option>
            </select>
            <div style={{ marginTop: 6 }}><PrimaryButton type="submit" disabled={userLoading}>{userLoading ? "Qo'shilmoqda..." : "Qo'shish"}</PrimaryButton></div>
          </form>
        </Modal>
      )}

      {showAddProduct && isAdmin && (
        <Modal title="Yangi mahsulot" onClose={() => setShowAddProduct(false)}>
          <form onSubmit={handleAddProduct}>
            <label style={labelStyle}>Nomi</label>
            <input style={inputStyle} value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
            <label style={labelStyle}>Kategoriya</label>
            <input style={inputStyle} value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={labelStyle}>O'lchov birligi</label><input style={inputStyle} value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })} /></div>
              <div><label style={labelStyle}>Boshlang'ich qoldiq</label><input style={inputStyle} type="number" min="0" value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} /></div>
              <div><label style={labelStyle}>Min. qoldiq</label><input style={inputStyle} type="number" min="0" value={newProduct.minStock} onChange={e => setNewProduct({ ...newProduct, minStock: e.target.value })} /></div>
              <div><label style={labelStyle}>Narx (so'm)</label><input style={inputStyle} type="number" min="0" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} /></div>
            </div>
            <div style={{ marginTop: 6 }}><PrimaryButton type="submit">Qo'shish</PrimaryButton></div>
          </form>
        </Modal>
      )}

      {showTxModal && (
        <Modal title={showTxModal.type === 'kirim' ? 'Kirim qilish' : 'Chiqim qilish'} onClose={() => setShowTxModal(null)}>
          <p style={{ fontSize: 13.5, color: COLORS.inkSoft, marginTop: -8, marginBottom: 16 }}>
            {productName(showTxModal.productId)} — joriy qoldiq: <strong style={{ color: COLORS.ink }}>{products.find(p => p.id === showTxModal.productId)?.quantity} {products.find(p => p.id === showTxModal.productId)?.unit}</strong>
          </p>
          <form onSubmit={handleSubmitTx}>
            <label style={labelStyle}>Miqdor</label>
            <input style={inputStyle} type="number" min="1" value={txForm.qty} onChange={e => setTxForm({ ...txForm, qty: e.target.value })} required autoFocus />
            <label style={labelStyle}>Izoh (ixtiyoriy)</label>
            <input style={inputStyle} value={txForm.note} onChange={e => setTxForm({ ...txForm, note: e.target.value })} />
            <div style={{ marginTop: 6 }}><PrimaryButton type="submit" tone={showTxModal.type === 'kirim' ? 'navy' : 'rust'}>{showTxModal.type === 'kirim' ? 'Kirim qilish' : 'Chiqim qilish'}</PrimaryButton></div>
          </form>
        </Modal>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: COLORS.navy, color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, boxShadow: '0 10px 30px #1c243044', zIndex: 60 }}>{toast}</div>}
    </div>
  );
}
