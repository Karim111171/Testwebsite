import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'; // Add this import
import About from './About';
import ProductPage from './ProductPage';
import Contact from './Contact';
import SuccessPage from './SuccessPage';	

const App = () => {
  return (
    <Router> {/* Wrap the entire app with Router */}
      <div className="App">
        {/* Header */}
        <header>
          <nav>
	    <h1>Carla Dib Keirouz</h1>
            <ul>
              <li><Link to="/about">Home</Link></li>
              <li><Link to="/products">Collect</Link></li>
              <li><Link to="/contact">Contact me</Link></li>
            </ul>
          </nav>
        </header>

        {/* Main Content */}
        <main>
	  <Routes>
		<Route path="/about" element={<About />} />
		<Route path="/products" element={<ProductPage />} />
		<Route path="/contact" element={<Contact />} />
		<Route path="/success" element={<SuccessPage />} />
		<Route path="/" element={<About />} />
		{/* Add a catch-all route for SPA behavior */}
		<Route path="*" element={<Navigate to="/" />} />
	  </Routes>
        </main>

        {/* Footer */}
        <footer>
          <p>&copy; 2023 Studio Emotions</p>
        </footer>
      </div>
    </Router>
  );
};



export default App;