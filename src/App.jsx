import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, ArrowDownCircle, ArrowUpCircle, LayoutDashboard, Search, AlertTriangle, Plus, X, Trash2, ClipboardList, TrendingUp, Boxes, LogOut, ShieldCheck, Users, ChevronUp, ChevronDown, Pencil, Download, Settings, Layers, KeyRound } from 'lucide-react';
import * as XLSX from 'xlsx';
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

// Vergul (,) yoki nuqta (.) bilan kiritilgan kasr sonni JS uchun to'g'ri formatga o'tkazadi
const normNum = (v) => v.replace(',', '.').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
function DecInput({ value, onChange, style, required, placeholder }) {
  return (
    <input
      type="text" inputMode="decimal" style={style} required={required} placeholder={placeholder}
      value={value}
      onChange={e => onChange(normNum(e.target.value))}
    />
  );
}

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

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#1c243088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: COLORS.surface, borderRadius: 12, padding: 24, width: '100%', maxWidth: wide ? 560 : 440, boxShadow: '0 20px 60px #1c243033', border: `1px solid ${COLORS.line}`, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'Oswald', fontSize: 19, color: COLORS.ink, margin: 0, textTransform: 'uppercase' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SortTH({ label, sortKey, sort, onSort }) {
  const active = sort.key === sortKey;
  return (
    <th onClick={() => onSort(sortKey)} style={{ color: active ? COLORS.ink : COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        {label}{active && (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </span>
    </th>
  );
}

function sortRows(rows, sort, getters) {
  if (!sort.key) return rows;
  const get = getters[sort.key];
  const sorted = [...rows].sort((a, b) => {
    const va = get(a), vb = get(b);
    if (typeof va === 'string') return va.localeCompare(vb, 'uz');
    return (va ?? 0) - (vb ?? 0);
  });
  return sort.dir === 'asc' ? sorted : sorted.reverse();
}

function ManageListPanel({ title, items, onAdd, onRename, onDelete }) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '18px 20px' }}>
      <h3 style={{ fontFamily: 'Oswald', fontSize: 14, textTransform: 'uppercase', margin: '0 0 14px', color: COLORS.inkSoft }}>{title}</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Yangi nom..." style={{ ...inputStyle, marginBottom: 0 }} onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) { onAdd(newName.trim()); setNewName(''); } }} />
        <button onClick={() => { if (newName.trim()) { onAdd(newName.trim()); setNewName(''); } }} style={{ background: COLORS.navy, color: '#fff', border: 'none', borderRadius: 7, padding: '0 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
          <Plus size={15} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#faf7f0', borderRadius: 7 }}>
            {editingId === item.id ? (
              <input value={editingName} onChange={e => setEditingName(e.target.value)} style={{ ...inputStyle, marginBottom: 0, flex: 1, padding: '5px 8px' }} autoFocus
                onKeyDown={e => { if (e.key === 'Enter') { onRename(item.id, editingName.trim()); setEditingId(null); } }} />
            ) : (
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{item.name}</span>
            )}
            {editingId === item.id ? (
              <button onClick={() => { onRename(item.id, editingName.trim()); setEditingId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.teal, fontSize: 12, fontWeight: 700 }}>Saqlash</button>
            ) : (
              <button onClick={() => { setEditingId(item.id); setEditingName(item.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Pencil size={14} /></button>
            )}
            <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Trash2 size={14} /></button>
          </div>
        ))}
        {items.length === 0 && <p style={{ fontSize: 12.5, color: COLORS.inkSoft, margin: 0 }}>Hali hech narsa yo'q</p>}
      </div>
    </div>
  );
}

function UnitsPanel({ items, onAdd, onRename, onDelete, onSetKg }) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [kgDrafts, setKgDrafts] = useState({});

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '18px 20px' }}>
      <h3 style={{ fontFamily: 'Oswald', fontSize: 14, textTransform: 'uppercase', margin: '0 0 6px', color: COLORS.inkSoft }}>O'lchov birliklari</h3>
      <p style={{ fontSize: 11.5, color: COLORS.inkSoft, margin: '0 0 14px' }}>"Necha kg" — masalan "qop" uchun standart og'irlik. Kerak bo'lmasa bo'sh qoldiring.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Yangi nom..." style={{ ...inputStyle, marginBottom: 0 }} onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) { onAdd(newName.trim()); setNewName(''); } }} />
        <button onClick={() => { if (newName.trim()) { onAdd(newName.trim()); setNewName(''); } }} style={{ background: COLORS.navy, color: '#fff', border: 'none', borderRadius: 7, padding: '0 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
          <Plus size={15} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#faf7f0', borderRadius: 7, flexWrap: 'wrap' }}>
            {editingId === item.id ? (
              <input value={editingName} onChange={e => setEditingName(e.target.value)} style={{ ...inputStyle, marginBottom: 0, flex: 1, padding: '5px 8px', minWidth: 80 }} autoFocus
                onKeyDown={e => { if (e.key === 'Enter') { onRename(item.id, editingName.trim()); setEditingId(null); } }} />
            ) : (
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, minWidth: 80 }}>{item.name}</span>
            )}
            <DecInput
              value={kgDrafts[item.id] ?? (item.kg_per_unit != null ? String(item.kg_per_unit) : '')}
              onChange={v => setKgDrafts({ ...kgDrafts, [item.id]: v })}
              placeholder="necha kg"
              style={{ ...inputStyle, marginBottom: 0, width: 90, padding: '5px 8px', fontSize: 12.5 }}
            />
            <button onClick={() => onSetKg(item.id, kgDrafts[item.id])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.teal, fontSize: 11.5, fontWeight: 700 }}>Saqlash</button>
            {editingId === item.id ? (
              <button onClick={() => { onRename(item.id, editingName.trim()); setEditingId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.teal, fontSize: 12, fontWeight: 700 }}>Nomi</button>
            ) : (
              <button onClick={() => { setEditingId(item.id); setEditingName(item.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Pencil size={14} /></button>
            )}
            <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Trash2 size={14} /></button>
          </div>
        ))}
        {items.length === 0 && <p style={{ fontSize: 12.5, color: COLORS.inkSoft, margin: 0 }}>Hali hech narsa yo'q</p>}
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
        <p style={{ fontSize: 11.5, color: COLORS.inkSoft, textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>Hisobingiz yo'qmi? Admindan so'rang.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(12700);
  const [rateInput, setRateInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Barchasi');
  const [productSort, setProductSort] = useState({ key: null, dir: 'asc' });
  const [txSort, setTxSort] = useState({ key: null, dir: 'desc' });
  const [txDateFrom, setTxDateFrom] = useState('');
  const [txDateTo, setTxDateTo] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('barchasi');
  const [batchSearch, setBatchSearch] = useState('');

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editBatchKg, setEditBatchKg] = useState(null);
  const [showTxModal, setShowTxModal] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [resetPwUser, setResetPwUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [toast, setToast] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', unit: '', quantity: '', minStock: '', priceUsd: '', documentNo: '', usdRate: '', kgPerUnit: '', totalKg: '' });
  const [txForm, setTxForm] = useState({ qty: '', note: '', priceUsd: '', documentNo: '', usdRate: '', kgPerUnit: '', totalKg: '' });
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'hodim' });
  const [employees, setEmployees] = useState([]);
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [txSubmitting, setTxSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data));
  }, [session]);

  const loadData = useCallback(async () => {
    const { data: p } = await supabase.from('products').select('*').order('name');
    const { data: t } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(500);
    const { data: b } = await supabase.from('batches').select('*').order('created_at', { ascending: true });
    const { data: c } = await supabase.from('categories').select('*').order('name');
    const { data: u } = await supabase.from('units').select('*').order('name');
    const { data: s } = await supabase.from('app_settings').select('*').eq('key', 'usd_rate').single();
    if (s) setExchangeRate(Number(s.value));
    setProducts(p || []);
    setTransactions(t || []);
    setBatches(b || []);
    setCategories(c || []);
    setUnits(u || []);
  }, []);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  const loadEmployees = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    setEmployees(data || []);
  }, []);

  useEffect(() => { if (session && profile?.role === 'admin') loadEmployees(); }, [session, profile, loadEmployees]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); } }, [toast]);

  const isAdmin = profile?.role === 'admin';
  const canViewPrices = isAdmin || !!profile?.permissions?.can_view_prices;
  const canEnterData = (isAdmin || profile?.permissions?.can_enter_data !== false) && !profile?.permissions?.can_view_transactions_only;
  const canViewAll = isAdmin || !!profile?.permissions?.can_view_all;
  const viewOnlyTx = !isAdmin && !!profile?.permissions?.can_view_transactions_only;
  const canViewBatches = isAdmin || !!profile?.permissions?.can_view_batches;

  // Partiyalar asosida har bir mahsulotning haqiqiy qoldiq qiymati (FIFO)
  const productValueUSD = useCallback((p) => {
    const own = batches.filter(b => b.product_id === p.id);
    if (own.length === 0) return p.quantity * p.price;
    return own.reduce((s, b) => s + Number(b.qty_remaining) * Number(b.unit_price), 0);
  }, [batches]);

  // So'm — har bir partiya o'zi kiritilgan paytdagi kursda (admin/hodim qo'lda kiritgan kurs) hisoblanadi
  const productValue = useCallback((p) => {
    const own = batches.filter(b => b.product_id === p.id);
    if (own.length === 0) return p.quantity * p.price * exchangeRate;
    return own.reduce((s, b) => s + Number(b.qty_remaining) * Number(b.unit_price) * (Number(b.usd_rate) || exchangeRate), 0);
  }, [batches, exchangeRate]);

  // Mahsulotning joriy qoldig'iga to'g'ri keladigan taxminiy kg (partiyalar bo'yicha, qisman sarflangan bo'lsa nisbatan hisoblanadi)
  const productKg = useCallback((p) => {
    const own = batches.filter(b => b.product_id === p.id && b.total_kg != null && Number(b.qty_received) > 0);
    if (own.length === 0) return null;
    const total = own.reduce((s, b) => s + (Number(b.total_kg) * (Number(b.qty_remaining) / Number(b.qty_received))), 0);
    return total;
  }, [batches]);

  const fmtUsd = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const unitKg = (unitName) => {
    const u = units.find(x => x.name === unitName);
    return u && u.kg_per_unit != null && u.kg_per_unit !== '' ? Number(u.kg_per_unit) : null;
  };

  const productCategories = useMemo(() => ['Barchasi', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filteredProducts = useMemo(() => {
    let rows = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === 'Barchasi' || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
    return sortRows(rows, productSort, {
      name: r => r.name.toLowerCase(), category: r => r.category.toLowerCase(),
      quantity: r => Number(r.quantity), price: r => Number(r.price), total: r => productValue(r),
    });
  }, [products, search, categoryFilter, productSort, productValue]);

  const productName = (id, fallback) => products.find(p => p.id === id)?.name || fallback || '—';

  const filteredTx = useMemo(() => {
    let rows = transactions.filter(t => {
      const d = t.created_at?.slice(0, 10);
      if (txDateFrom && d < txDateFrom) return false;
      if (txDateTo && d > txDateTo) return false;
      if (txTypeFilter !== 'barchasi' && t.type !== txTypeFilter) return false;
      return true;
    });
    return sortRows(rows, txSort, {
      date: r => r.created_at || '', product: r => productName(r.product_id, r.product_name).toLowerCase(),
      type: r => r.type, qty: r => Number(r.qty), by: r => (r.by_name || '').toLowerCase(), note: r => (r.note || '').toLowerCase(),
    });
  }, [transactions, txDateFrom, txDateTo, txTypeFilter, txSort, products]);

  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const name = productName(b.product_id, b.product_name).toLowerCase();
      const q = batchSearch.toLowerCase();
      return !q || name.includes(q) || (b.document_no || '').toLowerCase().includes(q) || b.id.slice(0, 8).includes(q);
    }).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [batches, batchSearch, products]);

  const lowStock = useMemo(() => products.filter(p => p.quantity <= p.min_stock), [products]);
  const totalValue = useMemo(() => products.reduce((s, p) => s + productValue(p), 0), [products, productValue]);
  const totalValueUSD = useMemo(() => products.reduce((s, p) => s + productValueUSD(p), 0), [products, productValueUSD]);
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

  function toggleSort(setter, key) {
    setter(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  }

  async function logTx(entry) {
    const { error } = await supabase.from('transactions').insert({ by_name: profile?.full_name || '—', by_user: session.user.id, ...entry });
    if (error) { console.error('logTx error:', error); setToast('Amaliyot yozilmadi: ' + error.message); }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.category || !newProduct.unit) { setToast("Kategoriya va o'lchov birligini tanlang"); return; }
    const qty = Number(newProduct.quantity) || 0;
    const priceUsd = Number(newProduct.priceUsd) || 0;
    const rate = Number(newProduct.usdRate) || exchangeRate;
    const payload = { name: newProduct.name.trim(), category: newProduct.category, unit: newProduct.unit, quantity: qty, min_stock: Number(newProduct.minStock) || 0, price: priceUsd };
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (error) { setToast('Xatolik: ' + error.message); return; }

    if (qty > 0) {
      const kgPerUnit = newProduct.kgPerUnit !== '' ? Number(newProduct.kgPerUnit) : null;
      const totalKg = newProduct.totalKg !== '' ? Number(newProduct.totalKg) : (kgPerUnit != null ? qty * kgPerUnit : null);
      const { data: batch } = await supabase.from('batches').insert({
        product_id: data.id, product_name: data.name, document_no: newProduct.documentNo.trim() || null,
        qty_received: qty, qty_remaining: qty, unit_price: priceUsd, usd_rate: rate, kg_per_unit: kgPerUnit, total_kg: totalKg, note: 'Boshlang\'ich qoldiq',
        created_by: session.user.id, by_name: profile?.full_name || '—',
      }).select().single();
      await logTx({ product_id: data.id, product_name: data.name, type: 'yaratildi', qty, unit_price: priceUsd, usd_rate: rate, kg_per_unit: kgPerUnit, total_kg: totalKg, document_no: newProduct.documentNo.trim() || null, batch_id: batch?.id, note: `Yangi mahsulot yaratildi: ${qty} ${payload.unit}, narxi ${fmtUsd(priceUsd)}` });
    } else {
      await logTx({ product_id: data.id, product_name: data.name, type: 'yaratildi', qty: 0, note: `Yangi mahsulot yaratildi (qoldiqsiz)` });
    }
    setNewProduct({ name: '', category: '', unit: '', quantity: '', minStock: '', priceUsd: '', documentNo: '', usdRate: '', kgPerUnit: '', totalKg: '' });
    setShowAddProduct(false); setToast("Mahsulot qo'shildi"); loadData();
  }

  async function handleDeleteProduct(p) {
    await logTx({ product_id: p.id, product_name: p.name, type: 'ochirildi', qty: p.quantity, note: `Mahsulot o'chirildi (oxirgi qoldiq: ${p.quantity} ${p.unit})` });
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) { setToast('Xatolik: ' + error.message); return; }
    setToast("Mahsulot o'chirildi"); loadData();
  }

  function openEditProduct(p) {
    setEditProduct({ id: p.id, name: p.name, category: p.category, unit: p.unit, quantity: String(p.quantity), minStock: String(p.min_stock), price: String(p.price) });
  }

  async function handleSaveEditProduct(e) {
    e.preventDefault();
    const original = products.find(p => p.id === editProduct.id);
    if (!original) return;
    const next = {
      name: editProduct.name.trim(), category: editProduct.category, unit: editProduct.unit,
      quantity: Number(editProduct.quantity) || 0, min_stock: Number(editProduct.minStock) || 0, price: Number(editProduct.price) || 0,
    };
    const fieldLabels = { name: 'Nomi', category: 'Kategoriya', unit: "O'lchov birligi", quantity: 'Qoldiq', min_stock: 'Min. qoldiq', price: 'Narx' };
    const diffs = [];
    if (next.name !== original.name) diffs.push(['name', original.name, next.name]);
    if (next.category !== original.category) diffs.push(['category', original.category, next.category]);
    if (next.unit !== original.unit) diffs.push(['unit', original.unit, next.unit]);
    if (next.quantity !== Number(original.quantity)) diffs.push(['quantity', String(original.quantity), String(next.quantity)]);
    if (next.min_stock !== Number(original.min_stock)) diffs.push(['min_stock', String(original.min_stock), String(next.min_stock)]);
    if (next.price !== Number(original.price)) diffs.push(['price', String(original.price), String(next.price)]);
    if (diffs.length === 0) { setEditProduct(null); return; }

    const { error } = await supabase.from('products').update(next).eq('id', editProduct.id);
    if (error) { setToast('Xatolik: ' + error.message); return; }
    for (const [field, oldV, newV] of diffs) {
      await logTx({ product_id: editProduct.id, product_name: next.name, type: 'tahrir', qty: 0, note: `${fieldLabels[field]}: "${oldV}" → "${newV}"`, field_name: field, old_value: oldV, new_value: newV });
    }
    setEditProduct(null); setToast("Mahsulot yangilandi (izoh: qoldiq/narxni to'g'ridan-to'g'ri o'zgartirish partiyalarga ta'sir qilmaydi)"); loadData();
  }

  function openTx(product, type) {
    const lastBatch = [...batches].filter(b => b.product_id === product.id).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
    const lastPriceUsd = lastBatch ? Number(lastBatch.unit_price) : product.price;
    const lastRate = lastBatch?.usd_rate ?? exchangeRate;
    const defaultKg = lastBatch?.kg_per_unit ?? unitKg(product.unit);
    setTxForm({ qty: '', note: '', priceUsd: type === 'kirim' ? String(lastPriceUsd) : '', documentNo: '', usdRate: String(lastRate), kgPerUnit: defaultKg != null ? String(defaultKg) : '', totalKg: '' });
    setShowTxModal({ productId: product.id, type });
  }

  async function handleSubmitTx(e) {
    e.preventDefault();
    const qty = Number(txForm.qty);
    if (!qty || qty <= 0 || !showTxModal) return;
    const { productId, type } = showTxModal;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setTxSubmitting(true);
    const documentNo = txForm.documentNo.trim() || null;

    if (type === 'kirim') {
      const priceUsd = Number(txForm.priceUsd) || 0;
      const rate = Number(txForm.usdRate) || exchangeRate;
      const kgPerUnit = txForm.kgPerUnit !== '' ? Number(txForm.kgPerUnit) : null;
      const totalKg = txForm.totalKg !== '' ? Number(txForm.totalKg) : (kgPerUnit != null ? qty * kgPerUnit : null);
      const { data: batch, error: batchErr } = await supabase.from('batches').insert({
        product_id: productId, product_name: product.name, document_no: documentNo,
        qty_received: qty, qty_remaining: qty, unit_price: priceUsd, usd_rate: rate, kg_per_unit: kgPerUnit, total_kg: totalKg, note: txForm.note.trim(),
        created_by: session.user.id, by_name: profile?.full_name || '—',
      }).select().single();
      if (batchErr) { setTxSubmitting(false); setToast('Xatolik: ' + batchErr.message); return; }

      const { error: upErr } = await supabase.from('products').update({ quantity: product.quantity + qty, price: priceUsd }).eq('id', productId);
      if (upErr) { setTxSubmitting(false); setToast('Xatolik: ' + upErr.message); return; }

      const { error: txInsErr } = await supabase.from('transactions').insert({
        product_id: productId, product_name: product.name, type: 'kirim', qty, unit_price: priceUsd, usd_rate: rate, kg_per_unit: kgPerUnit, total_kg: totalKg,
        document_no: documentNo, batch_id: batch.id, note: txForm.note.trim(),
        by_name: profile?.full_name || '—', by_user: session.user.id,
      });
      if (txInsErr) { setTxSubmitting(false); setToast('Amaliyot yozilmadi: ' + txInsErr.message); return; }
      setTxSubmitting(false); setShowTxModal(null);
      setToast(`+${qty} ${product.unit} kirim qilindi (partiya qo'shildi)`);
      loadData();
      return;
    }

    // Chiqim — eng eski partiyalardan FIFO tartibida yechiladi
    const available = batches.filter(b => b.product_id === productId && Number(b.qty_remaining) > 0)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    const totalAvailable = available.reduce((s, b) => s + Number(b.qty_remaining), 0);
    if (qty > product.quantity) { setTxSubmitting(false); setToast("Yetarli qoldiq yo'q!"); return; }

    // Avval qaysi partiyalardan qancha olinishini va ularning kg qiymatini rejalashtiramiz
    let remaining = qty;
    const plan = [];
    for (const b of available) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, Number(b.qty_remaining));
      const kgForTake = b.kg_per_unit != null ? take * Number(b.kg_per_unit) : null;
      plan.push({ batch: b, take, kgForTake });
      remaining -= take;
    }
    const computedTotalKg = plan.reduce((s, x) => s + (x.kgForTake || 0), 0);
    const anyKg = plan.some(x => x.kgForTake != null) || computedTotalKg > 0;
    const overrideTotalKg = txForm.totalKg !== '' ? Number(txForm.totalKg) : null;
    const kgScale = (overrideTotalKg != null && computedTotalKg > 0) ? overrideTotalKg / computedTotalKg : 1;

    for (const { batch: b, take, kgForTake } of plan) {
      await supabase.from('batches').update({ qty_remaining: Number(b.qty_remaining) - take }).eq('id', b.id);
      const rowKg = kgForTake != null ? Number((kgForTake * kgScale).toFixed(3)) : null;
      const { error: chErr } = await supabase.from('transactions').insert({
        product_id: productId, product_name: product.name, type: 'chiqim', qty: take, unit_price: b.unit_price, usd_rate: b.usd_rate,
        kg_per_unit: b.kg_per_unit, total_kg: rowKg,
        document_no: documentNo, batch_id: b.id, note: txForm.note.trim(),
        by_name: profile?.full_name || '—', by_user: session.user.id,
      });
      if (chErr) { setTxSubmitting(false); setToast('Amaliyot yozilmadi: ' + chErr.message); return; }
    }
    // Agar partiyalarda yozilgan miqdordan ko'proq chiqim kerak bo'lsa (masalan qoldiq qo'lda tuzatilgan bo'lsa),
    // qolgan qismini mahsulotning joriy narxida, partiyasiz yozib qo'yamiz — shu bilan qoldiq har doim to'g'ri kelaveradi.
    if (remaining > 0) {
      const shortfallKg = anyKg ? null : (unitKg(product.unit) != null ? remaining * unitKg(product.unit) : null);
      const { error: shortErr } = await supabase.from('transactions').insert({
        product_id: productId, product_name: product.name, type: 'chiqim', qty: remaining, unit_price: product.price, usd_rate: exchangeRate,
        total_kg: shortfallKg,
        document_no: documentNo, note: (txForm.note.trim() ? txForm.note.trim() + ' — ' : '') + "partiyasiz (eski/tuzatilgan qoldiqdan)",
        by_name: profile?.full_name || '—', by_user: session.user.id,
      });
      if (shortErr) { setTxSubmitting(false); setToast('Amaliyot yozilmadi: ' + shortErr.message); return; }
    }
    await supabase.from('products').update({ quantity: product.quantity - qty }).eq('id', productId);
    setTxSubmitting(false); setShowTxModal(null);
    setToast(`-${qty} ${product.unit} chiqim qilindi`);
    loadData();
  }

  async function addCategory(name) {
    const { error } = await supabase.from('categories').insert({ name });
    if (error) { setToast('Xatolik: bu nom allaqachon bor'); return; }
    loadData();
  }
  async function renameCategory(id, name) { if (!name) return; await supabase.from('categories').update({ name }).eq('id', id); loadData(); }
  async function deleteCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (products.some(p => p.category === cat?.name)) { setToast("Bu kategoriyada mahsulotlar bor, avval ularni o'zgartiring"); return; }
    await supabase.from('categories').delete().eq('id', id); loadData();
  }
  async function addUnit(name) {
    const { error } = await supabase.from('units').insert({ name });
    if (error) { setToast('Xatolik: bu nom allaqachon bor'); return; }
    loadData();
  }
  async function renameUnit(id, name) { if (!name) return; await supabase.from('units').update({ name }).eq('id', id); loadData(); }
  async function deleteUnit(id) {
    const u = units.find(x => x.id === id);
    if (products.some(p => p.unit === u?.name)) { setToast("Bu birlikda mahsulotlar bor, avval ularni o'zgartiring"); return; }
    await supabase.from('units').delete().eq('id', id); loadData();
  }
  async function setUnitKg(id, kgStr) {
    const kg = kgStr === '' || kgStr == null ? null : Number(kgStr);
    const { error } = await supabase.from('units').update({ kg_per_unit: kg }).eq('id', id);
    if (error) { setToast('Xatolik: ' + error.message); return; }
    setToast("Saqlandi"); loadData();
  }
  function openEditBatchKg(b) {
    setEditBatchKg({ id: b.id, kgPerUnit: b.kg_per_unit != null ? String(b.kg_per_unit) : '', totalKg: b.total_kg != null ? String(b.total_kg) : '', qty: b.qty_received });
  }
  async function handleSaveBatchKg(e) {
    e.preventDefault();
    const kgPerUnit = editBatchKg.kgPerUnit !== '' ? Number(editBatchKg.kgPerUnit) : null;
    const totalKg = editBatchKg.totalKg !== '' ? Number(editBatchKg.totalKg) : (kgPerUnit != null ? editBatchKg.qty * kgPerUnit : null);
    const { error } = await supabase.from('batches').update({ kg_per_unit: kgPerUnit, total_kg: totalKg }).eq('id', editBatchKg.id);
    if (error) { setToast('Xatolik: ' + error.message); return; }
    setEditBatchKg(null); setToast('Kg yangilandi'); loadData();
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setUserError(''); setUserLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const res = await fetch('/api/create-employee', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session.access_token}` }, body: JSON.stringify(newUser),
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
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session.access_token}` }, body: JSON.stringify({ userId }),
    });
    const result = await res.json();
    if (!res.ok) { setToast(result.error || 'Xatolik'); return; }
    setToast("Foydalanuvchi o'chirildi"); loadEmployees();
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setPwError(''); setPwLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const res = await fetch('/api/reset-employee-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session.access_token}` },
      body: JSON.stringify({ userId: resetPwUser.id, newPassword }),
    });
    const result = await res.json();
    setPwLoading(false);
    if (!res.ok) { setPwError(result.error || 'Xatolik yuz berdi'); return; }
    setResetPwUser(null); setNewPassword(''); setToast(`${resetPwUser.full_name} uchun parol yangilandi`);
  }

  function openEditUser(u) {
    setEditUser({
      id: u.id, full_name: u.full_name, role: u.role,
      can_enter_data: u.permissions?.can_enter_data !== false, can_view_prices: !!u.permissions?.can_view_prices,
      can_edit_transactions: !!u.permissions?.can_edit_transactions, can_view_transactions_only: !!u.permissions?.can_view_transactions_only,
      can_view_all: !!u.permissions?.can_view_all, can_view_batches: !!u.permissions?.can_view_batches,
    });
  }

  async function handleSaveEditUser(e) {
    e.preventDefault();
    const { error } = await supabase.from('profiles').update({
      role: editUser.role,
      permissions: {
        can_enter_data: editUser.can_enter_data, can_view_prices: editUser.can_view_prices,
        can_edit_transactions: editUser.can_edit_transactions, can_view_transactions_only: editUser.can_view_transactions_only,
        can_view_all: editUser.can_view_all, can_view_batches: editUser.can_view_batches,
      },
    }).eq('id', editUser.id);
    if (error) { setToast('Xatolik: ' + error.message); return; }
    setEditUser(null); setToast('Ruxsatlar yangilandi'); loadEmployees();
  }

  function exportProductsExcel() {
    const rows = filteredProducts.map(p => ({
      Nomi: p.name, Kategoriya: p.category, "O'lchov": p.unit, Qoldiq: p.quantity,
      ...(canViewPrices ? { "Jami narx ($)": Number(productValueUSD(p).toFixed(2)), "Jami narx (so'm)": productValue(p) } : {}),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mahsulotlar');
    XLSX.writeFile(wb, `mahsulotlar_${todayISO()}.xlsx`);
  }

  function exportTxExcel() {
    const rows = filteredTx.map(t => ({
      Sana: t.created_at?.slice(0, 10), Mahsulot: productName(t.product_id, t.product_name),
      Turi: { kirim: 'Kirim', chiqim: 'Chiqim', tahrir: 'Tahrir', yaratildi: 'Yaratildi', ochirildi: "O'chirildi" }[t.type] || t.type,
      Miqdor: t.qty, "Narx ($)": t.unit_price || '', "Narx (so'm)": t.unit_price ? Math.round(Number(t.unit_price) * (Number(t.usd_rate) || exchangeRate)) : '', "Hujjat/Partiya": t.document_no || '', Kim: t.by_name || '', Izoh: t.note || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Amaliyotlar');
    const suffix = txDateFrom || txDateTo ? `_${txDateFrom || '...'}_${txDateTo || '...'}` : '';
    XLSX.writeFile(wb, `amaliyotlar${suffix}.xlsx`);
  }

  if (session === undefined) return <div style={{ fontFamily: 'Inter', padding: 40, color: COLORS.inkSoft }}><style>{FONT_IMPORT}</style>Yuklanmoqda...</div>;
  if (!session) return <LoginScreen />;
  if (!profile) return <div style={{ fontFamily: 'Inter', padding: 40, color: COLORS.inkSoft }}><style>{FONT_IMPORT}</style>Profil yuklanmoqda...</div>;

  let navTabs;
  if (isAdmin) {
    navTabs = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Bosh sahifa' }, { id: 'products', icon: Package, label: 'Mahsulotlar' },
      { id: 'transactions', icon: ClipboardList, label: 'Amaliyotlar' }, { id: 'batches', icon: Layers, label: 'Partiyalar' },
      { id: 'reports', icon: TrendingUp, label: 'Hisobot' }, { id: 'users', icon: Users, label: 'Hodimlar' }, { id: 'settings', icon: Settings, label: 'Sozlamalar' },
    ];
  } else if (viewOnlyTx) {
    navTabs = [{ id: 'transactions', icon: ClipboardList, label: 'Amaliyotlar' }];
    if (canViewBatches) navTabs.push({ id: 'batches', icon: Layers, label: 'Partiyalar' });
  } else if (canViewAll) {
    navTabs = [{ id: 'dashboard', icon: LayoutDashboard, label: 'Bosh sahifa' }, { id: 'products', icon: Package, label: 'Mahsulotlar' }, { id: 'transactions', icon: ClipboardList, label: 'Amaliyotlar' }, { id: 'reports', icon: TrendingUp, label: 'Hisobot' }];
    if (canViewBatches) navTabs.push({ id: 'batches', icon: Layers, label: 'Partiyalar' });
  } else {
    navTabs = [{ id: 'products', icon: Package, label: 'Mahsulotlar' }, { id: 'transactions', icon: ClipboardList, label: 'Amaliyotlar' }];
    if (canViewBatches) navTabs.push({ id: 'batches', icon: Layers, label: 'Partiyalar' });
  }
  const activeTab = navTabs.some(t => t.id === tab) ? tab : navTabs[0].id;
  const canSeeDashboardReports = isAdmin || canViewAll;

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

      <div style={{ flex: 1, padding: '26px 28px 80px', minWidth: 0, maxWidth: 1220 }}>
        {activeTab === 'dashboard' && canSeeDashboardReports && (
          <>
            <h1 style={{ fontFamily: 'Oswald', fontSize: 24, textTransform: 'uppercase', margin: '0 0 4px' }}>Bosh sahifa</h1>
            <p style={{ color: COLORS.inkSoft, fontSize: 13.5, margin: '0 0 20px' }}>{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 22 }}>
              <StatCard icon={Package} label="MAHSULOT TURLARI" value={products.length} tone="ink" />
              <StatCard icon={Boxes} label="JAMI QOLDIQ" value={totalItems.toLocaleString('fr-FR')} tone="teal" />
              <StatCard icon={TrendingUp} label="OMBOR QIYMATI" value={fmtUsd(totalValueUSD)} sub={`${totalValue.toLocaleString('fr-FR')} so'm`} tone="amber" />
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
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={exportProductsExcel} style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.surface, color: COLORS.ink, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: '9px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  <Download size={15} /> Excel
                </button>
                {isAdmin && <button onClick={() => setShowAddProduct(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.navy, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}><Plus size={16} /> Yangi mahsulot</button>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={15} color={COLORS.inkSoft} style={{ position: 'absolute', left: 12, top: 11 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..." style={{ ...inputStyle, marginBottom: 0, paddingLeft: 34 }} />
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 170 }}>
                {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr style={{ background: '#faf7f0', borderBottom: `1px solid ${COLORS.line}` }}>
                    <SortTH label="Nomi" sortKey="name" sort={productSort} onSort={k => toggleSort(setProductSort, k)} />
                    <SortTH label="Kategoriya" sortKey="category" sort={productSort} onSort={k => toggleSort(setProductSort, k)} />
                    <SortTH label="Qoldiq" sortKey="quantity" sort={productSort} onSort={k => toggleSort(setProductSort, k)} />
                    {canViewPrices && <SortTH label="Jami narx" sortKey="total" sort={productSort} onSort={k => toggleSort(setProductSort, k)} />}
                    <th></th>
                  </tr></thead>
                  <tbody>
                    {filteredProducts.map(p => {
                      const low = p.quantity <= p.min_stock;
                      return (
                        <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ color: COLORS.inkSoft }}>{p.category}</td>
                          <td><span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: low ? COLORS.rust : COLORS.ink }}>{p.quantity} {p.unit}</span>{low && <AlertTriangle size={12} color={COLORS.rust} style={{ marginLeft: 5, verticalAlign: -1 }} />}{productKg(p) != null && <div style={{ fontSize: 11, color: COLORS.inkSoft, fontFamily: 'JetBrains Mono' }}>≈ {Number(productKg(p).toFixed(2))} kg</div>}</td>
                          {canViewPrices && <td style={{ fontFamily: 'JetBrains Mono', color: COLORS.ink, fontWeight: 700 }}>{fmtUsd(productValueUSD(p))}<br /><span style={{ fontSize: 11, fontWeight: 400, color: COLORS.inkSoft }}>{productValue(p).toLocaleString('fr-FR')} so'm</span></td>}
                          <td>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              {canEnterData && <button onClick={() => openTx(p, 'kirim')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.teal }}><ArrowDownCircle size={19} /></button>}
                              {canEnterData && <button onClick={() => openTx(p, 'chiqim')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.rust }}><ArrowUpCircle size={19} /></button>}
                              {isAdmin && <button onClick={() => openEditProduct(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Pencil size={15} /></button>}
                              {isAdmin && <button onClick={() => handleDeleteProduct(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Trash2 size={16} /></button>}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h1 style={{ fontFamily: 'Oswald', fontSize: 24, textTransform: 'uppercase', margin: 0 }}>Amaliyotlar tarixi</h1>
              <button onClick={exportTxExcel} style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.surface, color: COLORS.ink, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: '9px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <Download size={15} /> Excel
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div><label style={{ ...labelStyle, marginBottom: 3 }}>Sanadan</label><input type="date" value={txDateFrom} onChange={e => setTxDateFrom(e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 150 }} /></div>
              <div><label style={{ ...labelStyle, marginBottom: 3 }}>Sanagacha</label><input type="date" value={txDateTo} onChange={e => setTxDateTo(e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 150 }} /></div>
              <div>
                <label style={{ ...labelStyle, marginBottom: 3 }}>Turi</label>
                <select value={txTypeFilter} onChange={e => setTxTypeFilter(e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 150 }}>
                  <option value="barchasi">Barchasi</option><option value="kirim">Kirim</option><option value="chiqim">Chiqim</option>
                  <option value="tahrir">Tahrir</option><option value="yaratildi">Yaratildi</option><option value="ochirildi">O'chirildi</option>
                </select>
              </div>
              {(txDateFrom || txDateTo || txTypeFilter !== 'barchasi') && (
                <button onClick={() => { setTxDateFrom(''); setTxDateTo(''); setTxTypeFilter('barchasi'); }} style={{ background: 'none', border: 'none', color: COLORS.rust, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', marginTop: 14 }}>Tozalash</button>
              )}
            </div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr style={{ background: '#faf7f0', borderBottom: `1px solid ${COLORS.line}` }}>
                    <SortTH label="Sana" sortKey="date" sort={txSort} onSort={k => toggleSort(setTxSort, k)} />
                    <SortTH label="Mahsulot" sortKey="product" sort={txSort} onSort={k => toggleSort(setTxSort, k)} />
                    <SortTH label="Turi" sortKey="type" sort={txSort} onSort={k => toggleSort(setTxSort, k)} />
                    <SortTH label="Miqdor" sortKey="qty" sort={txSort} onSort={k => toggleSort(setTxSort, k)} />
                    {canViewPrices && <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Narx</th>}
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Hujjat/Partiya</th>
                    <SortTH label="Kim" sortKey="by" sort={txSort} onSort={k => toggleSort(setTxSort, k)} />
                    <SortTH label="Izoh" sortKey="note" sort={txSort} onSort={k => toggleSort(setTxSort, k)} />
                  </tr></thead>
                  <tbody>
                    {filteredTx.map(t => {
                      const typeStyle = {
                        kirim: { color: COLORS.teal, icon: <ArrowDownCircle size={13} />, label: 'Kirim' },
                        chiqim: { color: COLORS.rust, icon: <ArrowUpCircle size={13} />, label: 'Chiqim' },
                        tahrir: { color: COLORS.amberDeep, icon: <Pencil size={12} />, label: 'Tahrir' },
                        yaratildi: { color: COLORS.navy, icon: <Plus size={12} />, label: 'Yaratildi' },
                        ochirildi: { color: COLORS.rust, icon: <Trash2 size={12} />, label: "O'chirildi" },
                      }[t.type] || {};
                      return (
                        <tr key={t.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                          <td style={{ fontFamily: 'JetBrains Mono', color: COLORS.inkSoft }}>{t.created_at?.slice(0, 10)}</td>
                          <td style={{ fontWeight: 600 }}>{productName(t.product_id, t.product_name)}</td>
                          <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: typeStyle.color }}>{typeStyle.icon}{typeStyle.label}</span></td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{t.type === 'tahrir' ? '—' : t.qty}{t.total_kg != null && <div style={{ fontSize: 11, fontWeight: 400, color: COLORS.inkSoft }}>{Number(t.total_kg)} kg</div>}</td>
                          {canViewPrices && <td style={{ fontFamily: 'JetBrains Mono', color: COLORS.ink }}>{t.unit_price ? <>{fmtUsd(Number(t.unit_price))}<br /><span style={{ fontSize: 11, color: COLORS.inkSoft }}>{Math.round(Number(t.unit_price) * (Number(t.usd_rate) || exchangeRate)).toLocaleString('fr-FR')} so'm</span></> : '—'}</td>}
                          <td style={{ color: COLORS.inkSoft, fontFamily: 'JetBrains Mono', fontSize: 12 }}>{t.document_no || '—'}</td>
                          <td style={{ color: COLORS.inkSoft }}>{t.by_name || '—'}</td>
                          <td style={{ color: COLORS.inkSoft }}>{t.note || '—'}</td>
                        </tr>
                      );
                    })}
                    {filteredTx.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: COLORS.inkSoft, padding: 30 }}>Hech narsa topilmadi</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'batches' && canViewBatches && (
          <>
            <h1 style={{ fontFamily: 'Oswald', fontSize: 24, textTransform: 'uppercase', margin: '0 0 18px' }}>Partiyalar</h1>
            <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
              <Search size={15} color={COLORS.inkSoft} style={{ position: 'absolute', left: 12, top: 11 }} />
              <input value={batchSearch} onChange={e => setBatchSearch(e.target.value)} placeholder="Mahsulot yoki hujjat/partiya raqami..." style={{ ...inputStyle, marginBottom: 0, paddingLeft: 34 }} />
            </div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr style={{ background: '#faf7f0', borderBottom: `1px solid ${COLORS.line}` }}>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Sana</th>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Mahsulot</th>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Hujjat/Partiya №</th>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Kirgan</th>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Qolgan</th>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Kg</th>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Narx</th>
                    <th style={{ color: COLORS.inkSoft, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase' }}>Qolgan summa</th>
                    {isAdmin && <th></th>}
                  </tr></thead>
                  <tbody>
                    {filteredBatches.map(b => (
                      <tr key={b.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                        <td style={{ fontFamily: 'JetBrains Mono', color: COLORS.inkSoft }}>{b.created_at?.slice(0, 10)}</td>
                        <td style={{ fontWeight: 600 }}>{productName(b.product_id, b.product_name)}</td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{b.document_no || b.id.slice(0, 8)}</td>
                        <td style={{ fontFamily: 'JetBrains Mono' }}>{b.qty_received}</td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: Number(b.qty_remaining) === 0 ? COLORS.inkSoft : COLORS.ink }}>{b.qty_remaining}</td>
                        <td style={{ fontFamily: 'JetBrains Mono', color: COLORS.inkSoft, fontSize: 12.5 }}>{b.total_kg != null ? `${Number(b.total_kg)} kg${b.kg_per_unit != null ? ` (${b.kg_per_unit}/dona)` : ''}` : '—'}</td>
                        <td style={{ fontFamily: 'JetBrains Mono', color: COLORS.ink }}>{fmtUsd(Number(b.unit_price))}<br /><span style={{ fontSize: 11, color: COLORS.inkSoft }}>{Math.round(Number(b.unit_price) * (Number(b.usd_rate) || exchangeRate)).toLocaleString('fr-FR')} so'm</span></td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: COLORS.ink }}>{fmtUsd(Number(b.qty_remaining) * Number(b.unit_price))}<br /><span style={{ fontSize: 11, fontWeight: 400, color: COLORS.inkSoft }}>{Math.round(Number(b.qty_remaining) * Number(b.unit_price) * (Number(b.usd_rate) || exchangeRate)).toLocaleString('fr-FR')} so'm</span></td>
                        {isAdmin && <td><button onClick={() => openEditBatchKg(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Pencil size={14} /></button></td>}
                      </tr>
                    ))}
                    {filteredBatches.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: COLORS.inkSoft, padding: 30 }}>Hech narsa topilmadi</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'reports' && canSeeDashboardReports && (
          <>
            <h1 style={{ fontFamily: 'Oswald', fontSize: 24, textTransform: 'uppercase', margin: '0 0 18px' }}>Hisobot</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 22 }}>
              <StatCard icon={Boxes} label="OMBOR QIYMATI" value={fmtUsd(totalValueUSD)} sub={`${totalValue.toLocaleString('fr-FR')} so'm`} tone="amber" />
              <StatCard icon={ArrowDownCircle} label="JAMI KIRIM" value={transactions.filter(t => t.type === 'kirim').reduce((s, t) => s + Number(t.qty), 0).toLocaleString('fr-FR')} tone="teal" />
              <StatCard icon={ArrowUpCircle} label="JAMI CHIQIM" value={transactions.filter(t => t.type === 'chiqim').reduce((s, t) => s + Number(t.qty), 0).toLocaleString('fr-FR')} tone="rust" />
            </div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '18px 20px' }}>
              <h3 style={{ fontFamily: 'Oswald', fontSize: 14, textTransform: 'uppercase', margin: '0 0 14px', color: COLORS.inkSoft }}>Top 8 qiymat bo'yicha</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[...products].sort((a, b) => productValue(b) - productValue(a)).slice(0, 8).map(p => ({ name: p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name, value: productValue(p) }))}>
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
                  <th style={{ color: COLORS.inkSoft, fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>Ruxsatlar</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  {employees.map(u => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                      <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                      <td style={{ color: COLORS.inkSoft, fontFamily: 'JetBrains Mono', fontSize: 12.5 }}>{u.email || '—'}</td>
                      <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: u.role === 'admin' ? COLORS.amberDeep : COLORS.teal }}>{u.role === 'admin' && <ShieldCheck size={13} />}{u.role === 'admin' ? 'Admin' : 'Hodim'}</span></td>
                      <td style={{ fontSize: 11.5, color: COLORS.inkSoft }}>
                        {u.role === 'admin' ? "Hammasi" : [
                          u.permissions?.can_view_transactions_only && "Faqat amaliyot ko'rish",
                          !u.permissions?.can_view_transactions_only && u.permissions?.can_enter_data !== false && 'Kiritish',
                          u.permissions?.can_view_prices && 'Narx',
                          u.permissions?.can_edit_transactions && 'Tahrirlash',
                          u.permissions?.can_view_all && "Barchasini ko'rish",
                          u.permissions?.can_view_batches && "Partiyalar",
                        ].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => openEditUser(u)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Pencil size={15} /></button>
                          <button onClick={() => { setResetPwUser(u); setNewPassword(''); setPwError(''); }} title="Parolni yangilash" style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><KeyRound size={15} /></button>
                          {u.id !== session.user.id && <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.inkSoft }}><Trash2 size={16} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: COLORS.inkSoft, padding: 30 }}>Hodimlar yo'q</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'settings' && isAdmin && (
          <>
            <h1 style={{ fontFamily: 'Oswald', fontSize: 24, textTransform: 'uppercase', margin: '0 0 18px' }}>Sozlamalar</h1>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '18px 20px', marginBottom: 16, maxWidth: 360 }}>
              <h3 style={{ fontFamily: 'Oswald', fontSize: 14, textTransform: 'uppercase', margin: '0 0 6px', color: COLORS.inkSoft }}>Joriy dollar kursi</h3>
              <p style={{ fontSize: 12, color: COLORS.inkSoft, margin: '0 0 12px' }}>Yangi kirim kiritilganda standart holatda shu kurs taklif etiladi.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <DecInput value={rateInput || String(exchangeRate)} onChange={v => setRateInput(v)} style={{ ...inputStyle, marginBottom: 0 }} />
                <button onClick={async () => {
                  const val = Number(rateInput) || exchangeRate;
                  await supabase.from('app_settings').upsert({ key: 'usd_rate', value: String(val) });
                  setExchangeRate(val); setRateInput(''); setToast("Dollar kursi yangilandi");
                }} style={{ background: COLORS.navy, color: '#fff', border: 'none', borderRadius: 7, padding: '0 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Saqlash</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <ManageListPanel title="Kategoriyalar" items={categories} onAdd={addCategory} onRename={renameCategory} onDelete={deleteCategory} />
              <UnitsPanel items={units} onAdd={addUnit} onRename={renameUnit} onDelete={deleteUnit} onSetKg={setUnitKg} />
            </div>
          </>
        )}
      </div>

      {showAddUser && isAdmin && (
        <Modal title="Yangi foydalanuvchi" onClose={() => setShowAddUser(false)}>
          {userError && <div style={{ background: '#a13d2b12', color: COLORS.rust, fontSize: 12.5, padding: '8px 12px', borderRadius: 7, marginBottom: 14, fontWeight: 600 }}>{userError}</div>}
          <form onSubmit={handleAddUser}>
            <label style={labelStyle}>To'liq ism</label>
            <input style={inputStyle} value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} required />
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
            <label style={labelStyle}>Parol</label>
            <input style={inputStyle} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Kamida 6 ta belgi" required minLength={6} />
            <label style={labelStyle}>Rol</label>
            <select style={inputStyle} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="hodim">Hodim</option><option value="admin">Admin</option>
            </select>
            <p style={{ fontSize: 11.5, color: COLORS.inkSoft, margin: '-4px 0 12px' }}>Ruxsatlarni qo'shilgandan keyin "Tahrirlash" orqali sozlaysiz.</p>
            <PrimaryButton type="submit" disabled={userLoading}>{userLoading ? "Qo'shilmoqda..." : "Qo'shish"}</PrimaryButton>
          </form>
        </Modal>
      )}

      {editUser && (
        <Modal title={`${editUser.full_name} — ruxsatlar`} onClose={() => setEditUser(null)}>
          <form onSubmit={handleSaveEditUser}>
            <label style={labelStyle}>Rol</label>
            <select style={inputStyle} value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
              <option value="hodim">Hodim</option><option value="admin">Admin</option>
            </select>
            {editUser.role !== 'admin' && (
              <div style={{ background: '#faf7f0', border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: '12px 14px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editUser.can_enter_data} onChange={e => setEditUser({ ...editUser, can_enter_data: e.target.checked })} />
                  Kirim-chiqim ma'lumot kiritish
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editUser.can_view_prices} onChange={e => setEditUser({ ...editUser, can_view_prices: e.target.checked })} />
                  Narx / jami narxni ko'rish
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editUser.can_edit_transactions} onChange={e => setEditUser({ ...editUser, can_edit_transactions: e.target.checked })} />
                  Amaliyotlarni tahrirlash
                </label>
                <hr style={{ border: 'none', borderTop: `1px solid ${COLORS.line}`, margin: '2px 0' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editUser.can_view_all} onChange={e => setEditUser({ ...editUser, can_view_all: e.target.checked })} />
                  Ko'rish (barchasini — Bosh sahifa, Hisobot ham)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editUser.can_view_transactions_only} onChange={e => setEditUser({ ...editUser, can_view_transactions_only: e.target.checked })} />
                  Ko'rish (faqat kirim-chiqim tarixi, hech narsa kirita olmaydi)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editUser.can_view_batches} onChange={e => setEditUser({ ...editUser, can_view_batches: e.target.checked })} />
                  Partiyalarni ko'rish
                </label>
              </div>
            )}
            <PrimaryButton type="submit">Saqlash</PrimaryButton>
          </form>
        </Modal>
      )}

      {resetPwUser && (
        <Modal title={`${resetPwUser.full_name} — parolni yangilash`} onClose={() => setResetPwUser(null)}>
          {pwError && <div style={{ background: '#a13d2b12', color: COLORS.rust, fontSize: 12.5, padding: '8px 12px', borderRadius: 7, marginBottom: 14, fontWeight: 600 }}>{pwError}</div>}
          <form onSubmit={handleResetPassword}>
            <label style={labelStyle}>Yangi parol</label>
            <input style={inputStyle} type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Kamida 6 ta belgi" required minLength={6} autoFocus />
            <p style={{ fontSize: 11.5, color: COLORS.inkSoft, margin: '-4px 0 12px' }}>Bu — {resetPwUser.email} hisobining yangi paroli bo'ladi. Uni xodimga xabar qiling.</p>
            <PrimaryButton type="submit" disabled={pwLoading}>{pwLoading ? 'Yangilanmoqda...' : 'Yangilash'}</PrimaryButton>
          </form>
        </Modal>
      )}

      {showAddProduct && isAdmin && (
        <Modal title="Yangi mahsulot" onClose={() => setShowAddProduct(false)}>
          <form onSubmit={handleAddProduct}>
            <label style={labelStyle}>Nomi</label>
            <input style={inputStyle} value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
            <label style={labelStyle}>Kategoriya</label>
            <select style={inputStyle} value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} required>
              <option value="">Tanlang...</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            {categories.length === 0 && <p style={{ fontSize: 11.5, color: COLORS.rust, margin: '-8px 0 12px' }}>Avval "Sozlamalar"da kategoriya qo'shing.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>O'lchov birligi</label>
                <select style={inputStyle} value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value, kgPerUnit: unitKg(e.target.value) != null ? String(unitKg(e.target.value)) : '' })} required>
                  <option value="">Tanlang...</option>
                  {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Boshlang'ich qoldiq</label><DecInput style={inputStyle} value={newProduct.quantity} onChange={v => setNewProduct({ ...newProduct, quantity: v })} /></div>
              <div><label style={labelStyle}>Min. qoldiq</label><DecInput style={inputStyle} value={newProduct.minStock} onChange={v => setNewProduct({ ...newProduct, minStock: v })} /></div>
              <div><label style={labelStyle}>Narx ($)</label><DecInput style={inputStyle} value={newProduct.priceUsd} onChange={v => setNewProduct({ ...newProduct, priceUsd: v })} /></div>
              <div><label style={labelStyle}>Dollar kursi</label><DecInput style={inputStyle} value={newProduct.usdRate} onChange={v => setNewProduct({ ...newProduct, usdRate: v })} placeholder={String(exchangeRate)} /></div>
            </div>
            {Number(newProduct.priceUsd) > 0 && (
              <p style={{ fontSize: 11.5, color: COLORS.inkSoft, margin: '-8px 0 12px' }}>≈ {Math.round(Number(newProduct.priceUsd) * (Number(newProduct.usdRate) || exchangeRate)).toLocaleString('fr-FR')} so'm / birlik</p>
            )}
            {(unitKg(newProduct.unit) != null || newProduct.kgPerUnit !== '') && Number(newProduct.quantity) > 0 && (
              <div style={{ background: '#faf7f0', border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                <label style={labelStyle}>1 {newProduct.unit} — necha kg?</label>
                <DecInput style={{ ...inputStyle, marginBottom: 8 }} value={newProduct.kgPerUnit} onChange={v => setNewProduct({ ...newProduct, kgPerUnit: v })} />
                <label style={labelStyle}>Jami kg (ixtiyoriy, qo'lda tuzatish uchun)</label>
                <DecInput style={{ ...inputStyle, marginBottom: 0 }} value={newProduct.totalKg} onChange={v => setNewProduct({ ...newProduct, totalKg: v })} placeholder={newProduct.quantity && newProduct.kgPerUnit ? `≈ ${Number(newProduct.quantity) * Number(newProduct.kgPerUnit)}` : ''} />
              </div>
            )}
            <label style={labelStyle}>Hujjat / Partiya № (ixtiyoriy)</label>
            <input style={inputStyle} value={newProduct.documentNo} onChange={e => setNewProduct({ ...newProduct, documentNo: e.target.value })} placeholder="Nakladnoy raqami yoki partiya №" />
            <div style={{ marginTop: 6 }}><PrimaryButton type="submit">Qo'shish</PrimaryButton></div>
          </form>
        </Modal>
      )}

      {editProduct && (
        <Modal title="Mahsulotni tahrirlash" onClose={() => setEditProduct(null)}>
          <form onSubmit={handleSaveEditProduct}>
            <label style={labelStyle}>Nomi</label>
            <input style={inputStyle} value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} required />
            <label style={labelStyle}>Kategoriya</label>
            <select style={inputStyle} value={editProduct.category} onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>O'lchov birligi</label>
                <select style={inputStyle} value={editProduct.unit} onChange={e => setEditProduct({ ...editProduct, unit: e.target.value })}>
                  {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Qoldiq</label><DecInput style={inputStyle} value={editProduct.quantity} onChange={v => setEditProduct({ ...editProduct, quantity: v })} /></div>
              <div><label style={labelStyle}>Min. qoldiq</label><DecInput style={inputStyle} value={editProduct.minStock} onChange={v => setEditProduct({ ...editProduct, minStock: v })} /></div>
              <div><label style={labelStyle}>Narx (so'm)</label><DecInput style={inputStyle} value={editProduct.price} onChange={v => setEditProduct({ ...editProduct, price: v })} /></div>
            </div>
            <p style={{ fontSize: 11.5, color: COLORS.inkSoft, margin: '-4px 0 12px' }}>Diqqat: bu yerdagi qoldiq/narx o'zgarishi "Partiyalar" tizimiga ta'sir qilmaydi — faqat to'g'ridan-to'g'ri tuzatish sifatida "Amaliyotlar"da yoziladi. Aniq hisob-kitob uchun Kirim/Chiqim tugmalaridan foydalaning.</p>
            <PrimaryButton type="submit">Saqlash</PrimaryButton>
          </form>
        </Modal>
      )}

      {editBatchKg && (
        <Modal title="Og'irlikni tahrirlash" onClose={() => setEditBatchKg(null)}>
          <form onSubmit={handleSaveBatchKg}>
            <label style={labelStyle}>1 birlik — necha kg?</label>
            <DecInput style={inputStyle} value={editBatchKg.kgPerUnit} onChange={v => setEditBatchKg({ ...editBatchKg, kgPerUnit: v })} />
            <label style={labelStyle}>Jami kg</label>
            <DecInput style={inputStyle} value={editBatchKg.totalKg} onChange={v => setEditBatchKg({ ...editBatchKg, totalKg: v })} placeholder={editBatchKg.kgPerUnit ? `≈ ${editBatchKg.qty * Number(editBatchKg.kgPerUnit)}` : ''} />
            <p style={{ fontSize: 11, color: COLORS.inkSoft, margin: '-4px 0 12px' }}>Jami kg maydonini bo'sh qoldirsangiz, avtomatik hisoblanadi.</p>
            <PrimaryButton type="submit">Saqlash</PrimaryButton>
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
            <DecInput style={inputStyle} value={txForm.qty} onChange={v => setTxForm({ ...txForm, qty: v })} required />
            {showTxModal.type === 'kirim' && (
              <>
                <label style={labelStyle}>Narx (bir birlik uchun, $)</label>
                <DecInput style={inputStyle} value={txForm.priceUsd} onChange={v => setTxForm({ ...txForm, priceUsd: v })} required />
                <label style={labelStyle}>Dollar kursi (1 USD = ? so'm) — hozirgi kursni kiriting</label>
                <DecInput style={inputStyle} value={txForm.usdRate} onChange={v => setTxForm({ ...txForm, usdRate: v })} required />
                {Number(txForm.priceUsd) > 0 && Number(txForm.usdRate) > 0 && (
                  <p style={{ fontSize: 11.5, color: COLORS.inkSoft, margin: '-8px 0 12px' }}>≈ {Math.round(Number(txForm.priceUsd) * Number(txForm.usdRate)).toLocaleString('fr-FR')} so'm / birlik</p>
                )}
                <p style={{ fontSize: 11, color: COLORS.inkSoft, margin: '-8px 0 12px' }}>Dollar narxi — asosiy hisob, hech qachon o'zgarmaydi. Kurs — faqat shu partiyaning so'mdagi ko'rinishi uchun.</p>
                {(() => {
                  const prod = products.find(p => p.id === showTxModal.productId);
                  const showKg = prod && (unitKg(prod.unit) != null || txForm.kgPerUnit !== '');
                  if (!showKg) return null;
                  const computedKg = txForm.qty && txForm.kgPerUnit ? Number(txForm.qty) * Number(txForm.kgPerUnit) : null;
                  return (
                    <div style={{ background: '#faf7f0', border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                      <label style={labelStyle}>1 {prod.unit} — necha kg?</label>
                      <DecInput style={{ ...inputStyle, marginBottom: 8 }} value={txForm.kgPerUnit} onChange={v => setTxForm({ ...txForm, kgPerUnit: v })} />
                      <label style={labelStyle}>Jami kg (ixtiyoriy, qo'lda tuzatish uchun)</label>
                      <DecInput style={{ ...inputStyle, marginBottom: 0 }} value={txForm.totalKg} onChange={v => setTxForm({ ...txForm, totalKg: v })} placeholder={computedKg != null ? `≈ ${computedKg}` : ''} />
                      <p style={{ fontSize: 11, color: COLORS.inkSoft, margin: '6px 0 0' }}>Bo'sh qoldirsangiz, avtomatik hisoblanadi ({txForm.qty || '?'} × {txForm.kgPerUnit || '?'}{computedKg != null ? ` = ${computedKg} kg` : ''}).</p>
                    </div>
                  );
                })()}
              </>
            )}
            {showTxModal.type === 'chiqim' && (
              <>
                <p style={{ fontSize: 11, color: COLORS.inkSoft, margin: '-8px 0 12px' }}>Narx avtomatik — eng eski partiyadan boshlab hisoblanadi (FIFO).</p>
                {(() => {
                  const prod = products.find(p => p.id === showTxModal.productId);
                  const defKg = prod ? unitKg(prod.unit) : null;
                  const showKg = prod && (defKg != null || txForm.kgPerUnit !== '');
                  if (!showKg) return null;
                  const kgGuess = defKg != null && txForm.qty ? Number(txForm.qty) * defKg : null;
                  return (
                    <div style={{ background: '#faf7f0', border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                      <label style={labelStyle}>Jami kg (ixtiyoriy, qo'lda tuzatish uchun)</label>
                      <DecInput style={{ ...inputStyle, marginBottom: 0 }} value={txForm.totalKg} onChange={v => setTxForm({ ...txForm, totalKg: v })} placeholder={kgGuess != null ? `≈ ${kgGuess}` : ''} />
                      <p style={{ fontSize: 11, color: COLORS.inkSoft, margin: '6px 0 0' }}>Bo'sh qoldirsangiz, partiyalardagi kg ma'lumoti bo'yicha avtomatik hisoblanadi.</p>
                    </div>
                  );
                })()}
              </>
            )}
            <label style={labelStyle}>Hujjat / Partiya № (ixtiyoriy)</label>
            <input style={inputStyle} value={txForm.documentNo} onChange={e => setTxForm({ ...txForm, documentNo: e.target.value })} placeholder="Nakladnoy raqami yoki partiya №" />
            <label style={labelStyle}>Izoh (ixtiyoriy)</label>
            <input style={inputStyle} value={txForm.note} onChange={e => setTxForm({ ...txForm, note: e.target.value })} />
            <div style={{ marginTop: 6 }}><PrimaryButton type="submit" tone={showTxModal.type === 'kirim' ? 'navy' : 'rust'} disabled={txSubmitting}>{txSubmitting ? 'Saqlanmoqda...' : (showTxModal.type === 'kirim' ? 'Kirim qilish' : 'Chiqim qilish')}</PrimaryButton></div>
          </form>
        </Modal>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: COLORS.navy, color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, boxShadow: '0 10px 30px #1c243044', zIndex: 60 }}>{toast}</div>}
    </div>
  );
}
