import { Server } from 'socket.io';
import dotenv from 'dotenv';

import Connection from './database/db.js';

import { getDocument, updateDocument } from './controller/document-controller.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

Connection();

const io = new Server({
  cors: {
    origin: '*', // Allow requests from any origin, update as needed
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('get-document', async (documentId) => {
    try {
      const document = await getDocument(documentId);
      socket.join(documentId);
      socket.emit('load-document', document.data);
    } catch (error) {
      console.error('Error getting document:', error);
    }

    socket.on('send-changes', (delta) => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    socket.on('save-document', async (data) => {
      try {
        await updateDocument(documentId, data);
      } catch (error) {
        console.error('Error saving document:', error);
      }
    });
  });
});

io.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
