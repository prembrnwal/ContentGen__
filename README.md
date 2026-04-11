# 🚀 ContentGen – AI-Powered Content Generation Platform

**ContentGen** is a full-stack web application that allows users to generate high-quality content using AI APIs (e.g., Google Gemini). It provides a modern dashboard, authentication system, and multiple content generation tools in one place.

This project demonstrates real-world full-stack development using **Spring Boot**, **React**, and **REST APIs**.

---

## ✨ Features

* 🔐 User Authentication (Login / Register)
* 🧠 AI Content Generation using external API
* 📄 Multiple Content Types (Blog, Caption, Email, etc.)
* 📊 Modern Dashboard with statistics cards
* 🌙 Dark Mode UI with animations
* ⚡ Fast API integration
* 📁 Organized full-stack architecture

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Framer Motion
* Lucide Icons
* Axios

### Backend

* Spring Boot
* Spring Security
* REST APIs
* JWT Authentication

### Database

* MySQL / MongoDB (configurable)

### Tools

* Git & GitHub
* Postman
* IntelliJ IDEA
* VS Code

---

## 📂 Project Structure

```
ContentGen/
│
├── ContentGen_backend/
│   ├── src/
│   ├── pom.xml
│   └── application.properties
│
├── ContentGen_front/
│   ├── src/
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/your-username/ContentGen.git
cd ContentGen
```

---

### 2️⃣ Backend Setup (Spring Boot)

```
cd ContentGen_backend
mvn clean install
mvn spring-boot:run
```

Backend will start on:

```
http://localhost:8080
```

---

### 3️⃣ Frontend Setup (React)

```
cd ContentGen_front
npm install
npm start
```

Frontend will start on:

```
http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file in the frontend or backend and add:

```
API_KEY=your_api_key_here
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_secret_key
```

---

## 📡 API Endpoints (Example)

```
POST /api/auth/register
POST /api/auth/login
POST /api/content/generate
GET  /api/user/profile
```

---

## 🧪 Testing

You can test APIs using:

* Postman
* Thunder Client
* Browser

---

## 📸 Screens (Example)

* Login Page
* Dashboard
* Content Generator
* Sidebar Navigation

---

## 🚀 Future Enhancements

* 📁 Save generated content history
* 📤 Export content to PDF / DOCX
* 🤖 Multiple AI model support
* 🌐 Multi-language support
* 📊 Usage analytics dashboard
* 🔔 Notification system
* ☁️ Deployment (AWS / Render / Vercel)

---

## 👨‍💻 Author

**Prem Burnwal**

* Full Stack Developer
* Spring Boot & React Developer
* AI Application Builder

---

## 📜 License

This project is for educational and demonstration purposes.

---

## ⭐ Support

If you like this project:

* Star the repository ⭐
* Fork the project 🍴
* Contribute improvements 🚀
