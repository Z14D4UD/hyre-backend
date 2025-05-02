// server.js
/* eslint-disable no-console */
const express   = require('express');
const cors      = require('cors');
const session   = require('express-session');
const passport  = require('passport');
const path      = require('path');
const fs        = require('fs');
require('dotenv').config();
const http      = require('http');
const { Server }= require('socket.io');
const connectDB = require('./config/db');

const app    = express();
const server = http.createServer(app);

// 1) DATABASE
connectDB();

// 2) CORS
const allowedOrigins = ['http://localhost:3000','https://hyreuk.com'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.options('*', cors({ origin: allowedOrigins, credentials: true }));

// 3) BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4) STATIC UPLOADS
// Use a local folder at project-root/server/uploads
const uploadsDir = path.join(__dirname, 'uploads');
// ensure it exists (read/write permissions)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// serve files:
app.use('/uploads',     express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir));

// 5) SESSIONS & PASSPORT
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretKey',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// 6) ROUTES
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/bookings',      require('./routes/bookingRoutes'));
app.use('/api/invoices',      require('./routes/invoiceRoutes'));
app.use('/api/chat',          require('./routes/chatRoutes'));
app.use('/api/customer',      require('./routes/customerRoutes'));
app.use('/api/cars',          require('./routes/carRoutes'));
app.use('/api/business',      require('./routes/businessRoutes'));
app.use('/api/business',      require('./routes/listingRoutes'));
app.use('/api/listings',      require('./routes/publicListingRoutes'));
app.use('/api/payment',       require('./routes/paymentRoutes'));
app.use('/api/affiliate',     require('./routes/affiliateRoutes'));
app.use('/api/account',       require('./routes/accountRoutes'));
app.use('/api/support',       require('./routes/supportRoutes'));
app.use('/api/withdrawals',   require('./routes/withdrawalRoutes'));
app.use('/api/connect-bank',  require('./routes/connectBankRoutes'));
app.use('/api/reminders',     require('./routes/remindersRoutes'));
app.use('/api/reviews',       require('./routes/reviewRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));

// 7) SOCKET.IO
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET','POST','PUT','DELETE'], credentials: true }
});
io.on('connection', socket => {
  socket.on('joinRoom', room => socket.join(room));
  socket.on('sendMessage', data => io.to(data.room).emit('receiveMessage', data));
});

// 8) START
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`► API up on :${PORT}`));
