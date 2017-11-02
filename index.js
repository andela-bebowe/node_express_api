import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from './src/app/routes/router';

// Set up express app
const app = express();
const env = process.env.NODE_ENV || 'development';

const PORT = process.env.PORT || 3000;

if (env !== 'production') {
  dotenv.config();

  // Log requests to console
  app.use(logger('dev'));
}

// Parsing incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // Uses native querystring node library

// Routing
app.get('/', (req, res) => {
  res.send('Welcome to our API!');
});

app.use('/api/v1', router);

app.listen(PORT, () => { console.info(`Listening on port ${PORT}`); });

export default app;
