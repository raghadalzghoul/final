const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect('mongodb://localhost/weatherApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  preferences: Object,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

const cache = {};


const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.use(authenticateToken);

app.use((req, res, next) => {
  const key = req.url;
  if (cache[key]) {
    res.json(cache[key]);
  } else {
    res.sendResponse = res.json;
    res.json = (body) => {
      cache[key] = body;
      res.sendResponse(body);
    };
    next();
  }
});


app.get('/api/weather', async (req, res) => {
  try {
    const { email, city } = req.query;

    const apiKey = '158664692b515ec6838cae62ce079fee';
    const apiResponse = await axios.get(
     ' https://api.openweathermap.org/data/2.5/weather?q=${element[0].value}&units=Metric&appid=0b98c70fbd867783c1d657da6d8a297f=${api_key}'
    );

    
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { preferences: { city } } },
      { upsert: true, new: true }
    );

    res.json(apiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email });

    if (user) {
      res.json(user.preferences);
    } else {
      res.json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ email: user.email }, 'secret');
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log('Server is running on port ${PORT}');
});