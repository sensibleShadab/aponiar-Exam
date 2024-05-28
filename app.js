const path = require('path');
const express = require('express');
const morgan = require('morgan');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./router/userRoutes');
const testRoutes = require('./router/testRoutes');
const submitRoutes = require('./router/submitRoutes');

const app = express();

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'public'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 20 * 1000,
  message:
    'Too many requests from this IP address, Please try again after 20 minutes!',
});
app.use('/api', limiter);

//Middleware
app.use(cookieParser('secret'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'public/assets')));
app.use(express.static ('public'))

// app.get('(/*)?', async (req, res, next) => {
//   res.sendFile(path.join((path.join(__dirname, 'public')), 'index.html'));
// });
// app.use((req, res, next) => {
//   if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
//       next();
//   } else {
//       res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//       res.header('Expires', '-1');
//       res.header('Pragma', 'no-cache');
//       res.sendFile(path.join(__dirname, 'public', 'index.html'));
//   }
// });

//Cors
app.use(cors({ credentials: true, origin: true, withCredentials: true }));

app.use('/api/user', userRoutes);
app.use('/api/test', testRoutes);
app.use('/api/submit', submitRoutes);

// Error Handling
app.get('(/*)?', async (req, res, next) => {
  res.sendFile(path.join((path.join(__dirname, 'public')), 'index.html'));
});
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
