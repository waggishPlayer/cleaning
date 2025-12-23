Caarvo

A full-stack web application for managing vehicle cleaning services with role-based access control for customers, workers, and administrators.

## Features

### 🚗 Customer Features
- User registration and authentication
- Vehicle management (add, edit, delete vehicles)
- Book cleaning services with date/time selection
- View booking history and status
- Cancel or reschedule bookings
- Rate and review completed services

### 👷 Worker Features
- Worker registration and authentication
- View assigned bookings
- Update booking status (en route, in progress, completed)
- View customer and vehicle details for assigned jobs
- Manage availability status

### 👨‍💼 Admin Features
- Complete user management (customers and workers)
- View all bookings and assign workers
- Manage worker availability
- View analytics and reports
- Monitor service performance

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## Project Structure

```
cleaning/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── config.env          # Environment variables
│   ├── server.js           # Main server file
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `config.env` and update the values:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/vehicle-cleaning
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     JWT_EXPIRE=7d
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be running on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Vehicles
- `GET /api/vehicles` - Get user's vehicles
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status (worker)
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/review` - Add review

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/workers` - Get all workers
- `PUT /api/admin/bookings/:id/assign` - Assign booking to worker
- `GET /api/admin/analytics` - Get analytics

## Database Models

### User
- Basic info (name, email, phone)
- Role (user, worker, admin)
- Address information
- Worker-specific details (availability, rating, specialties)

### Vehicle
- Owner reference
- Vehicle details (make, model, year, license plate)
- Vehicle type and size
- Notes

### Booking
- Customer and vehicle references
- Worker assignment
- Service details (type, date, time, location)
- Status tracking
- Payment and review information

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected routes
- Input validation and sanitization
- CORS configuration

## Development

### Running in Development Mode
1. Start MongoDB service
2. Start backend: `cd server && npm run dev`
3. Start frontend: `cd client && npm start`

### Building for Production
1. Backend: `cd server && npm start`
2. Frontend: `cd client && npm run build`

## Deployment

This application is configured for deployment with:
- **Backend**: Render.com (free tier)
- **Frontend**: Hostinger (static hosting)
- **Database**: MongoDB Atlas

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 
