import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import routes from './app/routes/index_routes.js';

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
app.use(bodyParser.urlencoded({ extended: false }));

// Routing
let router = express.Router();
router.get('/lists', (req, res) => {
  res.json({'lists': ['its hers']})
});

app.use('/api/v1', router);

app.listen(PORT, () => {console.log(`Listening on port ${PORT}`);});

export default app;
