import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Check, X, Hourglass, CalendarRange, AlertCircle, CheckCircle2 } from 'lucide-react';

const AdminBookings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal and Action States
  const [rejectId, setRejectId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Notification States
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/admin');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter logic
  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === statusFilter));
    }
  }, [statusFilter, bookings]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const response = await api.put(`/bookings/approve/${id}`);
      setSuccessMsg(response.data.message || 'Booking approved successfully!');
      fetchBookings();
    } catch (error) {
      console.error('Approve error:', error);
      setErrorMsg(error.response?.data?.message || 'Error approving booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectModal = (id) => {
    setRejectId(id);
    setRemarks('');
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectId) return;

    setActionLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const response = await api.put(`/bookings/reject/${rejectId}`, { remarks });
      setSuccessMsg(response.data.message || 'Booking rejected successfully.');
      setRejectId(null);
      setRemarks('');
      fetchBookings();
    } catch (error) {
      console.error('Reject error:', error);
      setErrorMsg(error.response?.data?.message || 'Error rejecting booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimeStr = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar toggleSidebar={toggleSidebar} title="Manage Bookings" />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {/* Notifications Panel */}
          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="text-green-600" size={20} />
                <span className="text-sm text-green-700 font-semibold">{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-3">
                <AlertCircle className="text-red-600" size={20} />
                <span className="text-sm text-red-700 font-semibold">{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Filtering Header Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Booking Applications</h2>
              <p className="text-sm text-slate-400 mt-0.5">Manage and review resource reservation requests</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    statusFilter === status 
                      ? 'bg-white text-navy-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
            {loading ? (
              <div className="p-8 space-y-4 flex-1">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-12 bg-slate-100 rounded animate-pulse w-full"></div>
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-20 text-slate-500 flex-1 flex flex-col justify-center items-center space-y-3">
                <CalendarRange size={48} className="text-slate-350" />
                <h3 className="text-lg font-bold text-slate-850">No Bookings Found</h3>
                <p className="text-sm text-slate-400 max-w-xs">
                  There are no reservation requests matching status: <strong>{statusFilter}</strong>.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Requester</th>
                      <th className="py-4 px-6">Space Name</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Time Slot</th>
                      <th className="py-4 px-6">Purpose</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-sm text-slate-700">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-800">{booking.user_name}</p>
                          <p className="text-xs text-slate-400 font-mono">{booking.user_email}</p>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-700">{booking.resource_name}</td>
                        <td className="py-4 px-6">{formatDateStr(booking.booking_date)}</td>
                        <td className="py-4 px-6 text-slate-650 font-medium">
                          {formatTimeStr(booking.booking_start_time)} - {formatTimeStr(booking.booking_end_time)}
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate" title={booking.purpose}>
                          {booking.purpose || <span className="italic text-slate-400">N/A</span>}
                        </td>
                        <td className="py-4 px-6">
                          {booking.status === 'Pending' && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                              Pending
                            </span>
                          )}
                          {booking.status === 'Approved' && (
                            <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                              Approved
                            </span>
                          )}
                          {booking.status === 'Rejected' && (
                            <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {booking.status === 'Pending' ? (
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleApprove(booking.id)}
                                disabled={actionLoading}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-green-400 text-white text-xs font-bold rounded-lg transition-colors focus:outline-none"
                              >
                                <Check size={14} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(booking.id)}
                                disabled={actionLoading}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-red-400 text-white text-xs font-bold rounded-lg transition-colors focus:outline-none"
                              >
                                <X size={14} />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : booking.status === 'Rejected' ? (
                            <div className="text-xs text-slate-400 text-center max-w-[120px] truncate" title={booking.remarks}>
                              Reason: {booking.remarks}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 text-center italic font-semibold">
                              Approved
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
        </main>
      </div>

      {/* Reject Remarks Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleRejectSubmit}>
              <div className="bg-red-800 text-white px-6 py-4 flex items-center space-x-2">
                <X size={20} />
                <h3 className="font-bold text-lg">Reject Request</h3>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500">
                  Please provide a reason or remarks for rejecting this booking. An email notification detailing these remarks will be dispatched automatically.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Remarks / Reason
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Conflict with corporate seminar or maintenance scheduled."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRejectId(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
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

export default AdminBookings;
