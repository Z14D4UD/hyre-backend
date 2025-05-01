/* eslint-disable no-console */
const express  = require('express');
const cors     = require('cors');
const session  = require('express-session');
const passport = require('passport');
const path     = require('path');
const fs       = require('fs');                    // ← NEW
require('dotenv').config();
const http      = require('http');
const { Server } = require('socket.io');
const connectDB  = require('./config/db');

/* ── route bundles ── */
const authRoutes          = require('./routes/authRoutes');
const bookingRoutes       = require('./routes/bookingRoutes');
const invoiceRoutes       = require('./routes/invoiceRoutes');
const chatRoutes          = require('./routes/chatRoutes');
const customerRoutes      = require('./routes/customerRoutes');
const carRoutes           = require('./routes/carRoutes');
const businessRoutes      = require('./routes/businessRoutes');
const listingRoutes       = require('./routes/listingRoutes');        // CRUD (auth)
const publicListingRoutes = require('./routes/publicListingRoutes');  // read-only
const paymentRoutes       = require('./routes/paymentRoutes');
const affiliateRoutes     = require('./routes/affiliateRoutes');
const accountRoutes       = require('./routes/accountRoutes');
const supportRoutes       = require('./routes/supportRoutes');
const reviewRoutes        = require('./routes/reviewRoutes');
const withdrawalRoutes    = require('./routes/withdrawalRoutes');
const connectBankRoutes   = require('./routes/connectBankRoutes');
const remindersRoutes     = require('./routes/remindersRoutes');
const adminRoutes         = require('./routes/adminRoutes');

const app    = express();
const server = http.createServer(app);

/* ───────────── 1. DB ───────────── */
connectDB();

/* ───────────── 2. CORS ──────────── */
const allowedOrigins = ['http://localhost:3000', 'https://hyreuk.com'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.options('*', cors({ origin: allowedOrigins, credentials: true }));

/* ───────────── 3. body parsers ──── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ───────────── 4. static uploads ─ */

/**
 * We store uploads on Render’s persistent disk.
 *   Disk mount path ………………  /data
 *   Our sub-folder   …………  /data/uploads
 *
 * Make sure the directory exists every time the container boots.
 */
const diskUploads = '/data/uploads';
if (!fs.existsSync(diskUploads)) {
  fs.mkdirSync(diskUploads, { recursive: true });
}

app.use('/uploads',     express.static(diskUploads));  // public
app.use('/api/uploads', express.static(diskUploads));  // legacy URLs

/* ───────────── 5. session / passport ─ */
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secretKey',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

/* ───────────── 6. API routes ────── */
app.use('/api/auth',          authRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/invoices',      invoiceRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/customer',      customerRoutes);
app.use('/api/cars',          carRoutes);
app.use('/api/business',      businessRoutes);        // generic business ops
app.use('/api/business',      listingRoutes);         // /api/business/listings…
app.use('/api/listings',      publicListingRoutes);   // public read-only
app.use('/api/payment',       paymentRoutes);
app.use('/api/affiliate',     affiliateRoutes);
app.use('/api/account',       accountRoutes);
app.use('/api/support',       supportRoutes);
app.use('/api',               reviewRoutes);          // reviews keep historic paths
app.use('/api/withdrawals',   withdrawalRoutes);
app.use('/api/connect-bank',  connectBankRoutes);
app.use('/api/reminders',     remindersRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/admin',         adminRoutes);

/* ───────────── 7. socket.io ─────── */
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true },
});
io.on('connection', (socket) => {
  socket.on('joinRoom', (room) => socket.join(room));
  socket.on('sendMessage', (data) => io.to(data.room).emit('receiveMessage', data));
});

/* ───────────── 8. start ─────────── */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`► API up on :${PORT}`));
