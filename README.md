# 🏋️ Gym Management System

A full-stack Gym Management System developed to simplify gym operations and manage members, staff, memberships, and payments through a user-friendly web application.

## 📌 About the Project

The Gym Management System is a web-based application designed to manage daily gym activities digitally. It provides separate access for Admin, Staff, and Members with role-based functionality.

## ✨ Features

### 👨‍💼 Admin Module
- Admin login and authentication
- Manage gym members
- Manage staff
- Monitor gym operations
- Manage memberships and payments

### 🧑‍🏫 Staff Module
- Staff login
- Access assigned member information
- Assist in gym management activities

### 💪 Member Module
- Member login and registration
- View personal profile
- View membership details
- View payment history
- Access member dashboard

## 🛠️ Technologies Used

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Tools**
- Visual Studio Code
- Git & GitHub
- MongoDB Compass
- Postman

## 📂 Project Structure

```text
Gym-Management-System/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── public/
├── src/
│   ├── components/
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── index.html
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/nisha2507p/Gym-Management-System-project.git
```

### 2. Open the Project

```bash
cd Gym-Management-System-project
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

### 5. Configure Environment Variables

Create a `.env` file inside the backend folder and configure your MongoDB connection and JWT secret.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 6. Start the Backend

```bash
node server.js
```

### 7. Start the Frontend

Open another terminal in the main project folder and run:

```bash
npm run dev
```

## 🎯 Project Objective

The main objective of this project is to reduce manual gym management work and provide a digital platform for managing members, staff, memberships, and payment-related activities efficiently.

## 👩‍💻 Developer

**Nisha Pandey**

GitHub: [nisha2507p](https://github.com/nisha2507p)

---

⭐ If you like this project, don't forget to give it a star!
