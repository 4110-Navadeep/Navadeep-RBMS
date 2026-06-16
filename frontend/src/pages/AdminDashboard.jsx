import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  Building2, CalendarCheck, Hourglass, Users,
  Check, X, AlertCircle, CheckCircle2,
  IndianRupee, TrendingUp, XCircle
} from 'lucide-react';

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{value}</h3>
    </div>
    <div className={`${color} p-3 rounded-lg`}>{icon}</div>
  </div>
);

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchData = async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        api.get('/bookings/admin'),
        api.get('/profile/admin/stats')
      ]);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    setSuccessMsg(null); setErrorMsg(null);
    try {
      const response = await api.put(`/bookings/approve/${id}`);
      setSuccessMsg(response.data.message || 'Booking approved successfully!');
      fetchData();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Error approving booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectId) return;
    setActionLoading(true);
    setSuccessMsg(null); setErrorMsg(null);
    try {
      const response = await api.put(`/bookings/reject/${rejectId}`, { remarks });
      setSuccessMsg(response.data.message || 'Booking rejected successfully.');
      setRejectId(null); setRemarks('');
      fetchData();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Error rejecting booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimeStr = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const formatDateStr = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatRupee = (amount) =>
    parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const pendingBookings = bookings.filter(b => b.status === 'Pending');

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar toggleSidebar={toggleSidebar} title="Admin Dashboard" />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Banners */}
          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="text-green-600" size={20} />
                <span className="text-sm text-green-700 font-semibold">{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)}><X size={16} className="text-slate-400 hover:text-slate-700" /></button>
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <AlertCircle className="text-red-600" size={20} />
                <span className="text-sm text-red-700 font-semibold">{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)}><X size={16} className="text-slate-400 hover:text-slate-700" /></button>
            </div>
          )}

          {/* Stats Grid — 6 cards */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(n => <div key={n} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} icon={<Users size={22} />} color="bg-blue-50 text-blue-600" />
              <StatCard label="Total Resources" value={stats?.totalResources ?? '—'} icon={<Building2 size={22} />} color="bg-indigo-50 text-indigo-600" />
              <StatCard label="Total Bookings" value={stats?.totalBookings ?? '—'} icon={<CalendarCheck size={22} />} color="bg-cyan-50 text-cyan-600" />
              <StatCard label="Pending Approvals" value={stats?.pendingBookings ?? '—'} icon={<Hourglass size={22} />} color="bg-amber-50 text-amber-500" />
              <StatCard label="Approved" value={stats?.approvedBookings ?? '—'} icon={<CheckCircle2 size={22} />} color="bg-green-50 text-green-600" />
              <StatCard label="Rejected" value={stats?.rejectedBookings ?? '—'} icon={<XCircle size={22} />} color="bg-red-50 text-red-500" />
            </div>
          )}

          {/* Revenue Section */}
          {!loading && stats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Total Revenue Card */}
              <div className="bg-gradient-to-br from-[#0f2942] to-[#1a4a7a] rounded-xl p-6 text-white shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Revenue</p>
                  <div className="bg-white/10 p-2 rounded-lg"><TrendingUp size={20} /></div>
                </div>
                <div>
                  <div className="flex items-center mt-4">
                    <IndianRupee size={26} className="text-green-300" />
                    <span className="text-4xl font-extrabold text-white">{formatRupee(stats.totalRevenue)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">From {stats.approvedBookings} approved booking{stats.approvedBookings !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Revenue by Resource */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-800">Revenue by Resource</h3>
                </div>
                {stats.revenueByResource?.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">No revenue data yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-5 text-left">Resource</th>
                          <th className="py-3 px-5 text-center">Bookings</th>
                          <th className="py-3 px-5 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.revenueByResource?.slice(0, 5).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-5 font-semibold text-slate-700">{r.resource_name}</td>
                            <td className="py-3 px-5 text-center text-slate-500">{r.bookings}</td>
                            <td className="py-3 px-5 text-right font-bold text-green-700 flex items-center justify-end">
                              <IndianRupee size={12} className="mr-0.5" />{formatRupee(r.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Recent Bookings</h3>
              <span className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                Pending Actions ({pendingBookings.length})
              </span>
            </div>

            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map(n => <div key={n} className="h-12 bg-slate-100 rounded animate-pulse w-full" />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <p className="font-semibold text-slate-700">No booking requests submitted yet</p>
                <p className="text-xs text-slate-400 mt-1">Bookings requested by users will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-5">User</th>
                      <th className="py-4 px-5">Resource</th>
                      <th className="py-4 px-5">Date</th>
                      <th className="py-4 px-5">Time</th>
                      <th className="py-4 px-5">Amount</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5">
                          <p className="font-semibold text-slate-800">{booking.user_name || booking.user_name_live}</p>
                          <p className="text-xs text-slate-400 font-mono">{booking.user_email || booking.user_email_live}</p>
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-700">{booking.resource_name}</td>
                        <td className="py-4 px-5">{formatDateStr(booking.booking_date)}</td>
                        <td className="py-4 px-5 text-slate-600 font-medium text-xs">
                          {formatTimeStr(booking.booking_start_time)} – {formatTimeStr(booking.booking_end_time)}
                        </td>
                        <td className="py-4 px-5 font-bold text-green-700 text-sm">
                          {booking.booking_amount > 0
                            ? <span className="flex items-center"><IndianRupee size={12} />{formatRupee(booking.booking_amount)}</span>
                            : <span className="text-slate-400 font-normal text-xs">—</span>}
                        </td>
                        <td className="py-4 px-5">
                          {booking.status === 'Pending' && <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-md">Pending</span>}
                          {booking.status === 'Approved' && <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2.5 py-1 rounded-md">Approved</span>}
                          {booking.status === 'Rejected' && <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-2.5 py-1 rounded-md">Rejected</span>}
                        </td>
                        <td className="py-4 px-5">
                          {booking.status === 'Pending' ? (
                            <div className="flex items-center justify-center space-x-2">
                              <button onClick={() => handleApprove(booking.id)} disabled={actionLoading}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-green-400 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                <Check size={13} /><span>Approve</span>
                              </button>
                              <button onClick={() => { setRejectId(booking.id); setRemarks(''); }} disabled={actionLoading}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-red-400 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                <X size={13} /><span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-center text-xs text-slate-400 italic font-medium">Processed</div>
                          )}
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

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <form onSubmit={handleRejectSubmit}>
              <div className="bg-red-700 text-white px-6 py-4 flex items-center space-x-2">
                <X size={20} /><h3 className="font-bold text-lg">Reject Booking</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500">Provide a reason for rejecting this booking. An email notification will be sent to the user.</p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Remarks / Reason *</label>
                  <textarea required rows="3" value={remarks} onChange={e => setRemarks(e.target.value)}
                    placeholder="e.g. Conflict with corporate seminar or maintenance scheduled."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all resize-none" />
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200">
                <button type="button" onClick={() => setRejectId(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                  Reject Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
