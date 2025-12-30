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
	  <header className="header">
          <div className="container header-content">
            <h1>Carla Dib Keirouz</h1>
            <nav className="nav">
              <ul>
                <li>
                  <Link to="/products">Paintings</Link>
                </li>
                <li>
                  <Link to="/success">Checkout</Link>
                </li>
                <li>
                  <a
                    href="https://karim111171.github.io/Carla-Dib-Keirouz/" // Remplace par l'URL de ton portfolio
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Portfolio
                  </a>
                </li>
              </ul>
            </nav>
          </div>
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