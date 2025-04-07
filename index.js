const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

// Middleware setup
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb' }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: 'https://her-haven-xi.vercel.app', 
    credentials: true,
  })
);

// Image upload
const uploadImage = require('./src/utils/uploadImage');

// All routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.route');
const reviewRoutes = require('./src/reviews/reviews.router');
const orderRoutes = require('./src/orders/orders.route');
const statsRoutes = require('./src/stats/stats.route');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);

// MongoDB connection
main()
  .then(() => console.log('MongoDB is successfully connected.'))
  .catch((err) => console.log('MongoDB connection error:', err));

async function main() {
  await mongoose.connect(process.env.DB_URL);
  app.get('/', (req, res) => {
    res.send('HerHaven E-commerce server is running....!');
  });
}

// Image upload route
app.post('/uploadImage', (req, res) => {
  if (!req.body.image) {
    console.error('No image provided');
    return res.status(400).send({ message: 'No image provided in the request' });
  }

  console.log('Received image data:', req.body.image);  

  // Call the image upload utility
  uploadImage(req.body.image)
    .then((url) => res.send(url)) 
    .catch((err) => {
      console.error('Image upload error:', err); 
      res.status(500).send({ message: 'Failed to upload image', error: err });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
