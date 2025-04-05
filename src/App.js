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
              <li><Link to="/about">About</Link></li>
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

export default App;