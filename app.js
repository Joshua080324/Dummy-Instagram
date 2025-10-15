require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const handleError = require('./helpers/handleError');
const routes = require('./routes');
const cors = require('cors'); 

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", 
  }
});

app.set('socketio', io); 

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router
app.use(routes);

// Error handler
app.use(handleError);

// +++ Logika koneksi Socket.IO +++
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`User ${socket.id} joined room: chat_${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});


server.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});