// Test API URL configuration
console.log('=== API URL Test ===');
console.log('import.meta.env:', import.meta.env);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Expected:', 'http://localhost:8000/api');

// Test direct fetch (bypasses axios)
console.log('=== Direct Fetch Test (bypassing axios) ===');
fetch('http://localhost:8000/api/artworks')
  .then(r => {
    console.log('Fetch response status:', r.status);
    console.log('Fetch response headers:', [...r.headers.entries()]);
    return r.text();
  })
  .then(text => {
    console.log('Fetch raw response text:', text);
    try {
      const json = JSON.parse(text);
      console.log('Fetch parsed JSON:', json);
      console.log('Fetch JSON keys:', Object.keys(json));
      if (json.data) {
        console.log('Fetch data count:', Array.isArray(json.data) ? json.data.length : 'not array');
      }
    } catch (e) {
      console.error('Fetch JSON parse error:', e);
    }
  })
  .catch(e => console.error('Fetch error:', e));

// Test with axios
console.log('=== Axios Test ===');
import api from './services/api';
api.get('/artworks')
  .then(d => {
    console.log('Axios response:', d);
    console.log('Axios response type:', typeof d);
    console.log('Axios response keys:', Object.keys(d || {}));
  })
  .catch(e => console.error('Axios error:', e));

export default {};
