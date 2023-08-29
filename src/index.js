require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./db/');

const server = http.createServer(app);

const port = process.env.PORT || 4000;

const main = async () => {
  try {
    await connectDB();

    server.listen(port, () => {
      console.log('App is listining on port 4000');
    });
  } catch (e) {
    console.log('Database Connection Failed');
    console.log('Message:', e.message);
  }
};

main();
