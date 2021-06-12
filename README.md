# spotify-lyrics

Display lyrics for the currently playing song on the connected spotify account

## Demo
https://spotify-lyrics.pages.dev/

## Installation

### Setup cloudflare
- Install wrangler with `npm i @cloudflare/wrangler -g`
- Login to cloudflare with `wrangler login`
- Enter cloudflare account id in `wrangler.toml`

### Configure
- Creat an application on [Spotify for Developers Dashboard](https://beta.developer.spotify.com/dashboard) 
and add `https://<your-project-id>.<cloudflare-username>.workers.dev/callback` as a redirect uri in the app settings
- Get the your application's client_id and client_secret from your spotify developer dashboard and set them for cloudflare using
```
wrangler secret put SPOTIFY_CLIENT_ID <client_id>
wrangler secret put SPOTIFY_CLIENT_SECRET <client_secret>
```
- Get your Genius access token from [Genius](https://genius.com/developers) and add it to the cloudflare secrets
```
wrangler secret put GENIUS_ACCESS_TOKEN <access_token>
```

- Set REDIRECT_URI in `cloudflare/index.js` to `https://<your-project-id>.<cloudflare-username>.workers.dev` 
    - or `http://localhost:8787` for local testing

- Set FRONTEND_URI in `cloudflare/index.js` to the static host of the public folder


- A local copy of the api backend can be run with `wrangler dev` on http://localhost:8787

## Deploy

- Set up static hosting for the `public/` folder 
- Deploy the backend to cloudflare with `wrangler publish`
