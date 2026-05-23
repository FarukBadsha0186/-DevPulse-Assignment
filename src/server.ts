// import app from './app.js';
// import { config } from './config/index.js';
// import { initializeDatabase } from './db/index.js';

// const PORT = config.port;

// async function startServer() {
//   try {
//     // Initialize database tables
//     await initializeDatabase();
    
//     // Start server
//     app.listen(PORT, () => {
//       console.log(` DevPulse server running on port ${PORT}`);
//       console.log(` Health check: http://localhost:${PORT}/health`);
//       console.log(` Auth endpoints: http://localhost:${PORT}/api/auth`);
//       console.log(` Issues endpoints: http://localhost:${PORT}/api/issues`);
//     });
//   } catch (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1);
//   }
// }

// startServer();
import app from './app.js';
import { config } from './config/index.js';
import { initializeDatabase } from './db/index.js';

const PORT = config.port;

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();