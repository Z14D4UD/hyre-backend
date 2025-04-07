// server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const chatRoutes = require('./routes/chatRoutes');
const customerRoutes = require('./routes/customerRoutes');
const carRoutes = require('./routes/carRoutes');
const businessRoutes = require('./routes/businessRoutes');  // Only declare once
const paymentRoutes = require('./routes/paymentRoutes');
const affiliateRoutes = require('./routes/affiliateRoutes');
const accountRoutes = require('./routes/accountRoutes');
const supportRoutes = require('./routes/supportRoutes');
const reviewRoutes = require ('./routes/reviewRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const connectBankRoutes = require('./routes/connectBankRoutes');



const app = express();
const server = http.createServer(app);

connectDB();

const allowedOrigins = [
  'http://localhost:3000',
  'https://hyreuk.com',
];

app.use(express.json());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secretKey',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/support', supportRoutes);
app.use('/api', reviewRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/connect-bank', connectBankRoutes);



const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });
  socket.on('sendMessage', (data) => {
    io.to(data.room).emit('receiveMessage', data);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
