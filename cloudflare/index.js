import { Router } from 'itty-router'
import * as querystring from 'querystring'

// Create a new router
const router = Router();

const REDIRECT_URI = "https://spotify-lyrics.utkuce.workers.dev/callback";
const FRONTEND_URI = "https://spotify-lyrics.pages.dev/";

router.get("/login", (req) => {

  return Response.redirect(
    'https://accounts.spotify.com/authorize?' + querystring.stringify({
      response_type: 'code',
      client_id: `${SPOTIFY_CLIENT_ID}`,
      scope: 'user-read-playback-state',
      redirect_uri: REDIRECT_URI,
      state: 123
    }));

});

router.get("/callback", async ( req ) => {

  const url = "https://accounts.spotify.com/api/token";
  const params = new URLSearchParams(
    {
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: REDIRECT_URI
    }
  );

  const init = {  
    method: "POST",    
    headers: {      
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'))
    },
    body: params
  };
  
  const response = await fetch(url, init);
  const data = await response.json();
  //console.log("Response: " + JSON.stringify(data));

  if (response.status === 200) {

    var access_token = data.access_token;
    var refresh_token = data.refresh_token;

    console.log("Spotify access token: " + access_token);
    console.log("Spotify refresh token: " + refresh_token);

    // we can also pass the token to the browser to make requests from there
    return Response.redirect(FRONTEND_URI + '/#' + querystring.stringify(
      { access_token: access_token, refresh_token: refresh_token }
    ));

  } else {
    return new Response(reponse.status);
  }

});

router.get("/refresh_token", async ( req ) => {

  var refresh_token = req.query.refresh_token;

  const url = "https://accounts.spotify.com/api/token";
  const params = new URLSearchParams(
    {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }
  );

  const init = {  
    method: "POST",    
    headers: {      
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'))
    },
    body: params
  };

  const response = await fetch(url, init);
  const returnData = await response.json();
  console.log("Access token: " + returnData.access_token);

  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    ...corsHeaders
  };

  console.log(JSON.stringify(returnData));
  return new Response(JSON.stringify(returnData), { headers });

});

router.get("/get_lyrics_embed", async ( req ) => {

  

  const url = "https://api.genius.com/search?q=" + req.query.q
    + "&access_token=" + `${GENIUS_ACCESS_TOKEN}`;

  console.log(url)

  const response = await fetch(url);
  const returnData = await response.json();

  const headers = {
    "Content-Type": "text/html; charset=UTF-8",
    ...corsHeaders
  };

  if (response.status === 200) {
    var hits = returnData.response.hits;
    if (hits.length === 0) {
      return new Response("Lyrics could not be found", {headers});
    }
    else {
      const embedContent =  await getEmbeddedLyrics(hits[0].result.api_path);

      console.log(embedContent)
      return new Response(embedContent, {headers});
    }
  }
});

async function getEmbeddedLyrics(songPath) {

  const url = "https://api.genius.com" + songPath
    + "?access_token=" + `${GENIUS_ACCESS_TOKEN}`;
  const response = await fetch(url);

  if (response.status === 200)
  {
    const returnData = await response.json();
    const embedContent = returnData.response.song.embed_content;
    return embedContent;  
  }  
}

/*
This is the last route we define, it will match anything that hasn't hit a route we've defined
above, therefore it's useful as a 404 (and avoids us hitting worker exceptions, so make sure to include it!).

Visit any page that doesn't exist (e.g. /foobar) to see it in action.
*/
router.all("*", () => new Response("404, not found!", { status: 404 }));

/*
This snippet ties our worker to the router we deifned above, all incoming requests
are passed to the router where your routes are called and the response is sent.
*/
addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request));
});

const corsHeaders = {  
  "Access-Control-Allow-Origin": "*",  
  "Access-Control-Allow-Methods": "GET",  
  "Access-Control-Allow-Headers": "*"
}

