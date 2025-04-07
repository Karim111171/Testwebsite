import React from 'react';

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

    export default SuccessPage