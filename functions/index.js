const functions = require('firebase-functions');

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');

require('dotenv').config()

var client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
var redirect_uri = process.env.SPOTIFY_REDIRECT_URI; // Your redirect uri

var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/login', function(req, res) {

  // your application requests authorization
  var scope = 'user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: 123
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
   
    if (!error && response.statusCode === 200) {

      var access_token = body.access_token;
      var refresh_token = body.refresh_token;

      // we can also pass the token to the browser to make requests from there
      res.redirect('/#' + querystring.stringify(
        { access_token: access_token, refresh_token: refresh_token }
      ));

    } else {
      res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
    }
  });

});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: { grant_type: 'refresh_token', refresh_token: refresh_token },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({ 'access_token': access_token });
    }
  });

});

app.get('/get_lyrics_embed', function (req, res) {

  // requesting access token from refresh token
  var search = req.query.q;
  var options = {
    url: 'https://api.genius.com/search',
    qs: { q: search, access_token: process.env.GENIUS_ACCESS_TOKEN},
  };

  request.get(options, function (error, response, body) {
  
    if (error) { console.log(error); return; }
    console.log("Get response: " + response.statusCode);
    var jsonBody = JSON.parse(body);

    if (!error && response.statusCode === 200) {
      var hits = jsonBody.response.hits;
      if (hits.length === 0) {
        res.send("Lyrics could not be found")
      }
      else {
        getEmbeddedLyrics(hits[0].result.api_path, res)
      }
    }

  });
});

function getEmbeddedLyrics(songPath, res) {
  var options = {
    url: 'https://api.genius.com' + songPath,
    qs: { access_token: process.env.GENIUS_ACCESS_TOKEN},
  };

  request.get(options, function (error, response, body) {
  
    if (error) { console.log(error); return; }
    console.log("Get response: " + response.statusCode);
    //console.log(body);

    var jsonBody = JSON.parse(body);

    if (!error && response.statusCode === 200) {
      const embedContent = jsonBody.response.song.embed_content;
      res.send(embedContent);
    }

  });
}

exports.app = functions.https.onRequest(app);