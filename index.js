const bodyParser = require('body-parser');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// In-memory URL storage
let urlDatabase = {};

function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  // Validate the URL format
  if (!isValidUrl(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Extract the hostname for DNS lookup
  const hostname = new URL(url).hostname;
  
  // Check DNS validity
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Generate a short URL identifier
    const shortUrl = Math.floor(Math.random() * 100000).toString();

    // Store the URL
    urlDatabase[shortUrl] = url;

    // Respond with the short URL
    res.json({
      original_url: url,
      short_url: shortUrl
    });
  });
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = req.params.shorturl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});
