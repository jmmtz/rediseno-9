import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Users, Settings, Tag, BarChart3, LogOut, RefreshCw, Zap, ChevronDown, Plus, Trash2, Check, X, TrendingUp, Clock, Home, CreditCard as Edit2, Save, Upload, Database, Image, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Appointment, Staff, Service, Coupon, Promotion, TrafficMode } from '../../types';
import AppointmentModal from './AppointmentModal';

type AdminTab = 'calendar' | 'stylist_view' | 'staff' | 'services' | 'coupons' | 'promos' | 'settings' | 'reportes' | 'clients' | 'gallery' | 'beauty';

interface AdminDashboardProps {
  onLogout: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  confirmada: 'bg-green-500',
  completada: 'bg-blue-500',
  cancelada: 'bg-red-500',
  no_show: 'bg-orange-500',
  pendiente: 'bg-yellow-500',
};

const TIME_SLOTS = Array.from({ length: 22 }, (_, i) => {
  const h = Math.floor(i / 2) + 9;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>('calendar');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [trafficMode, setTrafficMode] = useState<TrafficMode>('low');
  const [trafficFee, setTrafficFee] = useState(200);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);

  // Inline edit states
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editStaffData, setEditStaffData] = useState<Partial<Staff & { service_ids: string[] }>>({});
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceData, setEditServiceData] = useState<Partial<Service>>({});
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [editCouponData, setEditCouponData] = useState<Partial<Coupon>>({});
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [editPromoData, setEditPromoData] = useState<Partial<Promotion>>({});

  // Cancellation reason inputs per appointment row
  const [cancelReasons, setCancelReasons] = useState<Record<string, string>>({});

  // Client DB state
  const [clientSearch, setClientSearch] = useState('');
  const [editingClientPhone, setEditingClientPhone] = useState<string | null>(null);
  const [editClientData, setEditClientData] = useState<{ name: string; phone: string; email: string }>({ name: '', phone: '', email: '' });

  // New forms state
  const [newStaff, setNewStaff] = useState({ name: '', specialty: '', phone: '', shift_start: '09:00', shift_end: '19:00', service_ids: [] as string[] });
  const [newService, setNewService] = useState({ name: '', category: 'hair', price_min: 0, price_max: 0, duration_minutes: 60, maintenance_days: 30, description: '' });
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'flat', discount_value: 0, expires_at: '', is_maintenance_coupon: false, requires_full_payment: false, max_uses: '' });
  const [newPromo, setNewPromo] = useState({ title: '', description: '', promo_type: 'banner', discount_type: 'percent', discount_value: 0, original_price: 0, promo_price: 0 });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatarFor, setUploadingAvatarFor] = useState<string | null>(null);

  // Beauty products state
  interface BeautyProduct { id: string; title: string; description: string | null; product_type: string | null; brand: string | null; image_url: string | null; price: number; is_active: boolean; display_order: number; }
  const [beautyProducts, setBeautyProducts] = useState<BeautyProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<BeautyProduct | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({ title: '', description: '', product_type: '', brand: '', image_url: '', price: '0' });
  const productInputRef = useRef<HTMLInputElement>(null);
  const [uploadingProduct, setUploadingProduct] = useState(false);

  // Gallery state
  interface GalleryPhoto { id: string; url: string; display_order: number; is_active: boolean; category: string; }
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('general');
  const [uploadCategory, setUploadCategory] = useState('general');
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Manual appointment state
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [newAppt, setNewAppt] = useState({
    client_name: '', client_phone: '', client_email: '',
    service_id: '', staff_id: '', appointment_date: '', appointment_time: '09:00', notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const errors: string[] = [];

    try {
      const { data, error } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: false }).limit(200);
      if (error) { console.error('[AdminDashboard] appointments error:', error); errors.push('appointments'); }
      else setAppointments(data ?? []);
    } catch (e) { console.error(e); errors.push('appointments'); }

    try {
      const { data, error } = await supabase.from('staff').select('*').order('name');
      if (error) { console.error('[AdminDashboard] staff error:', error); errors.push('staff'); }
      else setStaff(data ?? []);
    } catch (e) { console.error(e); errors.push('staff'); }

    try {
      const { data, error } = await supabase.from('services').select('*').order('name');
      if (error) { console.error('[AdminDashboard] services error:', error); errors.push('services'); }
      else setServices(data ?? []);
    } catch (e) { console.error(e); errors.push('services'); }

    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) { console.error('[AdminDashboard] coupons error:', error); errors.push('coupons'); }
      else setCoupons(data ?? []);
    } catch (e) { console.error(e); errors.push('coupons'); }

    try {
      const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
      if (error) { console.error('[AdminDashboard] promotions error:', error); errors.push('promotions'); }
      else setPromotions(data ?? []);
    } catch (e) { console.error(e); errors.push('promotions'); }

    try {
      const { data, error } = await supabase.from('app_settings').select('key,value').in('key', ['traffic_mode', 'traffic_fee']);
      if (error) { console.error('[AdminDashboard] app_settings error:', error); errors.push('app_settings'); }
      else {
        data?.forEach((row) => {
          if (row.key === 'traffic_mode') setTrafficMode(row.value as TrafficMode);
          if (row.key === 'traffic_fee') setTrafficFee(parseInt(row.value) || 200);
        });
      }
    } catch (e) { console.error(e); errors.push('app_settings'); }

    setSchemaErrors(errors);
    setLoading(false);

    // Load gallery photos
    const { data: gData } = await supabase.from('gallery_photos').select('*').order('display_order', { ascending: true });
    if (gData) setGalleryPhotos(gData);

    const { data: bData } = await supabase.from('beauty_products').select('*').order('display_order', { ascending: true });
    if (bData) setBeautyProducts(bData);
  }, []);

  const autoComplete = useCallback(async () => {
    const cutoff = new Date(Date.now() - 90 * 60 * 1000);
    const pending = appointments.filter((a) => {
      if (a.status !== 'confirmada') return false;
      return new Date(`${a.appointment_date}T${a.appointment_time}`) < cutoff;
    });
    if (pending.length > 0) {
      await supabase.from('appointments')
        .update({ status: 'completada', auto_completed: true, updated_at: new Date().toISOString() })
        .in('id', pending.map((a) => a.id));
      loadData();
    }
  }, [appointments, loadData]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { autoComplete(); }, [appointments, autoComplete]);

  // ─── Metrics ───────────────────────────────────────────────────────────
  const todayISO = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.appointment_date === selectedDate);
  const todayAll = appointments.filter((a) => a.appointment_date === todayISO);
  const citasHoy = todayAll.length;
  const ingresosEstimados = todayAll.reduce((sum, a) => {
    const svc = services.find((s) => s.id === a.service_id);
    return sum + (svc ? svc.price_min : 0);
  }, 0);
  const attended = todayAll.filter((a) => a.status === 'completada' || a.status === 'confirmada').length;
  const attendanceRate = todayAll.length > 0 ? Math.round((attended / todayAll.length) * 100) : 0;

  const activeStaff = staff.filter((s) => s.is_active);

  // ─── Traffic ───────────────────────────────────────────────────────────
  async function updateTrafficMode(mode: TrafficMode) {
    await supabase.from('app_settings').upsert({ key: 'traffic_mode', value: mode, updated_at: new Date().toISOString() });
    setTrafficMode(mode);
  }

  async function updateTrafficFee(fee: number) {
    setTrafficFee(fee);
    await supabase.from('app_settings').upsert({ key: 'traffic_fee', value: String(fee), updated_at: new Date().toISOString() });
  }

  // ─── Staff CRUD ────────────────────────────────────────────────────────
  async function addStaff() {
    if (!newStaff.name) return;
    await supabase.from('staff').insert(newStaff);
    setNewStaff({ name: '', specialty: '', phone: '', shift_start: '09:00', shift_end: '19:00', service_ids: [] });
    loadData();
  }

  async function saveStaff(id: string) {
    await supabase.from('staff').update(editStaffData).eq('id', id);
    setEditingStaffId(null);
    loadData();
  }

  async function toggleStaffActive(s: Staff) {
    await supabase.from('staff').update({ is_active: !s.is_active }).eq('id', s.id);
    loadData();
  }

  async function handleAvatarUpload(staffId: string, file: File) {
    setUploadingAvatarFor(staffId);
    const ext = file.name.split('.').pop();
    const path = `staff-avatars/${staffId}.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (!upErr) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('staff').update({ avatar_url: urlData.publicUrl }).eq('id', staffId);
      loadData();
    }
    setUploadingAvatarFor(null);
  }

  // ─── Services CRUD ────────────────────────────────────────────────────
  async function addService() {
    if (!newService.name) return;
    await supabase.from('services').insert(newService);
    setNewService({ name: '', category: 'hair', price_min: 0, price_max: 0, duration_minutes: 60, maintenance_days: 30, description: '' });
    loadData();
  }

  async function saveService(id: string) {
    await supabase.from('services').update(editServiceData).eq('id', id);
    setEditingServiceId(null);
    loadData();
  }

  async function toggleServiceActive(s: Service) {
    await supabase.from('services').update({ is_active: !s.is_active }).eq('id', s.id);
    loadData();
  }

  async function deleteService(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id));
    await supabase.from('services').delete().eq('id', id);
  }

  async function deleteStaff(id: string) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    await supabase.from('staff').delete().eq('id', id);
  }

  // ─── Gallery CRUD ──────────────────────────────────────────────────────
  async function addGalleryByUrl() {
    if (!newPhotoUrl.trim()) return;
    const maxOrder = galleryPhotos.reduce((m, p) => Math.max(m, p.display_order), 0);
    const { data } = await supabase.from('gallery_photos').insert({ url: newPhotoUrl.trim(), display_order: maxOrder + 1, is_active: true, category: newPhotoCategory }).select().single();
    if (data) setGalleryPhotos((prev) => [...prev, data]);
    setNewPhotoUrl('');
  }

  async function handleGalleryUpload(file: File) {
    setUploadingGallery(true);
    const path = `gallery/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('gallery').upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
      const maxOrder = galleryPhotos.reduce((m, p) => Math.max(m, p.display_order), 0);
      const { data: newPhoto } = await supabase.from('gallery_photos').insert({ url: urlData.publicUrl, display_order: maxOrder + 1, is_active: true, category: uploadCategory }).select().single();
      if (newPhoto) setGalleryPhotos((prev) => [...prev, newPhoto]);
    }
    setUploadingGallery(false);
  }

  async function toggleGalleryPhoto(photo: GalleryPhoto) {
    await supabase.from('gallery_photos').update({ is_active: !photo.is_active }).eq('id', photo.id);
    setGalleryPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, is_active: !p.is_active } : p));
  }

  async function updateGalleryPhotoCategory(photo: GalleryPhoto, category: string) {
    await supabase.from('gallery_photos').update({ category }).eq('id', photo.id);
    setGalleryPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, category } : p));
  }

  async function deleteGalleryPhoto(id: string) {
    await supabase.from('gallery_photos').delete().eq('id', id);
    setGalleryPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  // ─── Beauty Products CRUD ─────────────────────────────────────────────
  async function loadBeautyProducts() {
    const { data } = await supabase.from('beauty_products').select('*').order('display_order', { ascending: true });
    if (data) setBeautyProducts(data as BeautyProduct[]);
  }

  async function saveProduct() {
    const payload = {
      title: productForm.title,
      description: productForm.description || null,
      product_type: productForm.product_type || null,
      brand: productForm.brand || null,
      image_url: productForm.image_url || null,
      price: parseFloat(productForm.price) || 0,
    };
    if (editingProduct) {
      await supabase.from('beauty_products').update(payload).eq('id', editingProduct.id);
    } else {
      const maxOrder = beautyProducts.reduce((m, p) => Math.max(m, p.display_order), 0);
      await supabase.from('beauty_products').insert({ ...payload, display_order: maxOrder + 1, is_active: true });
    }
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({ title: '', description: '', product_type: '', brand: '', image_url: '', price: '0' });
    loadBeautyProducts();
  }

  async function handleProductImageUpload(file: File) {
    setUploadingProduct(true);
    const ext = file.name.split('.').pop();
    const fileName = `product-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('gallery').upload(fileName, file);
    if (!upErr) {
      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);
      setProductForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    }
    setUploadingProduct(false);
  }

  async function toggleProduct(p: BeautyProduct) {
    await supabase.from('beauty_products').update({ is_active: !p.is_active }).eq('id', p.id);
    loadBeautyProducts();
  }

  async function deleteProduct(id: string) {
    await supabase.from('beauty_products').delete().eq('id', id);
    setBeautyProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function startEditProduct(p: BeautyProduct) {
    setEditingProduct(p);
    setProductForm({
      title: p.title,
      description: p.description || '',
      product_type: p.product_type || '',
      brand: p.brand || '',
      image_url: p.image_url || '',
      price: String(p.price),
    });
    setShowProductForm(true);
  }

  async function moveGalleryPhoto(id: string, direction: 'up' | 'down') {
    const idx = galleryPhotos.findIndex((p) => p.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= galleryPhotos.length) return;
    const updated = [...galleryPhotos];
    const tmpOrder = updated[idx].display_order;
    updated[idx] = { ...updated[idx], display_order: updated[swapIdx].display_order };
    updated[swapIdx] = { ...updated[swapIdx], display_order: tmpOrder };
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setGalleryPhotos(updated);
    await supabase.from('gallery_photos').update({ display_order: updated[idx].display_order }).eq('id', updated[idx].id);
    await supabase.from('gallery_photos').update({ display_order: updated[swapIdx].display_order }).eq('id', updated[swapIdx].id);
  }

  // ─── Manual Appointment ────────────────────────────────────────────────
  async function createManualAppointment() {
    if (!newAppt.client_name || !newAppt.appointment_date || !newAppt.appointment_time) return;
    const svc = services.find((s) => s.id === newAppt.service_id);
    const stf = staff.find((s) => s.id === newAppt.staff_id);
    await supabase.from('appointments').insert({
      client_name: newAppt.client_name,
      client_phone: newAppt.client_phone,
      client_email: newAppt.client_email,
      service_id: newAppt.service_id || null,
      service_name: svc?.name || '',
      staff_id: newAppt.staff_id || null,
      staff_name: stf?.name || 'Sin asignar',
      appointment_date: newAppt.appointment_date,
      appointment_time: newAppt.appointment_time,
      status: 'confirmada',
      payment_status: 'pendiente',
      payment_amount: 0,
      notes: newAppt.notes,
    });
    setNewAppt({ client_name: '', client_phone: '', client_email: '', service_id: '', staff_id: '', appointment_date: selectedDate, appointment_time: '09:00', notes: '' });
    setShowNewAppt(false);
    loadData();
  }

  // ─── Coupons CRUD ─────────────────────────────────────────────────────
  async function addCoupon() {
    if (!newCoupon.code) return;
    await supabase.from('coupons').insert({
      ...newCoupon,
      code: newCoupon.code.toUpperCase(),
      expires_at: newCoupon.expires_at || null,
      max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
    });
    setNewCoupon({ code: '', discount_type: 'flat', discount_value: 0, expires_at: '', is_maintenance_coupon: false, requires_full_payment: false, max_uses: '' });
    loadData();
  }

  async function saveCoupon(id: string) {
    await supabase.from('coupons').update(editCouponData).eq('id', id);
    setEditingCouponId(null);
    loadData();
  }

  async function deleteCoupon(id: string) {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    await supabase.from('coupons').delete().eq('id', id);
  }

  // ─── Promos CRUD ──────────────────────────────────────────────────────
  async function addPromo() {
    if (!newPromo.title) return;
    await supabase.from('promotions').insert({ ...newPromo, applicable_days: [1,2,3,4,5,6,7] });
    setNewPromo({ title: '', description: '', promo_type: 'banner', discount_type: 'percent', discount_value: 0, original_price: 0, promo_price: 0 });
    loadData();
  }

  async function savePromo(id: string) {
    await supabase.from('promotions').update(editPromoData).eq('id', id);
    setEditingPromoId(null);
    loadData();
  }

  async function togglePromo(p: Promotion) {
    await supabase.from('promotions').update({ is_active: !p.is_active }).eq('id', p.id);
    loadData();
  }

  async function deletePromo(id: string) {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    await supabase.from('promotions').delete().eq('id', id);
  }

  async function deleteAppointment(id: string) {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    await supabase.from('appointments').delete().eq('id', id);
  }

  // ─── Client aggregation ───────────────────────────────────────────────
  interface ClientRecord {
    phone: string;
    name: string;
    email: string;
    visits: number;
    cancellations: number;
    noShows: number;
    services: string[];
    lastVisit: string;
  }

  const clientMap = new Map<string, ClientRecord>();
  appointments.forEach((a) => {
    const key = a.client_phone || a.client_name;
    if (!clientMap.has(key)) {
      clientMap.set(key, { phone: a.client_phone, name: a.client_name, email: a.client_email || '', visits: 0, cancellations: 0, noShows: 0, services: [], lastVisit: a.appointment_date });
    }
    const rec = clientMap.get(key)!;
    if (a.appointment_date > rec.lastVisit) rec.lastVisit = a.appointment_date;
    if (a.status === 'completada') rec.visits++;
    else if (a.status === 'cancelada') rec.cancellations++;
    else if (a.status === 'no_show') rec.noShows++;
    if (a.service_name && !rec.services.includes(a.service_name)) rec.services.push(a.service_name);
  });
  const allClients = Array.from(clientMap.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
  const filteredClients = allClients.filter((c) => {
    const q = clientSearch.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
  });

  async function saveClientEdits(originalPhone: string) {
    const updates: Partial<{ client_name: string; client_phone: string; client_email: string }> = {};
    if (editClientData.name) updates.client_name = editClientData.name;
    if (editClientData.phone) updates.client_phone = editClientData.phone;
    updates.client_email = editClientData.email;
    await supabase.from('appointments').update(updates).eq('client_phone', originalPhone);
    setEditingClientPhone(null);
    loadData();
  }

  // ─── Attendance quick-update ──────────────────────────────────────────
  async function markAttendance(apptId: string, arrived: boolean) {
    const status = arrived ? 'completada' : 'no_show';
    await supabase.from('appointments').update({ status, updated_at: new Date().toISOString() }).eq('id', apptId);
    loadData();
  }

  async function saveCancelReason(appt: Appointment) {
    const reason = cancelReasons[appt.id] || '';
    await supabase.from('appointments').update({
      status: 'cancelada',
      cancellation_reason: reason,
      updated_at: new Date().toISOString(),
    }).eq('id', appt.id);
    loadData();
  }

  const navItems: { key: AdminTab; icon: React.ReactNode; label: string }[] = [
    { key: 'calendar', icon: <Calendar size={18} />, label: 'Calendario' },
    { key: 'stylist_view', icon: <Users size={18} />, label: 'Por Estilista' },
    { key: 'reportes', icon: <BarChart3 size={18} />, label: 'Reportes' },
    { key: 'clients', icon: <Database size={18} />, label: 'Base de Datos' },
    { key: 'staff', icon: <Users size={18} />, label: 'Personal' },
    { key: 'services', icon: <TrendingUp size={18} />, label: 'Servicios' },
    { key: 'gallery', icon: <Image size={18} />, label: 'Galería' },
    { key: 'beauty', icon: <ShoppingBag size={18} />, label: 'Beauty' },
    { key: 'coupons', icon: <Tag size={18} />, label: 'Cupones' },
    { key: 'promos', icon: <TrendingUp size={18} />, label: 'Promos' },
    { key: 'settings', icon: <Settings size={18} />, label: 'Configuración' },
  ];

  const inputCls = "bg-[#FBFBF9] border border-gray-200 rounded-xl px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/20 focus:outline-none text-sm transition-all";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-gray-100 bg-[#FBFBF9] shrink-0 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <img src="/images/logos-buenos-negro.png" alt="La Rue" className="h-9 w-auto object-contain" />
          <p className="text-gray-400 text-xs mt-1 font-medium tracking-wide">Panel de Administración</p>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                tab === item.key
                  ? 'bg-black text-white font-semibold shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-[#FBFBF9]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-1">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#C9A000] hover:text-black hover:bg-[#FFFBE6] border border-[#111111]/40 font-medium transition-colors"
          >
            <Home size={18} />
            Salir al Inicio
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#FBFBF9] border-t border-gray-100 flex overflow-x-auto z-40 px-2 py-2 gap-1 shadow-lg">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 ${
              tab === item.key ? 'text-[#C9A000]' : 'text-gray-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs text-red-400 whitespace-nowrap shrink-0"
        >
          <LogOut size={18} />
          <span className="text-[10px]">Salir</span>
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#FBFBF9] sticky top-0 z-30 shadow-sm">
          <h1 className="text-gray-900 font-semibold capitalize text-lg">
            {navItems.find((n) => n.key === tab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Zap size={14} className={trafficMode === 'high' ? 'text-red-500' : trafficMode === 'medium' ? 'text-amber-500' : 'text-green-500'} />
              <select
                value={trafficMode}
                onChange={(e) => updateTrafficMode(e.target.value as TrafficMode)}
                className="bg-[#FBFBF9] border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-xs focus:border-[#111111] focus:outline-none"
              >
                <option value="low">Bajo Tráfico</option>
                <option value="medium">Flujo Medio</option>
                <option value="high">Alta Demanda</option>
              </select>
            </div>
            <button onClick={loadData} disabled={loading} className="text-gray-400 hover:text-gray-700 transition-colors">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="p-6">

          {/* ===== CALENDAR VIEW ===== */}
          {tab === 'calendar' && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 flex-wrap">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#FBFBF9] border border-gray-200 rounded-lg px-4 py-2 text-gray-900 text-sm focus:border-[#111111] focus:outline-none"
                />
                <p className="text-gray-500 text-sm">{todayAppts.length} citas</p>
                <button
                  onClick={() => { setNewAppt({ ...newAppt, appointment_date: selectedDate }); setShowNewAppt(true); }}
                  className="ml-auto bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded-none flex items-center gap-2 transition-colors"
                >
                  <Plus size={14} /> Nueva Cita
                </button>
              </div>

              {/* Manual appointment form */}
              {showNewAppt && (
                <div className="bg-[#FBFBF9] border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
                  <p className="text-gray-900 font-medium text-sm">Nueva Cita Manual</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Nombre cliente *</label>
                      <input value={newAppt.client_name} onChange={(e) => setNewAppt({ ...newAppt, client_name: e.target.value })} placeholder="Nombre completo" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Teléfono</label>
                      <input value={newAppt.client_phone} onChange={(e) => setNewAppt({ ...newAppt, client_phone: e.target.value })} placeholder="871 000 0000" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input value={newAppt.client_email} onChange={(e) => setNewAppt({ ...newAppt, client_email: e.target.value })} placeholder="correo@..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Servicio</label>
                      <select value={newAppt.service_id} onChange={(e) => setNewAppt({ ...newAppt, service_id: e.target.value })} className={inputCls}>
                        <option value="">Sin servicio</option>
                        {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Especialista</label>
                      <select value={newAppt.staff_id} onChange={(e) => setNewAppt({ ...newAppt, staff_id: e.target.value })} className={inputCls}>
                        <option value="">Sin asignar</option>
                        {staff.filter((s) => s.is_active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Fecha *</label>
                      <input type="date" value={newAppt.appointment_date} onChange={(e) => setNewAppt({ ...newAppt, appointment_date: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Hora *</label>
                      <input type="time" value={newAppt.appointment_time} onChange={(e) => setNewAppt({ ...newAppt, appointment_time: e.target.value })} className={inputCls} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Notas</label>
                      <input value={newAppt.notes} onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })} placeholder="Indicaciones adicionales..." className={inputCls} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={createManualAppointment} className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded-none flex items-center gap-1.5"><Check size={13} /> Crear Cita</button>
                    <button onClick={() => setShowNewAppt(false)} className="bg-gray-100 text-gray-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-200">Cancelar</button>
                  </div>
                </div>
              )}

              {todayAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Calendar size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-500">No hay citas para esta fecha</p>
                </div>
              ) : (
                <div className="bg-[#FBFBF9] rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-[#FBFBF9]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Servicio</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Especialista</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {todayAppts.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)).map((appt) => (
                        <tr key={appt.id} className="hover:bg-[#FBFBF9] transition-colors cursor-pointer" onClick={() => setSelectedAppt(appt)}>
                          <td className="px-4 py-3 text-[#C9A000] font-bold">{appt.appointment_time.slice(0,5)}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{appt.client_name}</p>
                            <p className="text-gray-400 text-xs">{appt.client_phone}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{appt.service_name}</td>
                          <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{appt.staff_name}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_COLORS[appt.status]}`}>
                              {appt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== REPORTES Y ANALÍTICAS ===== */}
          {tab === 'reportes' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FBFBF9] rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">Citas Hoy</p>
                  <p className="text-gray-900 text-4xl font-black">{citasHoy}</p>
                  <p className="text-gray-400 text-xs mt-1">{todayISO}</p>
                </div>
                <div className="bg-[#FBFBF9] rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">Ingresos Estimados</p>
                  <p className="text-[#C9A000] text-4xl font-black">${ingresosEstimados.toLocaleString('es-MX')}</p>
                  <p className="text-gray-400 text-xs mt-1">MXN · precio mín</p>
                </div>
                <div className="bg-[#FBFBF9] rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">Tasa de Asistencia</p>
                  <p className={`text-4xl font-black ${attendanceRate >= 70 ? 'text-green-600' : attendanceRate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{attendanceRate}%</p>
                  <p className="text-gray-400 text-xs mt-1">{attended}/{citasHoy} vinieron hoy</p>
                </div>
              </div>

              {/* Date filter */}
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#FBFBF9] border border-gray-200 rounded-lg px-4 py-2 text-gray-900 text-sm focus:border-[#111111] focus:outline-none"
                />
                <p className="text-gray-500 text-sm">{todayAppts.length} citas para esta fecha</p>
              </div>

              {/* Attendance table */}
              {todayAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BarChart3 size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-500">No hay citas para esta fecha</p>
                </div>
              ) : (
                <div className="bg-[#FBFBF9] rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-[#FBFBF9]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Servicio</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Especialista</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {todayAppts.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)).map((appt) => (
                        <tr key={appt.id} className="hover:bg-[#FBFBF9] transition-colors">
                          <td className="px-4 py-3 text-[#C9A000] font-bold">{appt.appointment_time.slice(0,5)}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{appt.client_name}</p>
                            <p className="text-gray-400 text-xs">{appt.client_phone}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{appt.service_name}</td>
                          <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{appt.staff_name}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_COLORS[appt.status]}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {appt.status === 'confirmada' || appt.status === 'pendiente' ? (
                              <div className="flex flex-col gap-1.5">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => markAttendance(appt.id, true)}
                                    className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                  >
                                    Vino
                                  </button>
                                  <button
                                    onClick={() => markAttendance(appt.id, false)}
                                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                  >
                                    No Vino
                                  </button>
                                  <button
                                    onClick={() => deleteAppointment(appt.id)}
                                    className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 p-1.5 rounded-lg transition-colors"
                                    title="Eliminar cita"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                <div className="flex gap-1">
                                  <input
                                    value={cancelReasons[appt.id] || ''}
                                    onChange={(e) => setCancelReasons({ ...cancelReasons, [appt.id]: e.target.value })}
                                    placeholder="Motivo cancelación..."
                                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:border-red-300 focus:outline-none"
                                  />
                                  {cancelReasons[appt.id] && (
                                    <button
                                      onClick={() => saveCancelReason(appt)}
                                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg border border-red-200 transition-colors whitespace-nowrap"
                                    >
                                      Cancelar
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button onClick={() => setSelectedAppt(appt)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                                  <ChevronDown size={16} className="rotate-[-90deg]" />
                                </button>
                                <button
                                  onClick={() => deleteAppointment(appt.id)}
                                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                  title="Eliminar cita"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== STYLIST VIEW ===== */}
          {tab === 'stylist_view' && (
            <div className="space-y-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#FBFBF9] border border-gray-200 rounded-lg px-4 py-2 text-gray-900 text-sm focus:border-[#111111] focus:outline-none"
              />
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <div className="grid gap-px" style={{ gridTemplateColumns: `80px repeat(${activeStaff.length}, 180px)` }}>
                    <div className="bg-gray-100 p-3 rounded-tl-xl"><p className="text-gray-500 text-xs">Hora</p></div>
                    {activeStaff.map((s) => (
                      <div key={s.id} className="bg-gray-100 p-3 text-center border-l border-gray-200">
                        <p className="text-gray-900 font-medium text-sm">{s.name}</p>
                        <p className="text-gray-500 text-xs">{s.specialty}</p>
                      </div>
                    ))}
                  </div>
                  {TIME_SLOTS.map((time) => (
                    <div key={time} className="grid gap-px border-t border-gray-100" style={{ gridTemplateColumns: `80px repeat(${activeStaff.length}, 180px)` }}>
                      <div className="bg-[#FBFBF9] p-2 flex items-center">
                        <span className="text-gray-400 text-xs">{time}</span>
                      </div>
                      {activeStaff.map((s) => {
                        const appt = todayAppts.find((a) =>
                          (a.staff_id === s.id || (!a.staff_id && a.staff_name === s.name)) &&
                          a.appointment_time.startsWith(time.slice(0, 5))
                        );
                        return (
                          <div key={s.id} className="bg-[#FBFBF9] border-l border-gray-100 p-1 min-h-[44px]">
                            {appt && (
                              <div
                                onClick={() => setSelectedAppt(appt)}
                                className={`rounded p-1.5 cursor-pointer ${STATUS_COLORS[appt.status]} bg-opacity-20 border border-current/20`}
                                style={{ borderLeftWidth: 3 }}
                              >
                                <p className="text-gray-900 text-xs font-medium truncate">{appt.client_name}</p>
                                <p className="text-gray-500 text-[10px] truncate">{appt.service_name}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== STAFF ===== */}
          {tab === 'staff' && (
            <div className="space-y-6">
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && uploadingAvatarFor) handleAvatarUpload(uploadingAvatarFor, file);
                }}
              />
              {/* Add form */}
              <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-5 space-y-3 shadow-sm">
                <p className="text-gray-900 font-medium text-sm">Agregar Profesional</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className={labelCls}>Nombre</label>
                    <input value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="Nombre completo" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Especialidad</label>
                    <input value={newStaff.specialty} onChange={(e) => setNewStaff({ ...newStaff, specialty: e.target.value })} placeholder="Ej: Colorista" className={inputCls} />
                    <input value={newStaff.phone} onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })} placeholder="Tel/WhatsApp (ej: 5215512345678)" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Entrada</label>
                    <input type="time" value={newStaff.shift_start} onChange={(e) => setNewStaff({ ...newStaff, shift_start: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Salida</label>
                    <input type="time" value={newStaff.shift_end} onChange={(e) => setNewStaff({ ...newStaff, shift_end: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Servicios que atiende (selecciona varios)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {services.map((svc) => {
                      const selected = newStaff.service_ids.includes(svc.id);
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => setNewStaff({
                            ...newStaff,
                            service_ids: selected
                              ? newStaff.service_ids.filter((id) => id !== svc.id)
                              : [...newStaff.service_ids, svc.id],
                          })}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            selected ? 'bg-[#111111] border-[#111111] text-white font-semibold' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                          }`}
                        >
                          {svc.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={addStaff} className="bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-5 py-2 rounded-none transition-colors flex items-center gap-2">
                  <Plus size={16} /> Agregar
                </button>
              </div>

              <div className="space-y-3">
                {staff.map((s) => {
                  const isEditing = editingStaffId === s.id;
                  const ed = editStaffData as (Staff & { service_ids?: string[] });
                  const svcIds: string[] = (isEditing ? (ed.service_ids ?? []) : ((s as Staff & { service_ids?: string[] }).service_ids ?? []));
                  return (
                    <div key={s.id} className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt={s.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[#FFFBE6] flex items-center justify-center text-[#C9A000] font-bold">
                              {s.name.charAt(0)}
                            </div>
                          )}
                          <button
                            onClick={() => { setUploadingAvatarFor(s.id); avatarInputRef.current?.click(); }}
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FBFBF9] border border-gray-200 rounded-full flex items-center justify-center hover:bg-[#FBFBF9] transition-colors"
                            title="Subir foto"
                          >
                            {uploadingAvatarFor === s.id ? <RefreshCw size={10} className="animate-spin text-gray-500" /> : <Upload size={10} className="text-gray-500" />}
                          </button>
                        </div>

                        {isEditing ? (
                          <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className={labelCls}>Nombre</label>
                                <input value={ed.name ?? s.name} onChange={(e) => setEditStaffData({ ...ed, name: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>Especialidad</label>
                                <input value={ed.specialty ?? s.specialty} onChange={(e) => setEditStaffData({ ...ed, specialty: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>Tel/WhatsApp</label>
                                <input value={ed.phone ?? ''} onChange={(e) => setEditStaffData({ ...ed, phone: e.target.value })} placeholder="5215512345678" className={inputCls} />
                                <input type="time" value={ed.shift_start ?? s.shift_start} onChange={(e) => setEditStaffData({ ...ed, shift_start: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>Salida</label>
                                <input type="time" value={ed.shift_end ?? s.shift_end} onChange={(e) => setEditStaffData({ ...ed, shift_end: e.target.value })} className={inputCls} />
                              </div>
                            </div>
                            <div>
                              <label className={labelCls}>Servicios</label>
                              <div className="flex flex-wrap gap-1.5">
                                {services.map((svc) => {
                                  const sel = svcIds.includes(svc.id);
                                  return (
                                    <button
                                      key={svc.id}
                                      type="button"
                                      onClick={() => setEditStaffData({
                                        ...ed,
                                        service_ids: sel
                                          ? svcIds.filter((id) => id !== svc.id)
                                          : [...svcIds, svc.id],
                                      })}
                                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${sel ? 'bg-[#111111] border-[#111111] text-white font-semibold' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}
                                    >
                                      {svc.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => saveStaff(s.id)} className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-1.5 rounded-none flex items-center gap-1.5"><Save size={13} /> Guardar</button>
                              <button onClick={() => setEditingStaffId(null)} className="bg-gray-100 text-gray-600 text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-gray-200">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium text-sm">{s.name}</p>
                            <p className="text-gray-500 text-xs">{s.specialty} • {s.shift_start} – {s.shift_end}</p>
                            {svcIds.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {svcIds.map((id) => {
                                  const svc = services.find((sv) => sv.id === id);
                                  return svc ? (
                                    <span key={id} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{svc.name}</span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {!isEditing && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => { setEditingStaffId(s.id); setEditStaffData({ name: s.name, specialty: s.specialty, phone: (s as any).phone ?? '', shift_start: s.shift_start, shift_end: s.shift_end, service_ids: (s as Staff & { service_ids?: string[] }).service_ids ?? [] }); }}
                              className="text-gray-400 hover:text-[#C9A000] transition-colors p-1.5 rounded-lg hover:bg-[#FFFBE6]"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => toggleStaffActive(s)}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                                s.is_active ? 'bg-green-50 border-green-200 text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700' :
                                'bg-red-50 border-red-200 text-red-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700'
                              }`}
                            >
                              {s.is_active ? 'Activo' : 'Inactivo'}
                            </button>
                            <button
                              onClick={() => deleteStaff(s.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== SERVICES ===== */}
          {tab === 'services' && (
            <div className="space-y-6">
              <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-5 space-y-3 shadow-sm">
                <p className="text-gray-900 font-medium text-sm">Agregar Servicio</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <label className={labelCls}>Nombre del servicio</label>
                    <input value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="Ej: Corte de Cabello" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Categoría</label>
                    <select value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} className={inputCls}>
                      {['hair', 'nails', 'spa', 'makeup'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Descripción</label>
                    <input value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} placeholder="Breve descripción" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Precio mínimo (MXN)</label>
                    <input type="number" value={newService.price_min} onChange={(e) => setNewService({ ...newService, price_min: +e.target.value })} placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Precio máximo (MXN)</label>
                    <input type="number" value={newService.price_max} onChange={(e) => setNewService({ ...newService, price_max: +e.target.value })} placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Duración (minutos)</label>
                    <input type="number" value={newService.duration_minutes} onChange={(e) => setNewService({ ...newService, duration_minutes: +e.target.value })} placeholder="60" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Intervalo de mantenimiento (días)</label>
                    <input type="number" value={newService.maintenance_days} onChange={(e) => setNewService({ ...newService, maintenance_days: +e.target.value })} placeholder="30" className={inputCls} />
                  </div>
                </div>
                <button onClick={addService} className="bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-5 py-2 rounded-none transition-colors flex items-center gap-2">
                  <Plus size={16} /> Agregar
                </button>
              </div>

              <div className="space-y-2">
                {services.map((s) => {
                  const isEditing = editingServiceId === s.id;
                  const ed = editServiceData;
                  return (
                    <div key={s.id} className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-4 shadow-sm">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                              <label className={labelCls}>Nombre</label>
                              <input value={String(ed.name ?? s.name)} onChange={(e) => setEditServiceData({ ...ed, name: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Precio mín (MXN)</label>
                              <input type="number" value={Number(ed.price_min ?? s.price_min)} onChange={(e) => setEditServiceData({ ...ed, price_min: +e.target.value })} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Precio máx (MXN)</label>
                              <input type="number" value={Number(ed.price_max ?? s.price_max)} onChange={(e) => setEditServiceData({ ...ed, price_max: +e.target.value })} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Duración (min)</label>
                              <input type="number" value={Number(ed.duration_minutes ?? s.duration_minutes)} onChange={(e) => setEditServiceData({ ...ed, duration_minutes: +e.target.value })} className={inputCls} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveService(s.id)} className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-1.5 rounded-none flex items-center gap-1.5"><Save size={13} /> Guardar</button>
                            <button onClick={() => setEditingServiceId(null)} className="bg-gray-100 text-gray-600 text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-gray-200">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium text-sm">{s.name}</p>
                            <p className="text-gray-500 text-xs">${s.price_min}–${s.price_max} MXN • {s.duration_minutes} min • Mantenimiento: {s.maintenance_days} días</p>
                          </div>
                          <button onClick={() => { setEditingServiceId(s.id); setEditServiceData({ name: s.name, price_min: s.price_min, price_max: s.price_max, duration_minutes: s.duration_minutes }); }} className="text-gray-400 hover:text-[#C9A000] p-1.5 rounded-lg hover:bg-[#FFFBE6] transition-colors"><Edit2 size={15} /></button>
                          <button onClick={() => toggleServiceActive(s)} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${s.is_active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {s.is_active ? 'Activo' : 'Inactivo'}
                          </button>
                          <button onClick={() => deleteService(s.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5"><Trash2 size={15} /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== COUPONS ===== */}
          {tab === 'coupons' && (
            <div className="space-y-6">
              <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-5 space-y-3 shadow-sm">
                <p className="text-gray-900 font-medium text-sm">Crear Cupón</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Código de cupón</label>
                    <input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="VERANO20" className={`${inputCls} font-mono`} />
                  </div>
                  <div>
                    <label className={labelCls}>Tipo de descuento</label>
                    <select value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })} className={inputCls}>
                      <option value="flat">Monto fijo (MXN)</option>
                      <option value="percent">Porcentaje (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Valor del descuento</label>
                    <input type="number" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: +e.target.value })} placeholder="0" className={inputCls} />
                    <p className="text-gray-400 text-[10px] mt-0.5">{newCoupon.discount_type === 'flat' ? 'En pesos MXN' : 'Porcentaje 0–100'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Fecha de vencimiento (opcional)</label>
                    <input type="datetime-local" value={newCoupon.expires_at} onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Usos máximos</label>
                    <input type="number" value={newCoupon.max_uses} onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })} placeholder="Vacío = ilimitado" className={inputCls} />
                    <p className="text-gray-400 text-[10px] mt-0.5">Deja vacío para usos ilimitados</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-gray-500 text-sm cursor-pointer">
                  <input type="checkbox" checked={newCoupon.is_maintenance_coupon} onChange={(e) => setNewCoupon({ ...newCoupon, is_maintenance_coupon: e.target.checked, requires_full_payment: e.target.checked })} className="rounded" />
                  Cupón de Mantenimiento — requiere pago completo del servicio
                </label>
                <button onClick={addCoupon} className="bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-5 py-2 rounded-none transition-colors flex items-center gap-2">
                  <Plus size={16} /> Crear Cupón
                </button>
              </div>

              <div className="space-y-2">
                {coupons.map((c) => {
                  const isEditing = editingCouponId === c.id;
                  const ed = editCouponData;
                  return (
                    <div key={c.id} className={`bg-[#FBFBF9] border rounded-xl p-4 shadow-sm ${c.is_active ? 'border-gray-100' : 'border-gray-100 opacity-50'}`}>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className={labelCls}>Código</label>
                              <input value={String(ed.code ?? c.code)} onChange={(e) => setEditCouponData({ ...ed, code: e.target.value.toUpperCase() })} className={`${inputCls} font-mono`} />
                            </div>
                            <div>
                              <label className={labelCls}>Tipo</label>
                              <select value={String(ed.discount_type ?? c.discount_type)} onChange={(e) => setEditCouponData({ ...ed, discount_type: e.target.value as 'flat' | 'percent' })} className={inputCls}>
                                <option value="flat">Monto fijo (MXN)</option>
                                <option value="percent">Porcentaje (%)</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Valor</label>
                              <input type="number" value={Number(ed.discount_value ?? c.discount_value)} onChange={(e) => setEditCouponData({ ...ed, discount_value: +e.target.value })} className={inputCls} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveCoupon(c.id)} className="bg-[#111111] text-white text-xs font-semibold px-4 py-1.5 rounded-none flex items-center gap-1.5"><Save size={13} /> Guardar</button>
                            <button onClick={() => setEditingCouponId(null)} className="bg-gray-100 text-gray-600 text-xs px-4 py-1.5 rounded-lg">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-[#C9A000] font-mono font-bold text-sm">{c.code}</p>
                              {c.is_maintenance_coupon && <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded">Mantenimiento</span>}
                              {!c.is_active && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded">Inactivo</span>}
                            </div>
                            <p className="text-gray-500 text-xs">
                              {c.discount_type === 'flat' ? `$${c.discount_value} MXN` : `${c.discount_value}%`}
                              {c.expires_at && ` • Vence: ${new Date(c.expires_at).toLocaleDateString('es-MX')}`}
                              {` • Usos: ${c.used_count}${c.max_uses ? '/' + c.max_uses : ''}`}
                            </p>
                          </div>
                          <button onClick={() => { setEditingCouponId(c.id); setEditCouponData({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value }); }} className="text-gray-400 hover:text-[#C9A000] p-1.5 rounded-lg hover:bg-[#FFFBE6] transition-colors"><Edit2 size={15} /></button>
                          <button onClick={() => deleteCoupon(c.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5"><Trash2 size={16} /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== PROMOTIONS ===== */}
          {tab === 'promos' && (
            <div className="space-y-6">
              <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-5 space-y-3 shadow-sm">
                <p className="text-gray-900 font-medium text-sm">Nueva Promoción</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={labelCls}>Título de la promoción</label>
                    <input value={newPromo.title} onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })} placeholder="Ej: Lunes de Descuento" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Descripción</label>
                    <input value={newPromo.description} onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })} placeholder="Breve descripción visible al cliente" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Tipo de promo</label>
                    <select value={newPromo.promo_type} onChange={(e) => setNewPromo({ ...newPromo, promo_type: e.target.value })} className={inputCls}>
                      {['banner','combo','happy_hour','free_upgrade'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Tipo de descuento</label>
                    <select value={newPromo.discount_type} onChange={(e) => setNewPromo({ ...newPromo, discount_type: e.target.value })} className={inputCls}>
                      <option value="percent">Porcentaje (%)</option>
                      <option value="flat">Monto fijo (MXN)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Valor del descuento</label>
                    <input type="number" value={newPromo.discount_value} onChange={(e) => setNewPromo({ ...newPromo, discount_value: +e.target.value })} placeholder="0" className={inputCls} />
                    <p className="text-gray-400 text-[10px] mt-0.5">{newPromo.discount_type === 'flat' ? 'En pesos MXN' : 'Porcentaje 0–100'}</p>
                  </div>
                  <div>
                    <label className={labelCls}>Precio original combo (MXN)</label>
                    <input type="number" value={newPromo.original_price} onChange={(e) => setNewPromo({ ...newPromo, original_price: +e.target.value })} placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Precio promo combo (MXN)</label>
                    <input type="number" value={newPromo.promo_price} onChange={(e) => setNewPromo({ ...newPromo, promo_price: +e.target.value })} placeholder="0" className={inputCls} />
                  </div>
                </div>
                <button onClick={addPromo} className="bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-5 py-2 rounded-none transition-colors flex items-center gap-2">
                  <Plus size={16} /> Crear Promo
                </button>
              </div>

              <div className="space-y-2">
                {promotions.map((p) => {
                  const isEditing = editingPromoId === p.id;
                  const ed = editPromoData;
                  return (
                    <div key={p.id} className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-4 shadow-sm">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                              <label className={labelCls}>Título</label>
                              <input value={String(ed.title ?? p.title)} onChange={(e) => setEditPromoData({ ...ed, title: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Valor descuento</label>
                              <input type="number" value={Number(ed.discount_value ?? p.discount_value)} onChange={(e) => setEditPromoData({ ...ed, discount_value: +e.target.value })} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Precio promo (MXN)</label>
                              <input type="number" value={Number(ed.promo_price ?? p.promo_price)} onChange={(e) => setEditPromoData({ ...ed, promo_price: +e.target.value })} className={inputCls} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => savePromo(p.id)} className="bg-[#111111] text-white text-xs font-semibold px-4 py-1.5 rounded-none flex items-center gap-1.5"><Save size={13} /> Guardar</button>
                            <button onClick={() => setEditingPromoId(null)} className="bg-gray-100 text-gray-600 text-xs px-4 py-1.5 rounded-lg">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-gray-900 font-medium text-sm">{p.title}</p>
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider">{p.promo_type}</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">{p.description}</p>
                            {p.original_price > 0 && (
                              <p className="text-xs mt-0.5">
                                <span className="line-through text-gray-400">${p.original_price.toLocaleString()}</span>
                                <span className="text-[#C9A000] font-semibold ml-1">${p.promo_price.toLocaleString()} MXN</span>
                              </p>
                            )}
                          </div>
                          <button onClick={() => { setEditingPromoId(p.id); setEditPromoData({ title: p.title, discount_value: p.discount_value, promo_price: p.promo_price }); }} className="text-gray-400 hover:text-[#C9A000] p-1.5 rounded-lg hover:bg-[#FFFBE6] transition-colors"><Edit2 size={15} /></button>
                          <button onClick={() => togglePromo(p)} className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${p.is_active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-[#FBFBF9] border-gray-200 text-gray-400'}`}>
                            {p.is_active ? <Check size={14} /> : <X size={14} />}
                          </button>
                          <button onClick={() => deletePromo(p.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5"><Trash2 size={15} /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== GALLERY ===== */}
          {tab === 'gallery' && (
            <div className="space-y-6">
              {(() => {
                const GALLERY_CATEGORIES = [
                  { value: 'coloracion', label: 'Coloración' },
                  { value: 'corte', label: 'Corte' },
                  { value: 'depilacion', label: 'Depilación Facial' },
                  { value: 'tratamientos', label: 'Tratamientos Capilares' },
                  { value: 'maquillaje', label: 'Maquillaje y Peinado' },
                  { value: 'manos_pies', label: 'Manos y Pies' },
                  { value: 'faciales', label: 'Faciales y Bienestar' },
                  { value: 'general', label: 'General' },
                ];
                const CAT_ORDER = ['coloracion','corte','depilacion','tratamientos','maquillaje','manos_pies','faciales','general'];
                const CAT_LABELS: Record<string,string> = Object.fromEntries(GALLERY_CATEGORIES.map(c => [c.value, c.label]));
                const grouped = CAT_ORDER
                  .map(cat => ({ category: cat, label: CAT_LABELS[cat], photos: galleryPhotos.filter(p => (p.category || 'general') === cat) }))
                  .filter(g => g.photos.length > 0);

                return (
                  <>
                    <input ref={galleryInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleGalleryUpload(file);
                      }}
                    />
                    <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-5 space-y-3 shadow-sm">
                      <p className="text-gray-900 font-medium text-sm">Agregar Foto</p>
                      <div className="flex gap-3">
                        <input
                          value={newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          placeholder="URL de la imagen (ej: /images/foto.jpg)"
                          className={`${inputCls} flex-1`}
                        />
                        <select
                          value={newPhotoCategory}
                          onChange={(e) => setNewPhotoCategory(e.target.value)}
                          className={`${inputCls} w-40`}
                        >
                          {GALLERY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <button onClick={addGalleryByUrl} className="bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-4 py-2 rounded-none transition-colors flex items-center gap-2 shrink-0">
                          <Plus size={14} /> Agregar URL
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value)}
                          className={`${inputCls} w-48`}
                        >
                          {GALLERY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <button
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={uploadingGallery}
                          className="bg-[#FBFBF9] border border-gray-200 hover:border-[#111111] text-gray-600 text-sm font-medium px-4 py-2 rounded-none transition-colors flex items-center gap-2"
                        >
                          {uploadingGallery ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                          {uploadingGallery ? 'Subiendo...' : 'Subir desde dispositivo'}
                        </button>
                      </div>
                    </div>

                    {grouped.map(group => {
                      const globalStartIdx = galleryPhotos.findIndex(p => (p.category || 'general') === group.category);
                      return (
                        <div key={group.category}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-px flex-1 bg-[#1a1a1a]/10" />
                            <p className="text-xs tracking-[0.2em] uppercase text-[#8B7355] font-medium">{group.label}</p>
                            <div className="h-px flex-1 bg-[#1a1a1a]/10" />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {group.photos.map((photo, localIdx) => {
                              const idx = globalStartIdx + localIdx;
                              return (
                                <div key={photo.id} className={`relative group border rounded-xl overflow-hidden flex flex-col ${photo.is_active ? 'border-gray-200' : 'border-red-200'}`}>
                                  <div className="aspect-[3/4] bg-gray-100 relative">
                                    <img
                                      src={photo.url}
                                      alt=""
                                      className={`w-full h-full object-cover object-top transition-opacity duration-200 ${photo.is_active ? '' : 'opacity-40'}`}
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-[#1a1a1a]/0 group-hover:bg-[#1a1a1a]/50 transition-all duration-300 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                                      <button
                                        onClick={() => moveGalleryPhoto(photo.id, 'up')}
                                        disabled={idx === 0}
                                        className="bg-white/90 hover:bg-white text-gray-800 text-xs font-bold px-2.5 py-1.5 rounded disabled:opacity-30"
                                      >↑</button>
                                      <button
                                        onClick={() => moveGalleryPhoto(photo.id, 'down')}
                                        disabled={idx === galleryPhotos.length - 1}
                                        className="bg-white/90 hover:bg-white text-gray-800 text-xs font-bold px-2.5 py-1.5 rounded disabled:opacity-30"
                                      >↓</button>
                                    </div>
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                                      #{photo.display_order}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 p-2 bg-white border-t border-gray-100">
                                    <select
                                      value={photo.category || 'general'}
                                      onChange={(e) => updateGalleryPhotoCategory(photo, e.target.value)}
                                      className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 bg-[#FBFBF9] text-gray-700 focus:outline-none focus:border-[#111111]"
                                    >
                                      {GALLERY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <button
                                      onClick={() => toggleGalleryPhoto(photo)}
                                      className={`text-xs font-semibold py-1.5 px-2 rounded border transition-colors ${
                                        photo.is_active
                                          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700'
                                          : 'bg-red-50 border-red-200 text-red-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700'
                                      }`}
                                    >
                                      {photo.is_active ? 'On' : 'Off'}
                                    </button>
                                    <button
                                      onClick={() => deleteGalleryPhoto(photo.id)}
                                      className="text-gray-400 hover:text-red-500 p-1.5 rounded border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors"
                                      title="Eliminar"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          )}

          {/* ===== BEAUTY PRODUCTS ===== */}
          {tab === 'beauty' && (
            <div className="space-y-6">
              <input ref={productInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProductImageUpload(f); }}
              />

              {showProductForm ? (
                <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-5 space-y-4 shadow-sm max-w-2xl">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-medium text-sm">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</p>
                    <button onClick={() => { setShowProductForm(false); setEditingProduct(null); setProductForm({ title: '', description: '', product_type: '', brand: '', image_url: '', price: '0' }); }} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                  </div>
                  <div>
                    <label className={labelCls}>Título *</label>
                    <input value={productForm.title} onChange={(e) => setProductForm({ ...productForm, title: e.target.value })} className={inputCls} placeholder="Ej: Labial mate rojo" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Tipo de producto</label>
                      <input value={productForm.product_type} onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })} className={inputCls} placeholder="Ej: Labial" />
                    </div>
                    <div>
                      <label className={labelCls}>Marca</label>
                      <input value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} className={inputCls} placeholder="Ej: MAC" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Descripción</label>
                    <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className={`${inputCls} min-h-[80px]`} placeholder="Descripción del producto..." />
                  </div>
                  <div>
                    <label className={labelCls}>Precio (MXN)</label>
                    <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className={`${inputCls} max-w-[160px]`} min={0} />
                  </div>
                  <div>
                    <label className={labelCls}>Imagen</label>
                    <div className="flex items-center gap-3">
                      {productForm.image_url && <img src={productForm.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />}
                      <button onClick={() => productInputRef.current?.click()} disabled={uploadingProduct} className="bg-[#FBFBF9] border border-gray-200 hover:border-[#111111] text-gray-600 text-sm font-medium px-4 py-2 rounded-none flex items-center gap-2">
                        {uploadingProduct ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                        {uploadingProduct ? 'Subiendo...' : 'Subir imagen'}
                      </button>
                    </div>
                  </div>
                  <button onClick={saveProduct} disabled={!productForm.title.trim()} className="bg-black hover:bg-neutral-800 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-none flex items-center gap-2">
                    <Save size={14} /> {editingProduct ? 'Guardar cambios' : 'Crear producto'}
                  </button>
                </div>
              ) : (
                <button onClick={() => { setEditingProduct(null); setProductForm({ title: '', description: '', product_type: '', brand: '', image_url: '', price: '0' }); setShowProductForm(true); }} className="bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-5 py-2.5 rounded-none flex items-center gap-2">
                  <Plus size={16} /> Nuevo producto
                </button>
              )}

              {beautyProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-500">No hay productos aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {beautyProducts.map((p) => (
                    <div key={p.id} className={`bg-[#FBFBF9] border rounded-xl overflow-hidden shadow-sm ${p.is_active ? 'border-gray-200' : 'border-red-200'}`}>
                      {p.image_url && (
                        <div className="aspect-[4/3] bg-gray-100">
                          <img src={p.image_url} alt={p.title} className={`w-full h-full object-cover ${p.is_active ? '' : 'opacity-40'}`} />
                        </div>
                      )}
                      <div className="p-4 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-gray-900 font-medium text-sm">{p.title}</p>
                          {p.price > 0 && <span className="text-xs text-gray-500 shrink-0">${p.price.toLocaleString()}</span>}
                        </div>
                        {p.product_type && <p className="text-xs text-[#8B7355]">{p.product_type}</p>}
                        {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                        {p.description && <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>}
                        <div className="flex items-center gap-2 pt-2">
                          <button onClick={() => startEditProduct(p)} className="text-xs font-medium text-gray-600 hover:text-[#111111] border border-gray-200 px-3 py-1.5 rounded">Editar</button>
                          <button onClick={() => toggleProduct(p)} className={`text-xs font-semibold py-1.5 px-3 rounded border ${p.is_active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{p.is_active ? 'Visible' : 'Oculta'}</button>
                          <button onClick={() => deleteProduct(p.id)} className="text-gray-400 hover:text-red-500 p-1.5"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {tab === 'settings' && (
            <div className="space-y-6 max-w-lg">
              <div className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-5 space-y-4 shadow-sm">
                <p className="text-gray-900 font-semibold">Control de Tráfico</p>
                <p className="text-gray-500 text-sm">Controla el comportamiento de pagos al agendar citas.</p>
                <div className="space-y-2">
                  {([
                    { mode: 'low', label: 'Bajo Tráfico', desc: 'Sin anticipo. Pago completo en el salón.', active: 'border-green-300 bg-green-50 text-green-800', inactive: 'border-gray-200 bg-[#FBFBF9] text-gray-500 hover:border-gray-300' },
                    { mode: 'medium', label: 'Flujo Medio', desc: 'Anticipo configurable para congelar horario.', active: 'border-amber-300 bg-amber-50 text-amber-800', inactive: 'border-gray-200 bg-[#FBFBF9] text-gray-500 hover:border-gray-300' },
                    { mode: 'high', label: 'Alta Demanda', desc: 'Pago total 100% requerido por adelantado.', active: 'border-red-300 bg-red-50 text-red-800', inactive: 'border-gray-200 bg-[#FBFBF9] text-gray-500 hover:border-gray-300' },
                  ] as const).map((item) => (
                    <div key={item.mode}>
                      <button
                        onClick={() => updateTrafficMode(item.mode)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${trafficMode === item.mode ? item.active : item.inactive}`}
                      >
                        <div className="flex items-center gap-2">
                          <Zap size={16} />
                          <p className="font-medium">{item.label}</p>
                          {trafficMode === item.mode && <Check size={16} className="ml-auto" />}
                        </div>
                        <p className="text-xs mt-1 opacity-70">{item.desc}</p>
                      </button>
                      {trafficMode === 'medium' && item.mode === 'medium' && (
                        <div className="mt-2 ml-1">
                          <label className={labelCls}>Monto del anticipo (MXN)</label>
                          <input
                            type="number"
                            value={trafficFee}
                            onChange={(e) => updateTrafficFee(+e.target.value)}
                            className={`${inputCls} max-w-[160px]`}
                            min={0}
                          />
                          <p className="text-gray-400 text-[10px] mt-0.5">El cliente pagará este monto al reservar</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== CLIENTS / BASE DE DATOS ===== */}
          {tab === 'clients' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <input
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar por nombre, teléfono o correo..."
                  className="flex-1 bg-[#FBFBF9] border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#111111] focus:outline-none text-sm"
                />
                <p className="text-gray-400 text-sm shrink-0">{filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}</p>
              </div>

              {filteredClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Database size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-500">No hay clientes registrados aún</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredClients.map((c) => {
                    const isEditing = editingClientPhone === c.phone;
                    return (
                      <div key={c.phone} className="bg-[#FBFBF9] border border-gray-100 rounded-xl p-4 shadow-sm">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className={labelCls}>Nombre</label>
                                <input value={editClientData.name} onChange={(e) => setEditClientData({ ...editClientData, name: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>Teléfono</label>
                                <input value={editClientData.phone} onChange={(e) => setEditClientData({ ...editClientData, phone: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>Correo</label>
                                <input value={editClientData.email} onChange={(e) => setEditClientData({ ...editClientData, email: e.target.value })} className={inputCls} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => saveClientEdits(c.phone)} className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-1.5 rounded-none flex items-center gap-1.5"><Save size={13} /> Guardar</button>
                              <button onClick={() => setEditingClientPhone(null)} className="bg-gray-100 text-gray-600 text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-gray-200">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#FFFBE6] flex items-center justify-center text-[#C9A000] font-bold text-sm shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="text-gray-900 font-medium text-sm">{c.name}</p>
                                <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">{c.visits} visita{c.visits !== 1 ? 's' : ''}</span>
                                {c.cancellations > 0 && <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">{c.cancellations} cancel.</span>}
                                {c.noShows > 0 && <span className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">{c.noShows} no-show</span>}
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                                {c.phone && <span>{c.phone}</span>}
                                {c.email && <span>{c.email}</span>}
                                {c.lastVisit && <span>Última visita: {c.lastVisit}</span>}
                              </div>
                              {c.services.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {c.services.map((svc) => (
                                    <span key={svc} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{svc}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => { setEditingClientPhone(c.phone); setEditClientData({ name: c.name, phone: c.phone, email: c.email }); }}
                              className="text-gray-400 hover:text-[#C9A000] transition-colors p-1.5 rounded-lg hover:bg-[#FFFBE6] shrink-0"
                            >
                              <Edit2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedAppt && (
        <AppointmentModal
          appointment={selectedAppt}
          staff={staff}
          onClose={() => setSelectedAppt(null)}
          onRefresh={loadData}
        />
      )}

      {schemaErrors.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 bg-red-950 border border-red-700 rounded-lg px-4 py-3 max-w-sm">
          {schemaErrors.map((table) => (
            <p key={table} className="text-red-400 text-xs font-mono">
              Debug: Table [{table}] schema error
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
