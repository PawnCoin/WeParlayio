import { app } from './index';

// Detect port from environment or use default 3000
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`WeParlay server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});