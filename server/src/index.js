import dotenv from 'dotenv';
import app from '../app.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const handleServerError = (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
    server.listen(PORT + 1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
};

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', handleServerError);

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});