// server/index.js
import 'dotenv/config';
import app from './app.js';

// At the top of server/index.js, after imports
console.log('Server starting...');
console.log('Environment variables:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '[REDACTED]' : 'not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '[REDACTED]' : 'not set');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);  
});