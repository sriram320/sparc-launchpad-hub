import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Simple component for testing
const Home = () => (
  <div className="container mx-auto p-4 mt-8">
    <h1 className="text-3xl font-bold">Home Page</h1>
    <p className="my-4">This is a simple test home page.</p>
  </div>
);

const About = () => (
  <div className="container mx-auto p-4 mt-8">
    <h1 className="text-3xl font-bold">About Page</h1>
    <p className="my-4">This is a simple test about page.</p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);