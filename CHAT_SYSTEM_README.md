# 8rupiya.com Chat System - Implementation Guide

## Overview
Yahoo-style lightweight chat system for local business platform with public rooms, private chats, and full admin control.

## Features Implemented

### ✅ Database Models
- `ChatRoom` - Public chat rooms (location + category based)
- `ChatMessage` - Messages for both public and private chats
- `PrivateChat` - 1-to-1 private conversations
- `ChatModeration` - User moderation (mute/block/ban)
- `ChatAdminLog` - Admin activity audit logs

### ✅ API Routes
- `/api/chat/rooms` - Get/create chat rooms
- `/api/chat/rooms/list` - List available rooms
- `/api/chat/messages` - Get/send messages
- `/api/chat/private` - Get/create private chats
- `/api/admin/chat/moderate` - Admin moderation tools
- `/api/admin/chat/logs` - Admin activity logs
- `/api/admin/chat/rooms` - Admin room management

### ✅ Frontend Components
- `/chat` - Main chat page (lazy loaded)
- `PublicChatRoom` - Public chat interface
- Socket.IO client integration

## Setup Instructions

### 1. Install Dependencies
```bash
npm install socket.io @types/socket.io
```

### 2. Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 3. Socket.IO Server Setup

For Next.js App Router, you need to create a custom server. Create `server.js` in root:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initializeSocket } = require('./src/lib/socket-server');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  initializeSocket(httpServer);

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

Update `package.json`:
```json
{
  "scripts": {
    "dev": "node server.js",
    "start": "NODE_ENV=production node server.js"
  }
}
```

### 4. Database Indexes
The models include indexes, but ensure MongoDB indexes are created:
```javascript
// Run once to create indexes
db.chatrooms.createIndex({ country: 1, state: 1, district: 1, area: 1, category: 1 }, { unique: true });
db.chatmessages.createIndex({ roomId: 1, createdAt: -1 });
db.chatmessages.createIndex({ privateChatId: 1, createdAt: -1 });
db.privatechats.createIndex({ userA: 1, userB: 1 }, { unique: true });
```

## Usage

### Public Chat
1. Navigate to `/chat`
2. Select a category from left sidebar
3. Start chatting in the room

### Private Chat
1. Click on a username in public chat
2. Or use `/api/chat/private?userId=xxx` to create chat
3. Private chat component (to be implemented)

### Admin Panel
1. Admin can access `/admin/chat` (to be implemented)
2. Monitor all rooms invisibly
3. Moderate users and messages

## Security Features

- ✅ Authentication required for all chat operations
- ✅ Rate limiting (3 seconds between messages)
- ✅ Message length validation (max 1000 chars)
- ✅ User moderation system
- ✅ Admin audit logging
- ✅ Private chat access control

## Performance

- ✅ Lazy loading of chat components
- ✅ Only loads on `/chat` route
- ✅ Pagination for messages (30 per page)
- ✅ Socket.IO disconnects on page leave
- ✅ No impact on homepage/SEO

## Next Steps (To Complete)

1. **Private Chat Component** - Create `PrivateChatWindow.tsx`
2. **Admin Chat Panel** - Create `/admin/chat` page
3. **Socket.IO Server Integration** - Setup custom server
4. **Message Auto-expiry** - Cleanup job for old messages
5. **Keyword Filtering** - Auto-moderation based on keywords

## Notes

- Chat pages are excluded from search engines (robots.txt)
- No ads on chat pages
- All admin actions are logged
- Messages can be soft-deleted (isDeleted flag)


