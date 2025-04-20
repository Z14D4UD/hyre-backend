/* eslint-disable no-console */
const express  = require('express');
const cors     = require('cors');
const session  = require('express-session');
const passport = require('passport');
const path     = require('path');
require('dotenv').config();
const http     = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

/* ───── routes ───── */
const authRoutes        = require('./routes/authRoutes');
const bookingRoutes     = require('./routes/bookingRoutes');
const invoiceRoutes     = require('./routes/invoiceRoutes');
const chatRoutes        = require('./routes/chatRoutes');
const customerRoutes    = require('./routes/customerRoutes');
const carRoutes         = require('./routes/carRoutes');
const businessRoutes    = require('./routes/businessRoutes');
const privateListings   = require('./routes/listingRoutes');       // auth CRUD
const publicListings    = require('./routes/publicListingRoutes'); // read‑only
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

/* 1 ─ db */        connectDB();

/* 2 ─ cors */
const allowed = ['http://localhost:3000', 'https://hyreuk.com'];
app.use(cors({ origin: allowed, credentials: true }));
app.options('*', cors({ origin: allowed, credentials: true }));

/* 3 ─ body */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 4 ─ static uploads */
app.use('/uploads',     express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

/* 5 ─ session / passport */
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretKey',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

/* 6 ─ routes */
app.use('/api/auth',          authRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/invoices',      invoiceRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/customer',      customerRoutes);
app.use('/api/cars',          carRoutes);
app.use('/api/business',      businessRoutes);

/* listings */
app.use('/api/business/listings', privateListings); // auth‑required CRUD
app.use('/api/listings',           publicListings); // public read‑only

/* other modules */
app.use('/api/payments',      paymentRoutes);
app.use('/api/affiliate',     affiliateRoutes);
app.use('/api/account',       accountRoutes);
app.use('/api/support',       supportRoutes);
app.use('/api',               reviewRoutes);
app.use('/api/withdrawals',   withdrawalRoutes);
app.use('/api/connect-bank',  connectBankRoutes);
app.use('/api/reminders',     remindersRoutes);

/* 7 ─ socket.io */
const io = new Server(server, {
  cors: { origin: allowed, methods: ['GET','POST'], credentials: true }
});
io.on('connection', s => {
  s.on('joinRoom', room => s.join(room));
  s.on('sendMessage', data => io.to(data.room).emit('receiveMessage', data));
});

/* 8 ─ start */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`► API running on :${PORT}`));
