import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  X,
  FileText
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for Viewing Booking Details
  const [selectedBooking, setSelectedBooking] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/user');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Compute metrics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const approvedBookings = bookings.filter(b => b.status === 'Approved').length;
  const rejectedBookings = bookings.filter(b => b.status === 'Rejected').length;

  // Format time (e.g. 10:00:00 -> 10:00 AM)
  const formatTimeStr = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  };

  // Format date (e.g. 2026-06-10 -> 10 Jun 2026)
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
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar toggleSidebar={toggleSidebar} title="Dashboard" />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Dashboard Header Banner */}
          <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-navy-700">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Welcome, {user?.name}!</h2>
              <p className="text-sm text-slate-300 mt-1">Manage and track your bookings or request new spaces.</p>
            </div>
            <a 
              href="/resources"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
            >
              Browse Spaces
            </a>
          </div>

          {/* Stats Grid widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Total */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{totalBookings}</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                <CalendarDays size={24} />
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{pendingBookings}</h3>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg text-amber-500">
                <Clock size={24} />
              </div>
            </div>

            {/* Approved */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{approvedBookings}</h3>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-green-600">
                <CheckCircle2 size={24} />
              </div>
            </div>

            {/* Rejected */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{rejectedBookings}</h3>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-red-500">
                <XCircle size={24} />
              </div>
            </div>
          </div>

          {/* Bookings log table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">My Bookings</h3>
              <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                Recent Bookings
              </span>
            </div>

            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-12 bg-slate-100 rounded animate-pulse w-full"></div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>You haven't booked any resources yet.</p>
                <a href="/resources" className="text-blue-600 hover:underline mt-2 inline-block font-medium">Book your first resource now</a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Resource</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Time Slot</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-sm text-slate-700">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-800">{booking.resource_name}</td>
                        <td className="py-4 px-6">{formatDateStr(booking.booking_date)}</td>
                        <td className="py-4 px-6 font-medium text-slate-600">
                          {formatTimeStr(booking.booking_start_time)} - {formatTimeStr(booking.booking_end_time)}
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
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-md transition-colors"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>
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

      {/* Details View Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-navy-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText size={18} />
                <h3 className="font-bold text-lg">Booking Details</h3>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Resource Name</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedBooking.resource_name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Booking Date</span>
                  <span className="text-sm font-semibold text-slate-800">{formatDateStr(selectedBooking.booking_date)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Start Time</span>
                  <span className="text-sm font-semibold text-slate-800">{formatTimeStr(selectedBooking.booking_start_time)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">End Time</span>
                  <span className="text-sm font-semibold text-slate-800">{formatTimeStr(selectedBooking.booking_end_time)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Purpose</span>
                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedBooking.purpose || 'No purpose declared.'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Status</span>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md mt-1 ${
                    selectedBooking.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                    selectedBooking.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>
                {selectedBooking.remarks && (
                  <div className="col-span-2 border-t border-slate-100 pt-4">
                    <span className="text-xs text-red-400 block uppercase font-bold tracking-wider">Rejection Reason / Admin Remarks</span>
                    <p className="text-sm text-red-800 mt-1 bg-red-50/50 p-3 rounded-lg border border-red-100">
                      {selectedBooking.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-200">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
