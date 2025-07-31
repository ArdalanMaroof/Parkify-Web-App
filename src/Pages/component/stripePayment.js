export const handleStripePayment = async (spot) => {
  try {
    localStorage.setItem('pendingStripeSpot', JSON.stringify(spot)); // <- Save before redirect

    // Convert "$2.00" → 2.00 from db or set to 0 if free
    const cleanedRate = !spot.paid
      ? 0
      : typeof spot.rate === 'string'
        ? parseFloat(spot.rate.replace('$', '')) || 2 // fallback to 2 if parsing fails
        : typeof spot.rate === 'number'
          ? spot.rate
          : 2; // default fallback if rate missing

    const res = await fetch(
      'http://localhost:2000/api/create-checkout-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotName: spot.name,
          price: cleanedRate,
        }),
      }
    );

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Failed to initiate payment');
    }
  } catch (error) {
    console.error('Stripe Payment Error:', error);
    alert('Something went wrong during payment');
  }
};
