const fs = require('fs');
const path = require('path');
if (fs.existsSync(path.join(__dirname, '.env')) && process.loadEnvFile) process.loadEnvFile(path.join(__dirname, '.env'));

const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');

const app = express();
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      frameSrc: ['https://www.facebook.com'],
      formAction: ["'self'"],
      objectSrc: ["'none'"]
    }
  }
}));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(session({
  name: 'mc.sid',
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: 'auto', maxAge: 1000 * 60 * 60 * 8 }
}));

app.use(require('./routes/public'));
app.use(require('./routes/admin'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d', extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`McCauley Stoneworks site running on http://localhost:${port}`));
