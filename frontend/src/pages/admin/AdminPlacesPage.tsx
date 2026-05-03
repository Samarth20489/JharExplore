import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Plus, Search, Pencil, Trash2, Eye, Star, AlertTriangle, Check, X, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../services/api';

const CATEGORY_COLORS: Record<string, string> = {
  waterfall: 'bg-blue-100 text-blue-700', wildlife: 'bg-green-100 text-green-700', religious: 'bg-orange-100 text-orange-700',
  adventure: 'bg-red-100 text-red-700', heritage: 'bg-amber-100 text-amber-700', lake: 'bg-cyan-100 text-cyan-700',
  hill: 'bg-indigo-100 text-indigo-700', tribal: 'bg-purple-100 text-purple-700', forest: 'bg-emerald-100 text-emerald-700',
  park: 'bg-teal-100 text-teal-700',
};

const AdminPlacesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [deleteInput, setDeleteInput] = useState('');

  const { data: placesData, isLoading } = useQuery({
    queryKey: ['admin-places'],
    queryFn: async () => { const res = await adminApi.get('/admin/places'); return res.data.data; },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await adminApi.delete(`/admin/places/${id}`); },
    onSuccess: () => { toast.success('Place deleted'); queryClient.invalidateQueries({ queryKey: ['admin-places'] }); setDeleteConfirm(null); setDeleteInput(''); },
    onError: () => toast.error('Failed to delete'),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      await adminApi.put(`/admin/places/${id}`, { is_published: published });
    },
    onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries({ queryKey: ['admin-places'] }); },
    onError: () => toast.error('Failed to update'),
  });

  const toggleFeature = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      await adminApi.put(`/admin/places/${id}`, { is_featured: featured });
    },
    onSuccess: () => { toast.success('Feature status updated'); queryClient.invalidateQueries({ queryKey: ['admin-places'] }); },
    onError: () => toast.error('Failed to update'),
  });

  const places = (placesData || []).filter((p: any) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.district?.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    return true;
  });

  const categories = [...new Set((placesData || []).map((p: any) => p.category).filter(Boolean))];

  return (
    <>
      <Helmet><title>Places Management — JharExplore Admin</title></Helmet>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Places Management</h1>
            <p className="text-sm text-gray-500 mt-1">{places.length} destinations total</p>
          </div>
          <button onClick={() => { setEditingPlace({}); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm">
            <Plus size={16} /> Add New Place
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search places..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c as string} value={c as string}>{(c as string).charAt(0).toUpperCase() + (c as string).slice(1)}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Photo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">District</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Map</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden xl:table-cell">Rating</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading places...</td></tr>
                ) : places.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No places found</td></tr>
                ) : places.map((place: any) => (
                  <tr key={place.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                        {place.thumbnail ? <img src={place.thumbnail} alt="" className="w-full h-full object-cover" /> : <MapPin size={16} className="text-gray-300 m-auto mt-2.5" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{place.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">/destinations/{place.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{place.district}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${CATEGORY_COLORS[place.category] || 'bg-gray-100 text-gray-600'}`}>
                        {place.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => togglePublish.mutate({ id: place.id, published: !place.is_published })}
                          className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer transition-colors ${place.is_published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {place.is_published ? '✅ Published' : '⬜ Draft'}
                        </button>
                        {place.is_featured && <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">⭐ Featured</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {place.latitude && place.longitude ? <Check size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {place.avg_rating > 0 ? (
                        <span className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" /> {Number(place.avg_rating).toFixed(1)}</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/destinations/${place.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors" title="View"><Eye size={15} /></Link>
                        <button onClick={() => { setEditingPlace(place); setShowAddModal(true); }} className="p-2 text-gray-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteConfirm(place)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🗑 Delete "{deleteConfirm.name}"?</h3>
            <p className="text-sm text-gray-500 mb-4">This will permanently remove this destination and all associated data.</p>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Type the place name to confirm:</label>
              <input type="text" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" placeholder={deleteConfirm.name} />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => { setDeleteConfirm(null); setDeleteInput(''); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteConfirm.id)} disabled={deleteInput !== deleteConfirm.name || deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && <PlaceFormModal place={editingPlace} onClose={() => { setShowAddModal(false); setEditingPlace(null); }} />}
    </>
  );
};

/* ═══ Place Form Modal ═══ */
const PlaceFormModal: React.FC<{ place: any; onClose: () => void }> = ({ place, onClose }) => {
  const queryClient = useQueryClient();
  const isEdit = place?.id;
  const [form, setForm] = useState({
    name: place?.name || '', slug: place?.slug || '', district: place?.district || '', category: place?.category || '',
    tagline: place?.tagline || '', description: place?.description || '', entry_fee: place?.entry_fee || 0,
    timings: place?.timings || '', thumbnail: place?.thumbnail || '', latitude: place?.latitude || '',
    longitude: place?.longitude || '', is_published: place?.is_published ?? false, is_featured: place?.is_featured ?? false,
    meta_title: place?.meta_title || '', meta_description: place?.meta_description || '',
  });
  const [saving, setSaving] = useState(false);

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, ...(isEdit ? {} : { slug: slugify(name) }) }));
  };

  const save = async (publish?: boolean) => {
    if (!form.name.trim()) return toast.error('Place name is required');
    if (!form.category) return toast.error('Category is required');
    setSaving(true);
    try {
      const payload = { ...form, is_published: publish !== undefined ? publish : form.is_published };
      if (isEdit) {
        await adminApi.put(`/admin/places/${place.id}`, payload);
        toast.success('Place updated');
      } else {
        await adminApi.post('/admin/places', payload);
        toast.success('Place created');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-places'] });
      onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const categories = ['waterfall', 'wildlife', 'religious', 'adventure', 'heritage', 'lake', 'hill', 'tribal', 'forest', 'park'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full shadow-xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? `Edit: ${place.name}` : 'Add New Destination'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">Place Name *</label><input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">URL Slug</label><input type="text" value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">District *</label><input type="text" value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} placeholder="e.g. Ranchi" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white">
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">Tagline</label><input type="text" value={form.tagline} onChange={e => setForm(f => ({...f, tagline: e.target.value}))} maxLength={100} placeholder="e.g. Majestic, Scenic, Refreshing" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
          <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">Description</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={4} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" /></div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">Entry Fee (₹)</label><input type="number" value={form.entry_fee} onChange={e => setForm(f => ({...f, entry_fee: Number(e.target.value)}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">Timings</label><input type="text" value={form.timings} onChange={e => setForm(f => ({...f, timings: e.target.value}))} placeholder="e.g. 6 AM – 6 PM" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">Cover Image URL</label><input type="url" value={form.thumbnail} onChange={e => setForm(f => ({...f, thumbnail: e.target.value}))} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">Latitude</label><input type="number" step="0.000001" value={form.latitude} onChange={e => setForm(f => ({...f, latitude: e.target.value ? Number(e.target.value) : ''}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">Longitude</label><input type="number" step="0.000001" value={form.longitude} onChange={e => setForm(f => ({...f, longitude: e.target.value ? Number(e.target.value) : ''}))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
          </div>

          {/* SEO */}
          <details className="group">
            <summary className="text-xs font-bold text-gray-500 uppercase cursor-pointer hover:text-gray-700 py-2">🔍 SEO Settings</summary>
            <div className="mt-2 space-y-3">
              <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Meta Title <span className="text-gray-300">({form.meta_title.length}/60)</span></label><input type="text" value={form.meta_title} onChange={e => setForm(f => ({...f, meta_title: e.target.value}))} maxLength={60} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Meta Description <span className="text-gray-300">({form.meta_description.length}/160)</span></label><textarea value={form.meta_description} onChange={e => setForm(f => ({...f, meta_description: e.target.value}))} maxLength={160} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" /></div>
            </div>
          </details>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({...f, is_published: e.target.checked}))} className="w-4 h-4 rounded text-emerald-600" /><span className="text-sm text-gray-700">Published</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({...f, is_featured: e.target.checked}))} className="w-4 h-4 rounded text-blue-600" /><span className="text-sm text-gray-700">Featured</span></label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={() => save(false)} disabled={saving} className="px-5 py-2.5 text-sm bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50">Save as Draft</button>
          <button onClick={() => save(true)} disabled={saving} className="px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save & Publish'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPlacesPage;
