# Lightweight Feedback System

A modern, secure feedback sharing platform for internal communication between managers and team members.

## 🌟 Features

### Core Features (MVP)
- **Authentication & Roles**: Manager and Employee roles with secure login
- **Feedback Submission**: Managers can submit structured feedback with strengths, areas to improve, and sentiment
- **Feedback Visibility**: Employees can view their feedback and acknowledge it
- **Dashboard**: Role-specific dashboards with team overview and feedback timeline
- **Access Control**: Managers only see their team, employees only see their feedback

### Bonus Features
- Clean, modern UI with Tailwind CSS
- Real-time feedback acknowledgment
- Sentiment tracking and analytics
- Responsive design for mobile and desktop

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (can be easily swapped for PostgreSQL)
- **Authentication**: JWT tokens with bcrypt password hashing
- **ORM**: SQLAlchemy with Alembic for migrations
- **Containerization**: Docker

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 16+
- Docker (optional)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize the database**:
   ```bash
   python init_db.py
   ```

4. **Run the backend server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

### Docker Setup (Backend Only)

1. **Build and run with Docker**:
   ```bash
   cd backend
   docker build -t feedback-system-backend .
   docker run -p 8000:8000 feedback-system-backend
   ```

## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `name` (String)
- `email` (String, Unique)
- `password_hash` (String)
- `role` (Enum: manager/employee)
- `manager_id` (Foreign Key to Users.id, nullable)

### Feedback Table
- `id` (Primary Key)
- `employee_id` (Foreign Key to Users.id)
- `manager_id` (Foreign Key to Users.id)
- `strengths` (Text, nullable)
- `areas_to_improve` (Text, nullable)
- `sentiment` (Enum: positive/neutral/negative)
- `created_at` (DateTime)
- `updated_at` (DateTime, nullable)
- `acknowledged` (Boolean, default: false)

## 🔐 Authentication

The system uses JWT tokens for authentication. Sample credentials are provided:

### Manager Account
- **Email**: john.manager@company.com
- **Password**: manager123

### Employee Accounts
- **Email**: alice.employee@company.com
- **Password**: employee123
- **Email**: bob.employee@company.com
- **Password**: employee123
- **Email**: carol.employee@company.com
- **Password**: employee123

## 📡 API Endpoints

### Authentication
- `POST /login` - User login
- `GET /me` - Get current user info

### Users
- `POST /users` - Create new user
- `GET /team` - Get team members (managers only)

### Feedback
- `POST /feedback` - Create feedback (managers only)
- `GET /feedback` - Get feedback (filtered by role)
- `PUT /feedback/{id}` - Update feedback (managers only)
- `POST /feedback/{id}/acknowledge` - Acknowledge feedback (employees only)

### Dashboards
- `GET /dashboard/manager` - Manager dashboard data
- `GET /dashboard/employee` - Employee dashboard data

## 🎨 Design Decisions

### Backend Architecture
- **FastAPI**: Chosen for its modern async support, automatic API documentation, and excellent performance
- **SQLAlchemy**: Provides robust ORM with relationship management
- **JWT Authentication**: Stateless authentication suitable for modern web applications
- **SQLite**: Simple setup for development, easily replaceable with PostgreSQL for production

### Frontend Architecture
- **React 18**: Modern React with hooks and concurrent features
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Context API**: Simple state management for authentication
- **Component-based**: Modular, reusable components

### Security Considerations
- Password hashing with bcrypt
- JWT token expiration
- Role-based access control
- Input validation with Pydantic schemas
- CORS configuration for frontend integration

## 🚀 Deployment

### Backend Deployment
The backend includes a Dockerfile for easy containerization:

```bash
docker build -t feedback-system-backend .
docker run -p 8000:8000 feedback-system-backend
```

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🔧 Development

### Adding New Features
1. Update database models in `backend/app/models.py`
2. Create/update Pydantic schemas in `backend/app/schemas.py`
3. Add CRUD operations in `backend/app/crud.py`
4. Create API endpoints in `backend/app/main.py`
5. Update frontend components as needed

### Database Migrations
For production, consider using Alembic for database migrations:

```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 📝 Testing

The application includes sample data for testing. You can:
1. Login as a manager to create feedback
2. Login as an employee to view and acknowledge feedback
3. Test role-based access controls
4. Verify dashboard functionality

## 🤝 Contributing

This is a demonstration project for a feedback system. The code is structured to be easily extensible for additional features like:
- Anonymous peer feedback
- Feedback templates
- Email notifications
- Export functionality
- Advanced analytics

## 📄 License

This project is created for demonstration purposes.

---

**Note**: This project was built with AI assistance for rapid development while maintaining clean, modular code architecture and best practices. 