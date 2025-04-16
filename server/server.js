// server/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes        = require('./routes/authRoutes');
const bookingRoutes     = require('./routes/bookingRoutes');
const invoiceRoutes     = require('./routes/invoiceRoutes');
const chatRoutes        = require('./routes/chatRoutes');
const customerRoutes    = require('./routes/customerRoutes');
const carRoutes         = require('./routes/carRoutes');
const businessRoutes    = require('./routes/businessRoutes');
const paymentRoutes     = require('./routes/paymentRoutes');
const affiliateRoutes   = require('./routes/affiliateRoutes');
const accountRoutes     = require('./routes/accountRoutes');
const supportRoutes     = require('./routes/supportRoutes');
const reviewRoutes      = require('./routes/reviewRoutes');
const withdrawalRoutes  = require('./routes/withdrawalRoutes');
const connectBankRoutes = require('./routes/connectBankRoutes');
const remindersRoutes   = require('./routes/remindersRoutes');

const app    = express();
const server = http.createServer(app);

// 1) Connect to Mongo
connectDB();

// 2) CORS setup (incl. pre‑flight)
const allowedOrigins = [
  'http://localhost:3000',
  'https://hyreuk.com',
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
// enable pre‑flight on all routes
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));

// 3) Body parsers
app.use(express.json());                     // <— was commented out before
app.use(express.urlencoded({ extended: true }));

// 4) Serve uploaded images
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// 5) Sessions + Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretKey',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// 6) Mount your API routes
app.use('/api/auth',        authRoutes);
app.use('/api/bookings',    bookingRoutes);
app.use('/api/invoices',    invoiceRoutes);
app.use('/api/chat',        chatRoutes);
app.use('/api/customer',    customerRoutes);
app.use('/api/cars',        carRoutes);
app.use('/api/business',    businessRoutes);
app.use('/api/payments',    paymentRoutes);
app.use('/api/affiliate',   affiliateRoutes);
app.use('/api/account',     accountRoutes);
app.use('/api/support',     supportRoutes);
app.use('/api',             reviewRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/connect-bank',connectBankRoutes);
app.use('/api/reminders',   remindersRoutes);

// 7) Socket.IO (unchanged)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
  }
});
io.on('connection', socket => {
  console.log('New client connected:', socket.id);
  socket.on('joinRoom', room => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined ${room}`);
  });
  socket.on('sendMessage', data => {
    io.to(data.room).emit('receiveMessage', data);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 8) Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
