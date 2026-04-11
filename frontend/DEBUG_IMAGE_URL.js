// Test to verify image URL construction
// Add this to your browser console to debug

// 1. Check if getArtworkImageUrl is available
console.log('Testing image utility...');

// 2. Test with sample image path
const testArtwork = {
  id: 1,
  title: 'Test',
  image_path: 'artworks/test.jpg',
  image_url: null
};

// 3. Simulate what the utility does
const baseUrl = 'http://localhost:8000/api';
const apiBaseUrl = baseUrl.replace('/api', '');
const constructedUrl = `${apiBaseUrl}/storage/${testArtwork.image_path}`;

console.log('=== Image URL Debug ===');
console.log('API URL:', baseUrl);
console.log('API Base URL:', apiBaseUrl);
console.log('Image Path:', testArtwork.image_path);
console.log('Constructed URL:', constructedUrl);
console.log('Expected URL:', 'http://localhost:8000/storage/artworks/test.jpg');

// 4. Test actual fetch
const testUrl = constructedUrl;
fetch(testUrl, { method: 'HEAD' })
  .then(res => {
    if (res.ok) {
      console.log('✅ URL is accessible:', testUrl);
    } else {
      console.log('❌ URL returned status:', res.status, testUrl);
    }
  })
  .catch(err => {
    console.log('❌ URL fetch failed:', err.message);
    console.log('❌ URL:', testUrl);
  });

// 5. Check actual artwork data
console.log('To get actual artwork data, run:');
console.log('fetch("http://localhost:8000/api/artworks/1").then(r => r.json()).then(d => console.log(d))');
