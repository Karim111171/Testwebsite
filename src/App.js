import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Add this import
import About from './About';
import ProductPage from './ProductPage';
import Contact from './Contact';

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
              <li><Link to="/products">Paintings</Link></li>
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
            <Route path="/" element={<About />} /> {/* Default route */}
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

const SuccessPage = () => {
	const location = window.location.search;
	const sessionId = new URLSearchParams(location).get('session_id');
    
	return (
	  <div style={{ textAlign: 'center', marginTop: '50px' }}>
	    <h1 style={{ color: 'green' }}>Payment Successful!</h1>
	    <p>Your payment was processed successfully.</p>
	    {sessionId && <p style={{ fontSize: '0.9rem', color: '#555' }}>Session ID: {sessionId}</p>}
	  </div>
	);
    };

export default App;