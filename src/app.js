require('dotenv').config();
const express = require('express');
const applyMiddleware = require('./middleware');
const routes = require('./routes');

// express aspp
const app = express();
applyMiddleware(app);
app.use(routes);

app.get('/health', (req, res) => {
  res.json({
    helth: 'OK',
    user: req.user,
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Home Route' });
});

app.use((err, req, res, next) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

module.exports = app;
