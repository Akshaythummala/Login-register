# Full-Stack Auth System

A premium Login and Registration application built with Spring Boot, React (Vite), and MySQL.

## Quick Start

### 1. Database
Create a MySQL database named `auth_db`. See [database.sql](database.sql).

### 2. Backend
```bash
cd backend
mvn spring-boot:run
```

### 3. Frontend
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the application.

### 4. Docker Compose (Recommended)
Run the entire stack (Frontend, Backend, MySQL) with one command:
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:80`
- **Backend**: `http://localhost:8080`
- **MySQL**: `localhost:3307` (Credentials: `root` / `rootpassword`)

## Design
The frontend uses a modern glassmorphism aesthetic with:
- HSL-tailored color palettes
- Animated background blobs
- Responsive glass containers
- Smooth micro-animations
- Google Fonts (Outfit)
