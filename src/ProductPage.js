import React from 'react';

const products = [
	{ id: 1, name: 'La nuit enchantée', price: 600, image: '/images/cdk1.jpg' },
	{ id: 2, name: 'La rosée du matin', price: 600, image: '/images/cdk2.jpg' },
	{ id: 1, name: 'La nuit enchantée', price: 600, image: '/images/cdk1.jpg' },
	{ id: 2, name: 'La rosée du matin', price: 600, image: '/images/cdk2.jpg' },
	{ id: 3, name: 'Le coucher de soleil commence', price: 750, image: '/images/cdk3.jpg' },
    ];

    const ProductPage = () => {
	// Load cart from localStorage on component mount
	const initialCart = JSON.parse(localStorage.getItem('cart')) || [];
	const [cart, setCart] = React.useState(initialCart);
    
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
    
	// Function to calculate the total price
	const calculateTotal = () => {
	  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
	  const deliveryFee = 5.0; // Fixed delivery fee in euros
	  return cartTotal + deliveryFee;
	};
    
	// Function to handle checkout
	const handleCheckout = async () => {
	  try {
	    const { loadStripe } = await import('@stripe/stripe-js');
	    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
    
	    if (!stripe) throw new Error('Stripe failed to initialize');
    
	    const response = await fetch('/.netlify/functions/create-checkout-session', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ items: cart }),
	    });
    
	    if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || 'Payment failed');
	    }
    
	    const { id: sessionId } = await response.json();
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
			<img src={product.image} alt={product.name} className="product-image" />
			<h2>{product.name}</h2>
			<p>{product.price.toFixed(2)} €</p>
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
		    <div className="cart-delivery">
			<br></br>
			<span>Delivery Fee:</span>
			<span>5.00 €</span>
		    </div>
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