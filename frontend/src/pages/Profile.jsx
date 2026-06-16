import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  User, Mail, Phone, MapPin, Edit3, Save, X,
  CheckCircle2, AlertCircle, Shield, Calendar
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data.user);
      setFormName(res.data.user.name || '');
      setFormPhone(res.data.user.phone_number || '');
      setFormAddress(res.data.user.address || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrorMsg('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await api.put('/profile', {
        name: formName,
        phone_number: formPhone,
        address: formAddress
      });
      setProfile(res.data.user);
      updateProfile(res.data.user);
      setEditMode(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormName(profile?.name || '');
    setFormPhone(profile?.phone_number || '');
    setFormAddress(profile?.address || '');
    setErrorMsg(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar toggleSidebar={toggleSidebar} title="My Profile" />

        <main className="p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">

          {/* Notifications */}
          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
                <span className="text-sm text-green-700 font-semibold">{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)}><X size={16} className="text-slate-400 hover:text-slate-700" /></button>
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <span className="text-sm text-red-700 font-semibold">{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)}><X size={16} className="text-slate-400 hover:text-slate-700" /></button>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </div>
          ) : (
            <>
              {/* Profile Header Card */}
              <div className="bg-gradient-to-r from-[#0f2942] to-[#1a3f63] rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-extrabold text-white flex-shrink-0 border-2 border-white/30">
                  {(profile?.name || 'U')[0].toUpperCase()}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-extrabold tracking-tight">{profile?.name}</h2>
                  <p className="text-slate-300 text-sm mt-0.5">{profile?.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className={`inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1 rounded-full ${profile?.role === 'ADMIN' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-blue-400/20 text-blue-200 border border-blue-400/30'}`}>
                      <Shield size={11} />
                      <span>{profile?.role === 'ADMIN' ? 'Administrator' : 'User'}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/20">
                      <Calendar size={11} />
                      <span>Joined {formatDate(profile?.created_at)}</span>
                    </span>
                  </div>
                </div>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="sm:self-start inline-flex items-center space-x-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-semibold rounded-lg transition-all"
                  >
                    <Edit3 size={15} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* Profile Details */}
              {!editMode ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-800">Personal Information</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Your profile details and contact information</p>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField icon={<User size={16} className="text-slate-400" />} label="Full Name" value={profile?.name} />
                    <InfoField icon={<Mail size={16} className="text-slate-400" />} label="Email Address" value={profile?.email} />
                    <InfoField icon={<Phone size={16} className="text-slate-400" />} label="Phone Number" value={profile?.phone_number || '—'} />
                    <InfoField icon={<MapPin size={16} className="text-slate-400" />} label="Address" value={profile?.address || '—'} />
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0f2942] hover:bg-[#1a3f63] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      <Edit3 size={15} />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Form */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-800">Edit Profile</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Update your name, phone number, and address</p>
                  </div>
                  <form onSubmit={handleSave}>
                    <div className="p-6 space-y-5">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none"><User size={16} /></span>
                          <input
                            type="text"
                            required
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Email (read-only) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address <span className="text-slate-300 font-normal normal-case">(cannot be changed)</span></label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center text-slate-300 pointer-events-none"><Mail size={16} /></span>
                          <input
                            type="email"
                            disabled
                            value={profile?.email || ''}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none"><Phone size={16} /></span>
                          <input
                            type="tel"
                            value={formPhone}
                            onChange={e => setFormPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Address</label>
                        <div className="relative">
                          <span className="absolute top-3 left-3 text-slate-400 pointer-events-none"><MapPin size={16} /></span>
                          <textarea
                            rows="3"
                            value={formAddress}
                            onChange={e => setFormAddress(e.target.value)}
                            placeholder="123, Street Name, City, State — 600001"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0f2942] hover:bg-[#1a3f63] disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        <Save size={15} />
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Reusable info display field
const InfoField = ({ icon, label, value }) => (
  <div className="space-y-1.5">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
      {icon} <span>{label}</span>
    </p>
    <p className="text-sm font-semibold text-slate-800 pl-6">{value || '—'}</p>
  </div>
);

export default Profile;
