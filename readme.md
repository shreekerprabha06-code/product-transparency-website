Product Transparency Platform

A comprehensive platform that helps businesses create transparency reports for their products through AI-powered questionnaires and automated scoring.

🎯 Project Overview

This platform allows companies to:



Register products and provide basic information

Answer AI-generated questions about their products

Receive transparency scores based on their responses

Generate professional transparency reports

Improve product transparency and consumer trust



🏗️ Project Structure

product-transparency-platform/

├── backend/                 # Main Express.js API server

│   ├── server.js           # Main server file

│   ├── Routes/             # API route handlers

│   │   ├── products.js     # Product CRUD operations

│   │   ├── questions.js    # Q\&A handling

│   │   ├── calculate-score.js  # Scoring algorithm

│   │   └── reports.js      # Report generation

│   ├── package.json



├── ai-service/            # AI service for question generation

│   ├── server.js          # AI service server

│   ├── Routes/

│   │   └── generate-questions.js  # Groq LLM integration

│   ├── package.json

│   └── .env              # Groq API key

├── frontend/             # React.js user interface

│   ├── public/

│   ├── src/

│   │   ├── App.js        # Main app with routing

│   │   ├── App.css       # Styling

│   │   ├── pages/        # Page components

│   │   │   ├── HomePage.js

│   │   │   ├── ProductForm.js

│   │   │   ├── Questionnaire.js

│   │   │   └── Results.js

│   │   ├── components/   # Reusable components

│   │   │   ├── Navbar.js

│   │   │   └── Footer.js

│   │   └── utils/

│   │       └── api.js    # API helper functions

│   └── package.json

└── README.md

🛠️ Prerequisites

Before you begin, ensure you have the following installed:



Node.js (version 16 or higher)

MongoDB (local installation or MongoDB Atlas account)

MongoDB Compass (recommended for database management)

Git (for version control)

Groq API Key (free from https://console.groq.com/)



⚡ Quick Start

1\. Clone the Repository

bashgit clone https://github.com/yourusername/product-transparency-platform.git

cd product-transparency-platform

2\. Database Setup

Option A: Local MongoDB

bash# Start MongoDB service

mongod



\# Create database and collections using MongoDB Compass:

\# - Connect to mongodb://localhost:27017

\# - Create database: product-transparency

\# - Create collections: products, questions, reports, scores

Option B: MongoDB Atlas (Cloud)



Create account at https://cloud.mongodb.com

Create free cluster

Get connection string

Create database: product-transparency

Create collections: products, questions, reports, scores



3\. Backend Setup

bashcd backend

npm install

Create .env file in backend folder:

env# Database Configuration

MONGO\_URI=mongodb://localhost:27017/product-transparency

\# OR for Atlas:

\# MONGO\_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/product-transparency



\# Server Configuration

PORT=5000

Start backend server:

node server.js

Backend runs on: http://localhost:5000

4\. AI Service Setup

bashcd ../ai-service

npm install

Create .env file in ai-service folder:

env# Groq API Configuration

GROQ\_API\_KEY=your\_groq\_api\_key\_here



Start AI service:

node server.js

AI Service runs on: http://localhost:5001

5\. Frontend Setup

bashcd ../frontend

npx create-react-app .

npm install react-router-dom axios

Create folder structure:

bashmkdir src/pages src/components src/utils

Start React development server:

bashnpm start

Frontend runs on: http://localhost:3000

🧪 Testing the API

Use Thunder Client (VS Code extension) or Postman to test the following endpoints:

Backend API Endpoints (Port 5000)

1\. Create Product



POST http://localhost:5000/products

Body:



json{

  "name": "Organic Apple Juice",

  "category": "food",

  "description": "100% organic apple juice with no preservatives",

  "manufacturer": "Fresh Foods Co"

}

2\. Get Product



GET http://localhost:5000/products/:productId



3\. Save Answer



POST http://localhost:5000/questions

Body:



json{

  "productId": "your\_product\_id",

  "question": "What preservatives are used in this product?",

  "answer": "No preservatives used - 100% natural",

  "step": 1

}

4\. Calculate Score



POST http://localhost:5000/calculate-score

Body:



json{

  "productId": "your\_product\_id"

}

5\. Generate Report



POST http://localhost:5000/reports

Body:



json{

  "productId": "your\_product\_id"

}

AI Service Endpoints (Port 5001)

Generate Next Question



POST http://localhost:5001/generate-questions

Body:



json{

  "productName": "Organic Apple Juice",

  "category": "food",

  "currentStep": 1,

  "previousQuestion": "What preservatives are used?",

  "previousAnswer": "No preservatives used"

}

🚀 Running the Complete Application

You need 3 terminal windows running simultaneously:

Terminal 1: MongoDB

bashmongod

Terminal 2: Backend Services

bash# Start backend (Terminal 2a)

cd backend

node server.js



\# Start AI service (Terminal 2b) - open another terminal

cd ai-service

node server.js

Terminal 3: Frontend

bashcd frontend

npm start

🌟 Features

Product Registration: Add products with basic information
AI-Powered Questions: Dynamic questions generated by Groq LLM
Intelligent Scoring: Rule-based transparency scoring algorithm
Professional Reports: Comprehensive transparency reports
Category Support: Food, cosmetics, and electronics categories
Responsive Design: Modern, mobile-friendly interface

📚 Technology Stack
Backend

Node.js - Runtime environment
Express.js - Web framework
MongoDB - Database
Groq API - LLM for question generation

Frontend

React.js - UI library
React Router - Client-side routing
Axios - HTTP client
CSS3 - Styling

API Requests Hanging

Check if all servers are running
Verify MongoDB connection
Check console logs for errors



Groq API Errors

Verify API key is correct
Check internet connection
Ensure you haven't exceeded rate limits

Development Workflow

Database First: Ensure MongoDB is running
Backend Second: Start both Express servers
Frontend Last: Start React development server
Test APIs: Use Thunder Client to verify endpoints
Build Features: Develop frontend components

🆘 Support
If you encounter any issues:

Check that all services are running on correct ports
Verify environment variables are set correctly
Check MongoDB connection and collections
Review server console logs for error messages
Test API endpoints individually with Thunder Client

