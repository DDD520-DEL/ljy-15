async function testAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/bookings/occupied-slots?artistId=artist-1&date=2026-06-16');
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
