import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductForm from './pages/ProductForm';
import Questionnaire from './pages/Questionnaire';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* <Navbar /> */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<ProductForm />} />
            <Route path="/questionnaire/:productId" element={<Questionnaire />} />
            <Route path="/results/:productId" element={<Results />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;