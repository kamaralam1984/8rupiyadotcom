const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Let Socket.IO handle its own requests first
      // Socket.IO will handle /api/socket path automatically
      // For all other requests, pass to Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO BEFORE listening
  // This is important - Socket.IO needs to attach to the server before it starts listening
  try {
  const { initializeSocket } = require('./src/lib/socket-server');
    const io = initializeSocket(httpServer);
    console.log('✅ Socket.IO server initialized');
    
    // Verify Socket.IO is working
    if (io) {
      console.log('✅ Socket.IO instance created successfully');
    }
  } catch (socketError) {
    console.error('❌ Error initializing Socket.IO:', socketError);
    console.error('Stack:', socketError.stack);
    // Continue without Socket.IO - app will still work but chat won't
  }

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO initialized on /api/socket`);
    console.log(`> WebSocket endpoint: ws://${hostname}:${port}/api/socket`);
  });
}).catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

