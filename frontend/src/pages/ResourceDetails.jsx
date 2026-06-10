import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  Users, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const ResourceDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Form States
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await api.get('/resources');
        const found = response.data.find(res => res.id === parseInt(id));
        setResource(found);
      } catch (error) {
        console.error('Error fetching resource details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !startTime || !endTime) {
      setErrorMsg('Please select a date, start time, and end time.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg('Start time must be before end time.');
      return;
    }

    // Set dates comparison
    const selectedDate = new Date(`${bookingDate}T${startTime}`);
    const now = new Date();
    if (selectedDate < now) {
      setErrorMsg('Cannot book time slots in the past.');
      return;
    }

    setBookingLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        resource_id: resource.id,
        booking_date: bookingDate,
        booking_start_time: startTime,
        booking_end_time: endTime,
        purpose
      };
      
      const response = await api.post('/bookings', payload);
      setSuccessMsg(response.data.message || 'Booking request sent successfully!');
      
      // Reset form fields
      setBookingDate('');
      setStartTime('');
      setEndTime('');
      setPurpose('');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/bookings');
      }, 3000);
    } catch (error) {
      console.error('Submit booking error:', error);
      setErrorMsg(error.response?.data?.message || 'Error processing reservation. Slot might be taken.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col">
          <Navbar toggleSidebar={toggleSidebar} title="Resource Details" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 border-4 border-navy-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-500 font-semibold">Loading space details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col">
          <Navbar toggleSidebar={toggleSidebar} title="Resource Not Found" />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm space-y-4">
              <AlertCircle size={48} className="text-red-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-800">Resource not found</h3>
              <p className="text-sm text-slate-400">The space you are looking for does not exist or has been deleted.</p>
              <Link to="/resources" className="inline-block px-5 py-2.5 bg-navy-800 text-white rounded-lg text-sm font-semibold">
                Back to Resources
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar toggleSidebar={toggleSidebar} title={`Book ${resource.name}`} />

        <main className="p-6 md:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* Back button */}
          <Link 
            to="/resources" 
            className="inline-flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Browse</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Resource Card Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="h-64 md:h-80 w-full relative">
                  <img 
                    src={resource.image_url || defaultImage} 
                    alt={resource.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    {resource.availability ? (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
                        Available
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{resource.name}</h2>
                  
                  <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-4 py-2.5 rounded-lg w-fit border border-slate-150">
                    <Users size={18} className="text-slate-400" />
                    <span className="text-sm font-semibold">
                      Max Capacity: <strong className="text-slate-800 font-bold">{resource.capacity}</strong> people
                    </span>
                  </div>

                  <hr className="border-slate-100" />

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {resource.description || 'No description available for this resource.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Reservation Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-5">
                  Book this Space
                </h3>

                {/* Notifications Alert */}
                {successMsg && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start space-x-3 mb-5">
                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-green-700 font-medium">{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-3 mb-5">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-red-700 font-medium">{errorMsg}</span>
                  </div>
                )}

                {!resource.availability ? (
                  <div className="text-center py-6 text-slate-400 space-y-2">
                    <AlertCircle className="mx-auto" size={32} />
                    <p className="text-sm font-semibold">Booking Closed</p>
                    <p className="text-xs">This resource is currently not available for bookings.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    {/* Booking Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Select Date
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                          <Calendar size={16} />
                        </span>
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Time Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Start Time */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Start Time
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                            <Clock size={16} />
                          </span>
                          <input
                            type="time"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* End Time */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          End Time
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                            <Clock size={16} />
                          </span>
                          <input
                            type="time"
                            required
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Purpose of Booking */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Purpose of Booking
                      </label>
                      <div className="relative">
                        <span className="absolute top-3 left-3 text-slate-400 pointer-events-none">
                          <FileText size={16} />
                        </span>
                        <textarea
                          rows="3"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          placeholder="e.g. Annual board presentation or Traditional ceremony"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all resize-none"
                        ></textarea>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-3 bg-navy-800 hover:bg-navy-700 disabled:bg-navy-600 text-white font-bold rounded-lg text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-navy-600"
                    >
                      {bookingLoading ? 'Submitting Request...' : 'Confirm Booking'}
                    </button>

                    <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-2">
                      By submitting a booking request, an email notification will be dispatched. The booking status will remain Pending until approved by the System Administrator.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResourceDetails;
