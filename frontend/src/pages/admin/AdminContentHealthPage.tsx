import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, MapPin, Building2 } from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminContentHealthPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-content-health'],
    queryFn: async () => { const res = await adminApi.get('/admin/stats/content-health'); return res.data.data; },
  });

  const places = data?.places || [];
  const hotels = data?.hotels || [];
  const summary = data?.summary || {};

  const RenderTable = ({ items, type }: { items: any[]; type: 'place' | 'hotel' }) => {
    const incomplete = items.filter((i: any) => i.missing_fields.length > 0);
    const complete = items.filter((i: any) => i.missing_fields.length === 0);
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {type === 'place' ? <MapPin size={18} className="text-emerald-500" /> : <Building2 size={18} className="text-blue-500" />}
            <span className="font-semibold text-gray-900">{complete.length}/{items.length} fully complete</span>
          </div>
          <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${items.length > 0 && (complete.length / items.length) >= 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${items.length > 0 ? (complete.length / items.length * 100) : 0}%` }} />
          </div>
        </div>
        {incomplete.length > 0 ? (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Name</th>
              <th className="px-4 py-2.5 text-left font-semibold text-gray-600 hidden md:table-cell">District</th>
              <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Missing</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {incomplete.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-gray-500">{item.district}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">{item.missing_fields.map((f: string) => <span key={f} className="text-[10px] font-medium px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1"><AlertTriangle size={9} />{f}</span>)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="p-8 text-center text-emerald-500 text-sm font-medium">✅ All {type}s are fully complete!</div>}
      </div>
    );
  };

  return (
    <>
      <Helmet><title>Content Health — JharExplore Admin</title></Helmet>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Content Health</h1><p className="text-sm text-gray-500 mt-1">Track data completeness across your content</p></div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <p className="text-4xl font-bold text-emerald-600">{summary.places_complete_pct || 0}%</p>
                <p className="text-sm text-gray-500 mt-1">Places Complete</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <p className="text-4xl font-bold text-blue-600">{summary.hotels_complete_pct || 0}%</p>
                <p className="text-sm text-gray-500 mt-1">Hotels Complete</p>
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-900">📍 Places</h2>
            <RenderTable items={places} type="place" />
            <h2 className="text-lg font-bold text-gray-900">🏨 Hotels</h2>
            <RenderTable items={hotels} type="hotel" />
          </>
        )}
      </div>
    </>
  );
};

export default AdminContentHealthPage;
