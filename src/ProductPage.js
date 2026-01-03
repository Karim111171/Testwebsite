import React from 'react';

const products = [
    { id: 1, name: 'La nuit enchantée', price: 600, size: '50x70cm', weight: 800, image: '/images/cdk1.jpg' },
    { id: 2, name: 'La rosée du matin', price: 600, size: '50x70cm', weight: 900, image: '/images/cdk2.jpg' },
    { id: 3, name: 'Le coucher de soleil commence', price: 750, size: '50x70cm', weight: 1200, image: '/images/cdk3.jpg' },
    { id: 4, name: 'La nuit enchanteuse', price: 600, size: '50x70cm', weight: 300, image: '/images/cdk4.jpg' },
    { id: 5, name: 'La boite noire', price: 300, size: '30x40cm', weight: 200, image: '/images/cdk5.jpg' },
    { id: 6, name: 'Plouf !', price: 20, size: '5x7cm', weight: 50, image: '/images/cdk6.jpg' },
    { id: 7, name: 'Tic Tac Boum', price: 350, size: '40x60cm', weight: 300, image: '/images/cdk7.jpg' },
];

const ProductPage = () => {
	// Load cart from localStorage on component mount
	const initialCart = JSON.parse(localStorage.getItem('cart')) || [];
	const [cart, setCart] = React.useState(initialCart);
	const [deliveryDestination, setDeliveryDestination] = React.useState('France'); // Default to France
	const [deliveryDetails, setDeliveryDetails] = React.useState({
	    name: '',
	    address: '',
	    postalCode: '',
	    city: '',
	    email: '',
	    phone: '',
	});
  
	// Function to add an item to the cart
	const addToCart = (product) => {
	    setCart((prevCart) => {
		  const existingItem = prevCart.find((item) => item.id === product.id);
		  let updatedCart;
		  if (existingItem) {
			updatedCart = prevCart.map((item) =>
			    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
			);
		  } else {
			updatedCart = [...prevCart, { ...product, quantity: 1 }];
		  }
		  localStorage.setItem('cart', JSON.stringify(updatedCart));
		  return updatedCart;
	    });
	};
  
	// Function to update the quantity of an item in the cart
	const updateQuantity = (id, newQuantity) => {
	    setCart((prevCart) => {
		  const updatedCart = prevCart
			.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
			.filter((item) => item.quantity > 0); // Remove items with quantity <= 0
		  localStorage.setItem('cart', JSON.stringify(updatedCart));
		  return updatedCart;
	    });
	};
  
	// Function to remove an item from the cart
	const removeFromCart = (id) => {
	    setCart((prevCart) => {
		  const updatedCart = prevCart.filter((item) => item.id !== id);
		  localStorage.setItem('cart', JSON.stringify(updatedCart));
		  return updatedCart;
	    });
	};
  
	// Calculate total weight of the cart
	const calculateTotalWeight = () => {
	    return cart.reduce((totalWeight, item) => totalWeight + item.weight * item.quantity, 0);
	};
  
	// Calculate delivery fee based on weight and destination
	const calculateDeliveryFee = () => {
	    const totalWeight = calculateTotalWeight();
  
	    // If weight is above 10 kg or destination is international, ask to contact us
	    if (totalWeight > 10000 || deliveryDestination !== 'France') {
		  return 'Contact us';
	    }
  
	    // Delivery fees for France
	    if (totalWeight < 1000) {
		  return 15; // Base fee for < 1 kg
	    } else if (totalWeight >= 1000 && totalWeight <= 3000) {
		  return 15 + 15; // Base fee + 15 € for 1-3 kg
	    } else {
		  return 15 + 30; // Base fee + 30 € for > 3 kg
	    }
	};
  
	// Function to calculate the total price
	const calculateTotal = () => {
	    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
	    const deliveryFee = calculateDeliveryFee();
  
	    if (typeof deliveryFee === 'string') {
		  // If delivery fee is "Contact us", return only the cart total
		  return cartTotal;
	    }
  
	    return cartTotal + deliveryFee;
	};
  
	const handleCheckout = async () => {
		try {
		    // Validate cart items
		    const invalidItems = cart.filter((item) => !item.name || typeof item.price !== 'number' || !item.quantity);
		    if (invalidItems.length > 0) {
			  console.error('Invalid cart items:', invalidItems);
			  alert('Some items in your cart are invalid. Please check your cart.');
			  return;
		    }
	  
		    const { loadStripe } = await import('@stripe/stripe-js');
		    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
	  
		    if (!stripe) throw new Error('Stripe failed to initialize');
	  
		    const response = await fetch('/.netlify/functions/create-checkout-session', {
			  method: 'POST',
			  headers: { 'Content-Type': 'application/json' },
			  body: JSON.stringify({ items: cart, deliveryDetails }),
		    });
	  
		    if (!response.ok) {
			  const errorData = await response.json();
			  throw new Error(errorData.error || 'Payment failed');
		    }
	  
		    const { id: sessionId } = await response.json();
		    localStorage.setItem('checkoutData', JSON.stringify({
			items: cart,
			deliveryDetails
		    }));
		    const { error } = await stripe.redirectToCheckout({ sessionId });
		    if (error) throw error;
		} catch (error) {
		    console.error('Checkout error:', error);
		    alert(`Payment failed: ${error.message}`);
		}
	  };
  
	return (
	    <div className="product-page">
		  {/* Product List */}
		  <div className="product-list">
			<h1>Paintings</h1>
			<div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
			    {products.map((product) => (
				<div key={product.id} className="product-card">
				<div className="product-image-wrapper">
					<img
					src={product.image}
					alt={product.name}
					className="product-image"/>
				</div>
				<div className="product-info">
					<h2 className="product-title">{product.name}</h2>
					<p className="product-size">{product.size}</p>
					<p className="product-price">{product.price.toFixed(2)} €</p>
				</div>
				<button onClick={() => addToCart(product)}>Add to Cart</button>
				</div>
				))}
			</div>
		  </div>
  
		  {/* Cart Sidebar */}
		  <div className="cart-sidebar">
			<h2>Cart</h2>
			{cart.length === 0 ? (
			    <p>Your cart is empty.</p>
			) : (
			    <div>
				  {cart.map((item) => (
					<div key={item.id} className="cart-item">
					    <span>{item.name}</span>
					    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						  <button
							onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
							style={{ padding: '4px 8px', fontSize: '0.8rem' }}
						  >
							-
						  </button>
						  <span>{item.quantity}</span>
						  <button
							onClick={() => updateQuantity(item.id, item.quantity + 1)}
							style={{ padding: '4px 8px', fontSize: '0.8rem' }}
						  >
							+
						  </button>
						  <button
							onClick={() => removeFromCart(item.id)}
							style={{
							    marginLeft: '8px',
							    padding: '4px 8px',
							    fontSize: '0.8rem',
							    backgroundColor: '#ff4d4d',
							    color: 'white',
							    border: 'none',
							    borderRadius: '4px',
							    cursor: 'pointer',
							}}
						  >
							Remove
						  </button>
					    </div>
					    <span>{(item.price * item.quantity).toFixed(2)} €</span>
					</div>
				  ))}
  
				  {/* Delivery Destination Selector */}
				  <div className="cart-delivery">
					<br />
					<label>
					    Delivery Destination:
					    <select
						  value={deliveryDestination}
						  onChange={(e) => setDeliveryDestination(e.target.value)}
						  style={{ marginLeft: '8px' }}
					    >
						  <option value="France">France</option>
						  <option value="International">International</option>
					    </select>
					</label>
				  </div>
  
				  {/* Delivery Fee */}
				  <div className="cart-delivery">
					<br />
					<span>Delivery Fee:</span>
					<span>
					    {typeof calculateDeliveryFee() === 'string'
						  ? calculateDeliveryFee()
						  : `${calculateDeliveryFee().toFixed(2)} €`}
					</span>
				  </div>
  
				  {/* Enhanced Delivery Address Form */}
				  <div className="delivery-details">
					<h3>Delivery Address</h3>
					<form style={{ display: 'grid', gap: '10px', maxWidth: '300px' }}>
					    <div>
						  <label htmlFor="name" style={{ fontWeight: 'bold' }}>
							Nom:
						  </label>
						  <input
							type="text"
							id="name"
							value={deliveryDetails.name}
							onChange={(e) =>
							    setDeliveryDetails({ ...deliveryDetails, name: e.target.value })
							}
							placeholder="Enter your name"
							style={{
							    padding: '8px',
							    width: '100%',
							    border: '1px solid #ccc',
							    borderRadius: '4px',
							}}
						  />
					    </div>
					    <div>
						  <label htmlFor="address" style={{ fontWeight: 'bold' }}>
							Adresse:
						  </label>
						  <input
							type="text"
							id="address"
							value={deliveryDetails.address}
							onChange={(e) =>
							    setDeliveryDetails({ ...deliveryDetails, address: e.target.value })
							}
							placeholder="Enter your address"
							style={{
							    padding: '8px',
							    width: '100%',
							    border: '1px solid #ccc',
							    borderRadius: '4px',
							}}
						  />
					    </div>
					    <div>
						  <label htmlFor="postalCode" style={{ fontWeight: 'bold' }}>
							Code Postal:
						  </label>
						  <input
							type="text"
							id="postalCode"
							value={deliveryDetails.postalCode}
							onChange={(e) =>
							    setDeliveryDetails({ ...deliveryDetails, postalCode: e.target.value })
							}
							placeholder="Enter your postal code"
							style={{
							    padding: '8px',
							    width: '100%',
							    border: '1px solid #ccc',
							    borderRadius: '4px',
							}}
						  />
					    </div>
					    <div>
						  <label htmlFor="city" style={{ fontWeight: 'bold' }}>
							Ville:
						  </label>
						  <input
							type="text"
							id="city"
							value={deliveryDetails.city}
							onChange={(e) =>
							    setDeliveryDetails({ ...deliveryDetails, city: e.target.value })
							}
							placeholder="Enter your city"
							style={{
							    padding: '8px',
							    width: '100%',
							    border: '1px solid #ccc',
							    borderRadius: '4px',
							}}
						  />
					    </div>
					    <div>
						  <label htmlFor="email" style={{ fontWeight: 'bold' }}>
							Email:
						  </label>
						  <input
							type="email"
							id="email"
							value={deliveryDetails.email}
							onChange={(e) =>
							    setDeliveryDetails({ ...deliveryDetails, email: e.target.value })
							}
							placeholder="Enter your email"
							style={{
							    padding: '8px',
							    width: '100%',
							    border: '1px solid #ccc',
							    borderRadius: '4px',
							}}
						  />
					    </div>
					    <div>
						  <label htmlFor="phone" style={{ fontWeight: 'bold' }}>
							Phone:
						  </label>
						  <input
							type="tel"
							id="phone"
							value={deliveryDetails.phone}
							onChange={(e) =>
							    setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })
							}
							placeholder="Enter your phone number"
							style={{
							    padding: '8px',
							    width: '100%',
							    border: '1px solid #ccc',
							    borderRadius: '4px',
							}}
						  />
					    </div>
					</form>
				  </div>
  
				  {/* Total */}
				  <div className="cart-total">
					<strong>Total:</strong>
					<strong>{calculateTotal().toFixed(2)} €</strong>
				  </div>
				  <button onClick={handleCheckout}>Checkout</button>
			    </div>
			)}
		  </div>
	    </div>
	);
  };
  
  export default ProductPage;