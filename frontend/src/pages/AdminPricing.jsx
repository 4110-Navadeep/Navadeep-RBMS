import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  Plus, X, Tag, Edit2, Trash2, CheckCircle2, AlertCircle,
  Clock, IndianRupee, Building2, ChevronDown
} from 'lucide-react';

const PRICING_TYPE_LABELS = {
  slot_based: 'Slot Based',
  hourly: 'Hourly',
  full_day: 'Full Day'
};

const PRICING_TYPE_COLORS = {
  slot_based: 'bg-blue-50 text-blue-700 border-blue-200',
  hourly: 'bg-purple-50 text-purple-700 border-purple-200',
  full_day: 'bg-green-50 text-green-700 border-green-200'
};

const AdminPricing = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [pricingSlots, setPricingSlots] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingPricing, setLoadingPricing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  // Form fields
  const [formResourceId, setFormResourceId] = useState('');
  const [formType, setFormType] = useState('slot_based');
  const [formSlotName, setFormSlotName] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formPrice, setFormPrice] = useState('');

  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 4000); };
  const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(null), 5000); };

  const fetchResources = async () => {
    try {
      const res = await api.get('/resources');
      setResources(res.data);
      if (res.data.length > 0 && !selectedResourceId) {
        setSelectedResourceId(String(res.data[0].id));
      }
    } catch (err) {
      showError('Failed to load resources.');
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchPricing = async (resourceId) => {
    if (!resourceId) return;
    setLoadingPricing(true);
    try {
      const res = await api.get(`/pricing/${resourceId}`);
      setPricingSlots(res.data);
    } catch (err) {
      showError('Failed to load pricing for this resource.');
    } finally {
      setLoadingPricing(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);
  useEffect(() => { if (selectedResourceId) fetchPricing(selectedResourceId); }, [selectedResourceId]);

  const openAddModal = () => {
    setEditingSlot(null);
    setFormResourceId(selectedResourceId || (resources[0]?.id?.toString() || ''));
    setFormType('slot_based');
    setFormSlotName('');
    setFormStartTime('');
    setFormEndTime('');
    setFormPrice('');
    setShowModal(true);
  };

  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setFormResourceId(String(slot.resource_id));
    setFormType(slot.pricing_type);
    setFormSlotName(slot.slot_name || '');
    setFormStartTime(slot.start_time ? slot.start_time.substring(0, 5) : '');
    setFormEndTime(slot.end_time ? slot.end_time.substring(0, 5) : '');
    setFormPrice(String(slot.price));
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formResourceId || !formPrice) {
      showError('Resource and price are required.');
      return;
    }
    setActionLoading(true);
    const payload = {
      resource_id: parseInt(formResourceId),
      pricing_type: formType,
      slot_name: formSlotName || null,
      start_time: formStartTime || null,
      end_time: formEndTime || null,
      price: parseFloat(formPrice)
    };
    try {
      if (editingSlot) {
        await api.put(`/pricing/${editingSlot.id}`, payload);
        showSuccess('Pricing slot updated successfully!');
      } else {
        await api.post('/pricing', payload);
        showSuccess('New pricing slot added successfully!');
      }
      setShowModal(false);
      fetchPricing(selectedResourceId);
    } catch (err) {
      showError(err.response?.data?.message || 'Error saving pricing slot.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pricing slot?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/pricing/${id}`);
      showSuccess('Pricing slot deleted.');
      fetchPricing(selectedResourceId);
    } catch (err) {
      showError('Error deleting pricing slot.');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedResource = resources.find(r => String(r.id) === String(selectedResourceId));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar toggleSidebar={toggleSidebar} title="Manage Pricing" />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Dynamic Resource Pricing</h2>
              <p className="text-sm text-slate-400 mt-0.5">Configure hourly, slot-based, and full-day pricing for each resource</p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0f2942] hover:bg-[#1a3f63] text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
            >
              <Plus size={16} />
              <span>Add Pricing Slot</span>
            </button>
          </div>

          {/* Notifications */}
          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3"><CheckCircle2 className="text-green-600" size={18} /><span className="text-sm text-green-700 font-semibold">{successMsg}</span></div>
              <button onClick={() => setSuccessMsg(null)}><X size={16} className="text-slate-400 hover:text-slate-700" /></button>
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3"><AlertCircle className="text-red-600" size={18} /><span className="text-sm text-red-700 font-semibold">{errorMsg}</span></div>
              <button onClick={() => setErrorMsg(null)}><X size={16} className="text-slate-400 hover:text-slate-700" /></button>
            </div>
          )}

          {/* Resource Selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Select Resource to Manage Pricing</label>
            {loadingResources ? (
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse w-full max-w-sm" />
            ) : (
              <div className="relative max-w-sm">
                <Building2 size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                <select
                  value={selectedResourceId}
                  onChange={e => setSelectedResourceId(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942] appearance-none cursor-pointer"
                >
                  {resources.map(r => (
                    <option key={r.id} value={String(r.id)}>{r.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute inset-y-0 right-3 my-auto text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Pricing Slots Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {selectedResource ? selectedResource.name : 'Loading...'} — Pricing Slots
                </h3>
                {selectedResource && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Base Price: <strong className="text-slate-600">₹{parseFloat(selectedResource.price || 0).toLocaleString('en-IN')}</strong>
                  </p>
                )}
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                {pricingSlots.length} slot{pricingSlots.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loadingPricing ? (
              <div className="p-8 space-y-3">
                {[1,2,3].map(n => <div key={n} className="h-12 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : pricingSlots.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Tag size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-semibold text-slate-600">No pricing slots configured</p>
                <p className="text-xs mt-1">Add a slot using the button above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3 px-5">Slot Name</th>
                      <th className="py-3 px-5">Type</th>
                      <th className="py-3 px-5">Time Window</th>
                      <th className="py-3 px-5">Price</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pricingSlots.map(slot => (
                      <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-5 font-semibold text-slate-800">{slot.slot_name || '—'}</td>
                        <td className="py-3 px-5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${PRICING_TYPE_COLORS[slot.pricing_type]}`}>
                            {PRICING_TYPE_LABELS[slot.pricing_type]}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-slate-600 font-medium">
                          {slot.start_time && slot.end_time
                            ? `${slot.start_time.substring(0,5)} – ${slot.end_time.substring(0,5)}`
                            : slot.pricing_type === 'hourly' ? 'Per Hour' : '—'}
                        </td>
                        <td className="py-3 px-5 font-bold text-green-700 text-base">
                          ₹{parseFloat(slot.price).toLocaleString('en-IN')}
                          {slot.pricing_type === 'hourly' && <span className="text-xs font-normal text-slate-400">/hr</span>}
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(slot)}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <Edit2 size={12} /><span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              disabled={actionLoading}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 size={12} /><span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <form onSubmit={handleFormSubmit}>
              <div className="bg-[#0f2942] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag size={18} />
                  <h3 className="font-bold text-lg">{editingSlot ? 'Edit Pricing Slot' : 'Add Pricing Slot'}</h3>
                </div>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-4">
                {/* Resource */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Resource</label>
                  <select
                    value={formResourceId}
                    onChange={e => setFormResourceId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                  >
                    <option value="">Select resource...</option>
                    {resources.map(r => <option key={r.id} value={String(r.id)}>{r.name}</option>)}
                  </select>
                </div>

                {/* Pricing Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pricing Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                  >
                    <option value="slot_based">Slot Based (Morning / Afternoon / Evening)</option>
                    <option value="hourly">Hourly (price per hour)</option>
                    <option value="full_day">Full Day</option>
                  </select>
                </div>

                {/* Slot Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Slot Name</label>
                  <input
                    type="text"
                    value={formSlotName}
                    onChange={e => setFormSlotName(e.target.value)}
                    placeholder="e.g. Morning, Evening, Full Day, Per Hour"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>

                {/* Time Window — hide for hourly */}
                {formType !== 'hourly' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Start Time</label>
                      <div className="relative">
                        <Clock size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                        <input type="time" value={formStartTime} onChange={e => setFormStartTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942]" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">End Time</label>
                      <div className="relative">
                        <Clock size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                        <input type="time" value={formEndTime} onChange={e => setFormEndTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Price (₹) {formType === 'hourly' ? '— per hour' : ''}
                  </label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formPrice}
                      onChange={e => setFormPrice(e.target.value)}
                      placeholder="5000"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading}
                  className="px-5 py-2 bg-[#0f2942] hover:bg-[#1a3f63] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                  {editingSlot ? 'Update Slot' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
