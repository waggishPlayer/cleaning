# Implementation Code for New Features

## 1. Map-Based Address Selection

### Update BookingPage.tsx

Add the following imports at the top of the file:
```typescript
import MapSelector from './MapSelector';
import { Loader } from '@googlemaps/js-api-loader';
```

Replace the address input form in the `showAddAddress` section with:

```typescript
{showAddAddress && (
  <div className="mt-6 p-6 border rounded-lg bg-gray-50">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Add New Address</h3>
      <button
        onClick={handleDetectLocation}
        disabled={detectingLocation}
        className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Navigation className="mr-2" size={16} />
        {detectingLocation ? 'Detecting...' : 'Use My Location'}
      </button>
    </div>
    
    {/* Map Selector Component */}
    <div className="mb-4">
      <MapSelector 
        onAddressSelect={(address) => {
          setNewAddress({
            ...newAddress,
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            coordinates: address.coordinates
          });
        }}
        initialAddress={newAddress}
      />
    </div>
    
    <div className="grid grid-cols-1 gap-4">
      <input
        type="text"
        placeholder="Street Address *"
        value={newAddress.street}
        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="City *"
          value={newAddress.city}
          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="State *"
          value={newAddress.state}
          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="ZIP Code *"
          value={newAddress.zipCode}
          onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    
    <div className="flex space-x-3 mt-4">
      <button
        onClick={handleAddAddress}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Address
      </button>
      <button
        onClick={() => setShowAddAddress(false)}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
      >
        Cancel
      </button>
    </div>
  </div>
)}
```

Update the `handleAddAddress` function to include coordinates:

```typescript
const handleAddAddress = async () => {
  if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
    setError('Please fill in all required address fields');
    return;
  }

  try {
    const res = await apiService.addAddress({
      street: newAddress.street,
      city: newAddress.city,
      state: newAddress.state,
      zipCode: newAddress.zipCode,
      coordinates: newAddress.coordinates // Include coordinates
    });

    if (res.success) {
      setAddresses([...addresses, res.data]);
      setBookingData({ ...bookingData, address: res.data });
      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        coordinates: undefined
      });
      setShowAddAddress(false);
    } else {
      setError(res.message || 'Failed to add address');
    }
  } catch (err) {
    setError('Failed to add address. Please try again.');
  }
};
```

### Update BookingForm.tsx

Add the MapSelector component to BookingForm.tsx as well:

```typescript
{/* Add MapSelector when adding a new address */}
{(addingNewAddress || addresses.length === 0) && (
  <div className="mb-4">
    <MapSelector 
      onAddressSelect={(address) => {
        setNewAddress({
          ...newAddress,
          address: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          coordinates: address.coordinates
        });
      }}
      initialAddress={{
        street: newAddress.address,
        city: newAddress.city,
        state: newAddress.state,
        zipCode: newAddress.zipCode
      }}
    />
  </div>
)}
```

## 2. Worker Booking Details Enhancement

### Update BookingDetailsModal.tsx

Enhance the BookingDetailsModal to include Google Maps integration and click-to-call functionality:

```typescript
{/* Customer Information with click-to-call */}
<div>
  <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-800">Customer Information</h4>
  
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div>
      <p className="text-gray-400 text-sm">Name</p>
      <p className="text-white font-medium">
        {typeof booking.customer === 'object' ? booking.customer.name : 'N/A'}
      </p>
    </div>
    <div>
      <p className="text-gray-400 text-sm">Phone</p>
      <p className="text-white font-medium">
        {typeof booking.customer === 'object' && booking.customer.phone ? (
          <a 
            href={`tel:${booking.customer.phone}`}
            className="flex items-center text-blue-400 hover:text-blue-300"
          >
            {booking.customer.phone}
            <Phone className="ml-1" size={14} />
          </a>
        ) : 'N/A'}
      </p>
    </div>
  </div>
</div>

{/* Location with Google Maps link */}
<div>
  <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-800">Location</h4>
  
  <div className="mb-4">
    <p className="text-white font-medium mb-2">
      {booking.location?.address}, {booking.location?.city}, {booking.location?.state} {booking.location?.zipCode}
    </p>
    
    {booking.location?.coordinates && (
      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${booking.location.coordinates.lat},${booking.location.coordinates.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <MapPin className="mr-2" size={16} />
        Open in Google Maps
      </a>
    )}
  </div>
  
  {/* Map display */}
  {hasCoordinates && (
    <div className="h-64 rounded-lg overflow-hidden">
      <MapContainer 
        center={[booking.location.coordinates.lat, booking.location.coordinates.lng]} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[booking.location.coordinates.lat, booking.location.coordinates.lng]}>
          <Popup>
            Booking Location
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )}
</div>
```

### Update WorkerDashboard.tsx

Enhance the worker dashboard to show more booking details:

```typescript
<tr key={b._id} className="border-b border-[#18181b]">
  <td className="py-2 px-4">{typeof b.customer === 'object' ? b.customer.name : b.customer}</td>
  <td className="py-2 px-4">{b.serviceType}</td>
  <td className="py-2 px-4">{b.scheduledDate}</td>
  <td className="py-2 px-4">{b.status}</td>
  <td className="py-2 px-4 flex gap-2">
    <button type="button" className="btn-success" style={{ background: '#00ddff', color: '#000', border: 'none', fontWeight: 600 }} onClick={() => handleMarkComplete(b._id)}>Mark as Completed</button>
    <button type="button" className="btn-outline" style={{ borderColor: '#c1ff72', color: '#c1ff72' }} onClick={() => handleViewUser(b)}>View Details</button>
    {b.location?.coordinates && (
      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${b.location.coordinates.lat},${b.location.coordinates.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline"
        style={{ borderColor: '#00ddff', color: '#00ddff' }}
      >
        <MapPin className="mr-1" size={14} />
        Maps
      </a>
    )}
    {typeof b.customer === 'object' && b.customer.phone && (
      <a 
        href={`tel:${b.customer.phone}`}
        className="btn-outline"
        style={{ borderColor: '#c1ff72', color: '#c1ff72' }}
      >
        <Phone className="mr-1" size={14} />
        Call
      </a>
    )}
  </td>
</tr>
```

## 3. Admin Analytics Dashboard

### Create PageViewTracker.tsx

```typescript
import { useEffect } from 'react';
import apiService from '../services/api';

interface PageViewTrackerProps {
  pageName: string;
}

const PageViewTracker: React.FC<PageViewTrackerProps> = ({ pageName }) => {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await apiService.trackPageView(pageName);
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [pageName]);

  return null; // This component doesn't render anything
};

export default PageViewTracker;
```

### Update LandingPage.tsx and Register.tsx

Add the PageViewTracker to both components:

```typescript
// In LandingPage.tsx
import PageViewTracker from './PageViewTracker';

const LandingPage: React.FC = () => {
  // Existing code...
  
  return (
    <>
      <PageViewTracker pageName="landing" />
      {/* Rest of the component */}
    </>
  );
};
```

```typescript
// In Register.tsx
import PageViewTracker from './PageViewTracker';

const Register: React.FC = () => {
  // Existing code...
  
  return (
    <>
      <PageViewTracker pageName="register" />
      {/* Rest of the component */}
    </>
  );
};
```

### Update API Service

Add the trackPageView method to the API service:

```typescript
// In api.ts
async trackPageView(pageName: string): Promise<ApiResponse<null>> {
  const response: AxiosResponse<ApiResponse<null>> = await this.api.post('/admin/track-page-view', { pageName });
  return response.data;
}

async getPageViewAnalytics(): Promise<ApiResponse<any>> {
  const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/admin/page-view-analytics');
  return response.data;
}
```

### Update AdminDashboard.tsx

Add the page view analytics section to the admin dashboard:

```typescript
// In the analytics section of AdminDashboard.tsx
{activeSection === 'analytics' && (
  <section>
    <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
    
    {/* Existing analytics cards */}
    
    {/* Page View Analytics */}
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Page Views</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-medium text-gray-800 mb-2">Landing Page Views</h4>
          <p className="text-3xl font-bold text-blue-600">{dashboardData.landingPageViews || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-medium text-gray-800 mb-2">Registration Page Views</h4>
          <p className="text-3xl font-bold text-green-600">{dashboardData.registerPageViews || 0}</p>
        </div>
      </div>
    </div>
  </section>
)}
```

### Update Server-Side Code

Create a PageView model:

```javascript
// models/PageView.js
const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
    enum: ['landing', 'register']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: String,
  ipAddress: String
});

module.exports = mongoose.model('PageView', pageViewSchema);
```

Add routes for page view tracking:

```javascript
// routes/admin.js

// @desc    Track page view
// @route   POST /api/admin/track-page-view
// @access  Public
router.post('/track-page-view', async (req, res) => {
  try {
    const { pageName } = req.body;
    
    if (!pageName) {
      return res.status(400).json({
        success: false,
        message: 'Page name is required'
      });
    }
    
    // Create page view record
    await PageView.create({
      pageName,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });
    
    res.json({
      success: true,
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    console.error('Track page view error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking page view',
      error: error.message
    });
  }
});

// @desc    Get page view analytics
// @route   GET /api/admin/page-view-analytics
// @access  Private/Admin
router.get('/page-view-analytics', protect, authorize('admin'), async (req, res) => {
  try {
    // Get total counts
    const landingPageViews = await PageView.countDocuments({ pageName: 'landing' });
    const registerPageViews = await PageView.countDocuments({ pageName: 'register' });
    
    // Get daily counts for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyViews = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            pageName: '$pageName'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        landingPageViews,
        registerPageViews,
        dailyViews
      }
    });
  } catch (error) {
    console.error('Get page view analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching page view analytics',
      error: error.message
    });
  }
});
```

## Package Installation

Install the required packages:

```bash
npm install @googlemaps/js-api-loader leaflet react-leaflet
```

## Environment Variables

Add the Google Maps API key to your .env file:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Final Steps

1. Create a Google Maps API key if you don't have one
2. Update the .env file with the API key
3. Install the required packages
4. Test each feature thoroughly