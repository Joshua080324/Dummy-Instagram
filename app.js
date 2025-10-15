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
app.use(express.static('public'));

// Router
app.use("/", routes);


// Error handler
app.use(handleError);

// +++ Logika koneksi Socket.IO +++
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on('send_message', (messageData) => {
    io.to(`chat_${messageData.chatId}`).emit('new_message', messageData); //comment untuk npx jest
  });

  socket.on('user_typing', (typingData) => {
    io.to(`chat_${typingData.chatId}`).emit('typing_status', typingData); //comment untuk npx jest
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id); //comment untuk npx jest
  });
});

if (process.env.NODE_ENV !== 'test') { //comment untuk npx jest
  server.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`);
  });
}

module.exports = app;