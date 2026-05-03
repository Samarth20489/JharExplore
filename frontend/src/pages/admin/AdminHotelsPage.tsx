import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, Pencil, Trash2, Eye, Star, Check, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../services/api';

const AdminHotelsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [deleteInput, setDeleteInput] = useState('');

  const { data: hotelsData, isLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: async () => { const res = await adminApi.get('/admin/hotels'); return res.data.data; },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { await adminApi.delete(`/admin/hotels/${id}`); },
    onSuccess: () => { toast.success('Hotel deleted'); queryClient.invalidateQueries({ queryKey: ['admin-hotels'] }); setDeleteConfirm(null); setDeleteInput(''); },
    onError: () => toast.error('Failed to delete'),
  });

  const hotels = (hotelsData || []).filter((h: any) => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.district?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Helmet><title>Hotels Management — JharExplore Admin</title></Helmet>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-gray-900">Hotels Management</h1><p className="text-sm text-gray-500 mt-1">{hotels.length} hotels total</p></div>
          <button onClick={() => { setEditingHotel({}); setShowAddModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"><Plus size={16} /> Add New Hotel</button>
        </div>

        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hotels..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Photo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Hotel Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">District</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Stars</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Map</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden xl:table-cell">Price</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr> :
                 hotels.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">No hotels found</td></tr> :
                 hotels.map((hotel: any) => (
                  <tr key={hotel.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3"><div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">{hotel.thumbnail ? <img src={hotel.thumbnail} alt="" className="w-full h-full object-cover" /> : <Building2 size={16} className="text-gray-300 m-auto mt-2.5" />}</div></td>
                    <td className="px-4 py-3"><p className="font-semibold text-gray-900">{hotel.name}</p><p className="text-xs text-gray-400">/hotels/{hotel.slug}</p></td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{hotel.district}</td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600 capitalize">{hotel.property_type || 'hotel'}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm">{'★'.repeat(hotel.star_rating || 0)}{'☆'.repeat(5 - (hotel.star_rating || 0))}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell">{hotel.latitude && hotel.longitude ? <Check size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}</td>
                    <td className="px-4 py-3 hidden xl:table-cell text-gray-700 font-medium">₹{hotel.price_per_night || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/hotels/${hotel.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Eye size={15} /></Link>
                        <button onClick={() => { setEditingHotel(hotel); setShowAddModal(true); }} className="p-2 text-gray-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteConfirm(hotel)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🗑 Delete "{deleteConfirm.name}"?</h3>
            <p className="text-sm text-gray-500 mb-4">Type the hotel name to confirm deletion.</p>
            <input type="text" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500/30" placeholder={deleteConfirm.name} />
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => { setDeleteConfirm(null); setDeleteInput(''); }} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
              <button onClick={() => deleteMut.mutate(deleteConfirm.id)} disabled={deleteInput !== deleteConfirm.name} className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">{deleteMut.isPending ? 'Deleting...' : 'Delete'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && <HotelFormModal hotel={editingHotel} onClose={() => { setShowAddModal(false); setEditingHotel(null); }} />}
    </>
  );
};

const HotelFormModal: React.FC<{ hotel: any; onClose: () => void }> = ({ hotel, onClose }) => {
  const queryClient = useQueryClient();
  const isEdit = hotel?.id;
  const [form, setForm] = useState({
    name: hotel?.name || '', slug: hotel?.slug || '', district: hotel?.district || '', property_type: hotel?.property_type || 'hotel',
    star_rating: hotel?.star_rating || 3, description: hotel?.description || '', address: hotel?.address || '',
    phone: hotel?.phone || '', email: hotel?.email || '', thumbnail: hotel?.thumbnail || '',
    price_per_night: hotel?.price_per_night || '', price_per_bed: hotel?.price_per_bed || '',
    latitude: hotel?.latitude || '', longitude: hotel?.longitude || '',
    amenities: hotel?.amenities || [], best_for: hotel?.best_for || '',
    booking_url: hotel?.booking_url || '', booking_platform: hotel?.booking_platform || '',
    is_published: hotel?.is_published ?? true,
    meta_title: hotel?.meta_title || '', meta_description: hotel?.meta_description || '',
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [saving, setSaving] = useState(false);

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const save = async () => {
    if (!form.name.trim()) return toast.error('Hotel name is required');
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name) };
      if (isEdit) { await adminApi.put(`/admin/hotels/${hotel.id}`, payload); toast.success('Hotel updated'); }
      else { await adminApi.post('/admin/hotels', payload); toast.success('Hotel created'); }
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !form.amenities.includes(amenityInput.trim())) {
      setForm(f => ({ ...f, amenities: [...f.amenities, amenityInput.trim()] }));
      setAmenityInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl max-w-2xl w-full shadow-xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? `Edit: ${hotel.name}` : 'Add New Hotel'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Hotel Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, ...(isEdit ? {} : { slug: slugify(e.target.value) }) }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">URL Slug</label><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 focus:outline-none" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">District</label><input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Property Type</label>
              <select value={form.property_type} onChange={e => setForm(f => ({ ...f, property_type: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none">
                {['hotel', 'hostel', 'homestay', 'forest-rest-house', 'resort'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Star Rating</label>
              <div className="flex gap-1 mt-1">{[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setForm(f => ({ ...f, star_rating: s }))} className="text-xl">{s <= form.star_rating ? '★' : '☆'}</button>)}</div>
            </div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none" /></div>
          <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Address</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Price/Night (₹)</label><input type="number" value={form.price_per_night} onChange={e => setForm(f => ({ ...f, price_per_night: Number(e.target.value) }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Price/Bed (₹)</label><input type="number" value={form.price_per_bed} onChange={e => setForm(f => ({ ...f, price_per_bed: Number(e.target.value) || '' }))} placeholder="Hostels only" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Cover Image URL</label><input value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Latitude</label><input type="number" step="0.000001" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value ? Number(e.target.value) : '' }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Longitude</label><input type="number" step="0.000001" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value ? Number(e.target.value) : '' }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Booking URL</label><input value={form.booking_url} onChange={e => setForm(f => ({ ...f, booking_url: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Booking Platform</label><input value={form.booking_platform} onChange={e => setForm(f => ({ ...f, booking_platform: e.target.value }))} placeholder="e.g. MakeMyTrip" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Best For</label><input value={form.best_for} onChange={e => setForm(f => ({ ...f, best_for: e.target.value }))} placeholder="e.g. Solo travelers, Families" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" /></div>

          {/* Amenities */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Amenities</label>
            <div className="flex flex-wrap gap-2 mb-2">{form.amenities.map((a: string) => <span key={a} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full flex items-center gap-1">{a}<button type="button" onClick={() => setForm(f => ({ ...f, amenities: f.amenities.filter((x: string) => x !== a) }))} className="text-blue-400 hover:text-red-500">×</button></span>)}</div>
            <div className="flex gap-2"><input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())} placeholder="Add amenity..." className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" /><button type="button" onClick={addAmenity} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium">Add</button></div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 rounded" /><span className="text-sm text-gray-700">Published</span></label>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-500">Cancel</button>
          <button onClick={save} disabled={saving} className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-sm">{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Hotel'}</button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminHotelsPage;
