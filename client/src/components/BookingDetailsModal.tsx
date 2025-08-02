import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
// This is needed because the default icons reference files that aren't properly bundled
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface BookingDetailsModalProps {
  booking: any;
  onClose: () => void;
  isOpen: boolean;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose, isOpen }) => {
  if (!isOpen || !booking) return null;

  // Check if location coordinates exist
  const hasCoordinates = booking.location?.coordinates?.lat && booking.location?.coordinates?.lng;
  
  // Format date and time
  const formattedDate = booking.scheduledDate 
    ? new Date(booking.scheduledDate).toLocaleDateString() 
    : 'Not scheduled';
  
  const formattedTime = booking.scheduledTime || 'Not specified';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 rounded-lg border border-gray-800 w-full max-w-4xl animate-fadeInScale max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold gradient-text">Booking Details</h3>
          <button
            onClick={onClose}
            className="btn-secondary px-3 py-1 rounded-lg text-sm"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-800">Booking Information</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Service Type</p>
                <p className="text-white font-medium">{booking.serviceType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white font-medium">{formattedDate}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Time</p>
                <p className="text-white font-medium">{formattedTime}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-white font-medium">
                  <span className={`status-badge ${
                    booking.status === 'completed' ? 'status-success' : 
                    booking.status === 'cancelled' ? 'status-danger' : 
                    booking.status === 'assigned' ? 'status-info' : 
                    'status-warning'
                  }`}>
                    {booking.status}
                  </span>
                </p>
              </div>
              {booking.price && (
                <div>
                  <p className="text-gray-400 text-sm">Price</p>
                  <p className="text-white font-medium">₹{booking.price}</p>
                </div>
              )}
              {booking.paymentStatus && (
                <div>
                  <p className="text-gray-400 text-sm">Payment Status</p>
                  <p className="text-white font-medium">
                    <span className={`status-badge ${
                      booking.paymentStatus === 'paid' ? 'status-success' : 
                      booking.paymentStatus === 'refunded' ? 'status-info' : 
                      'status-warning'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Customer Information */}
            {booking.customer && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2 pb-2 border-b border-gray-800">Customer</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-medium">{booking.customer.name || 'N/A'}</p>
                  </div>
                  {booking.customer.phone && (
                    <div>
                      <p className="text-gray-400 text-sm">Phone</p>
                      <p className="text-white font-medium">{booking.customer.phone}</p>
                    </div>
                  )}
                  {booking.customer.email && (
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium">{booking.customer.email}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Vehicle Information */}
            {booking.vehicle && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2 pb-2 border-b border-gray-800">Vehicle</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Make & Model</p>
                    <p className="text-white font-medium">
                      {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.year})
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">License Plate</p>
                    <p className="text-white font-medium">{booking.vehicle.licensePlate || 'N/A'}</p>
                  </div>
                  {booking.vehicle.color && (
                    <div>
                      <p className="text-gray-400 text-sm">Color</p>
                      <p className="text-white font-medium">{booking.vehicle.color}</p>
                    </div>
                  )}
                  {booking.vehicle.vehicleType && (
                    <div>
                      <p className="text-gray-400 text-sm">Type</p>
                      <p className="text-white font-medium">{booking.vehicle.vehicleType}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Location Information and Map */}
          <div>
            <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-800">Service Location</h4>
            
            {booking.location ? (
              <>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Address</p>
                  <p className="text-white font-medium">
                    {booking.location.address}, {booking.location.city}, {booking.location.state} {booking.location.zipCode}
                  </p>
                </div>
                
                {hasCoordinates ? (
                  <div className="h-[300px] rounded-lg overflow-hidden border border-gray-700">
                    <MapContainer 
                      center={[booking.location.coordinates.lat, booking.location.coordinates.lng]} 
                      zoom={15} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[booking.location.coordinates.lat, booking.location.coordinates.lng]}>
                        <Popup>
                          Service Location<br />
                          {booking.location.address}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] bg-gray-900 rounded-lg border border-gray-700">
                    <p className="text-gray-400">Map coordinates not available</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-gray-400">Location information not available</p>
              </div>
            )}
            
            {/* Notes Section */}
            {(booking.notes?.customer || booking.notes?.worker) && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2 pb-2 border-b border-gray-800">Notes</h4>
                
                {booking.notes.customer && (
                  <div className="mb-3">
                    <p className="text-gray-400 text-sm">Customer Notes</p>
                    <p className="text-white">{booking.notes.customer}</p>
                  </div>
                )}
                
                {booking.notes.worker && (
                  <div>
                    <p className="text-gray-400 text-sm">Worker Notes</p>
                    <p className="text-white">{booking.notes.worker}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;