import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  Users, ArrowLeft, Calendar, Clock, FileText,
  CheckCircle2, AlertCircle, IndianRupee, Tag, Info
} from 'lucide-react';

const PRICING_TYPE_LABELS = { slot_based: 'Time Slot', hourly: 'Per Hour', full_day: 'Full Day' };

const ResourceDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resource, setResource] = useState(null);
  const [pricingSlots, setPricingSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Form States
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resourcesRes, pricingRes] = await Promise.all([
          api.get('/resources'),
          api.get(`/pricing/${id}`)
        ]);
        const found = resourcesRes.data.find(res => res.id === parseInt(id));
        setResource(found);
        setPricingSlots(pricingRes.data || []);
      } catch (error) {
        console.error('Error fetching resource details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Auto-calculate booking amount when time or slot changes
  useEffect(() => {
    if (!startTime || !endTime || startTime >= endTime) {
      if (!selectedSlot) setCalculatedAmount(0);
      return;
    }

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const durationHours = (eh * 60 + em - sh * 60 - sm) / 60;

    if (selectedSlot) {
      if (selectedSlot.pricing_type === 'hourly') {
        setCalculatedAmount(Math.ceil(durationHours) * parseFloat(selectedSlot.price));
      } else {
        setCalculatedAmount(parseFloat(selectedSlot.price));
      }
    } else {
      // Fallback: check which slot_based slot the times fall in
      const matchingSlot = pricingSlots.find(slot => {
        if (slot.pricing_type === 'hourly') return false;
        if (!slot.start_time || !slot.end_time) return false;
        const slotStart = slot.start_time.substring(0, 5);
        const slotEnd = slot.end_time.substring(0, 5);
        return startTime >= slotStart && endTime <= slotEnd;
      });
      if (matchingSlot) {
        setCalculatedAmount(parseFloat(matchingSlot.price));
      } else if (resource?.price) {
        // Default to base price × hours for fallback
        setCalculatedAmount(durationHours * parseFloat(resource.price));
      } else {
        setCalculatedAmount(0);
      }
    }
  }, [startTime, endTime, selectedSlot, pricingSlots, resource]);

  // When a slot is selected, auto-fill start/end times
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    if (slot.start_time && slot.end_time) {
      setStartTime(slot.start_time.substring(0, 5));
      setEndTime(slot.end_time.substring(0, 5));
    } else {
      setStartTime('');
      setEndTime('');
    }
  };

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
    const selectedDate = new Date(`${bookingDate}T${startTime}`);
    if (selectedDate < new Date()) {
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
        purpose,
        booking_amount: calculatedAmount
      };
      const response = await api.post('/bookings', payload);
      setSuccessMsg(response.data.message || 'Booking request sent! A confirmation email has been sent.');
      setBookingDate(''); setStartTime(''); setEndTime('');
      setPurpose(''); setSelectedSlot(null); setCalculatedAmount(0);
      setTimeout(() => navigate('/bookings'), 3000);
    } catch (error) {
      console.error('Submit booking error:', error);
      setErrorMsg(error.response?.data?.message || 'Error processing reservation. Slot might be taken.');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatRupee = (amount) =>
    parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col">
          <Navbar toggleSidebar={toggleSidebar} title="Resource Details" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 border-4 border-[#0f2942] border-t-transparent rounded-full animate-spin mx-auto"></div>
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
              <Link to="/resources" className="inline-block px-5 py-2.5 bg-[#0f2942] text-white rounded-lg text-sm font-semibold">
                Back to Resources
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800';
  const slotBased = pricingSlots.filter(s => s.pricing_type === 'slot_based' || s.pricing_type === 'full_day');
  const hourlySlot = pricingSlots.find(s => s.pricing_type === 'hourly');

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar toggleSidebar={toggleSidebar} title={`Book ${resource.name}`} />

        <main className="p-6 md:p-8 space-y-6 max-w-6xl w-full mx-auto">
          <Link to="/resources" className="inline-flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
            <ArrowLeft size={16} /><span>Back to Browse</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Resource Info */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="h-64 md:h-72 w-full relative">
                  <img src={resource.image_url || defaultImage} alt={resource.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4">
                    {resource.availability ? (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">Available</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">Unavailable</span>
                    )}
                  </div>
                  {resource.price > 0 && (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-[#0f2942]/85 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-md backdrop-blur-sm">
                        <IndianRupee size={13} />
                        <span>{formatRupee(resource.price)} starting</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{resource.name}</h2>
                  <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-4 py-2.5 rounded-lg w-fit border border-slate-150">
                    <Users size={18} className="text-slate-400" />
                    <span className="text-sm font-semibold">Max Capacity: <strong className="text-slate-800">{resource.capacity}</strong> people</span>
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

              {/* Pricing Table */}
              {pricingSlots.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-2">
                    <Tag size={16} className="text-[#0f2942]" />
                    <h3 className="text-base font-bold text-slate-800">Pricing & Time Slots</h3>
                  </div>
                  <div className="p-5 space-y-3">
                    {hourlySlot && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-100">
                        <div className="flex items-center space-x-2">
                          <Clock size={15} className="text-purple-600" />
                          <span className="text-sm font-semibold text-slate-700">Hourly Rate</span>
                        </div>
                        <span className="text-base font-bold text-purple-700 flex items-center">
                          <IndianRupee size={14} />{formatRupee(hourlySlot.price)}<span className="text-xs font-normal text-slate-400 ml-1">/hr</span>
                        </span>
                      </div>
                    )}
                    {slotBased.map(slot => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'bg-[#0f2942] border-[#0f2942] text-white shadow-md'
                            : 'bg-slate-50 border-slate-200 hover:border-[#0f2942]/40 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-bold ${selectedSlot?.id === slot.id ? 'text-white' : 'text-slate-700'}`}>
                            {slot.slot_name}
                          </p>
                          {slot.start_time && slot.end_time && (
                            <p className={`text-xs mt-0.5 ${selectedSlot?.id === slot.id ? 'text-slate-300' : 'text-slate-400'}`}>
                              {slot.start_time.substring(0,5)} – {slot.end_time.substring(0,5)}
                            </p>
                          )}
                        </div>
                        <span className={`text-base font-extrabold flex items-center ${selectedSlot?.id === slot.id ? 'text-green-300' : 'text-green-700'}`}>
                          <IndianRupee size={14} />{formatRupee(slot.price)}
                        </span>
                      </button>
                    ))}
                    <p className="text-xs text-slate-400 flex items-center space-x-1 pt-1">
                      <Info size={11} />
                      <span>Click a slot to auto-fill booking times and calculate total amount.</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Booking Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-5">Book this Space</h3>

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
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Date</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                        <input type="date" required value={bookingDate}
                          onChange={e => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition-all cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Time Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Start Time</label>
                        <div className="relative">
                          <Clock size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                          <input type="time" required value={startTime}
                            onChange={e => { setStartTime(e.target.value); setSelectedSlot(null); }}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition-all cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">End Time</label>
                        <div className="relative">
                          <Clock size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
                          <input type="time" required value={endTime}
                            onChange={e => { setEndTime(e.target.value); setSelectedSlot(null); }}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition-all cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Purpose of Booking</label>
                      <div className="relative">
                        <FileText size={16} className="absolute top-3 left-3 text-slate-400 pointer-events-none" />
                        <textarea rows="3" value={purpose}
                          onChange={e => setPurpose(e.target.value)}
                          placeholder="e.g. Annual board presentation or Traditional ceremony"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Calculated Amount Display */}
                    {calculatedAmount > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">
                          {selectedSlot ? `${selectedSlot.slot_name} — Estimated Total` : 'Estimated Total'}
                        </p>
                        <div className="flex items-center space-x-1">
                          <IndianRupee size={22} className="text-green-700" />
                          <span className="text-3xl font-extrabold text-green-700">{formatRupee(calculatedAmount)}</span>
                        </div>
                        {selectedSlot?.pricing_type === 'hourly' && startTime && endTime && (
                          <p className="text-xs text-green-600 mt-1">
                            ₹{formatRupee(selectedSlot.price)}/hr ×{' '}
                            {(() => {
                              const [sh,sm] = startTime.split(':').map(Number);
                              const [eh,em] = endTime.split(':').map(Number);
                              return Math.ceil((eh*60+em-sh*60-sm)/60);
                            })()} hr(s)
                          </p>
                        )}
                      </div>
                    )}

                    <button type="submit" disabled={bookingLoading}
                      className="w-full py-3 bg-[#0f2942] hover:bg-[#1a3f63] disabled:bg-slate-400 text-white font-bold rounded-lg text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                    >
                      {bookingLoading ? 'Submitting Request...' : `Confirm Booking${calculatedAmount > 0 ? ` — ₹${formatRupee(calculatedAmount)}` : ''}`}
                    </button>

                    <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-1">
                      A confirmation email will be sent. Booking remains Pending until approved by the Administrator.
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
