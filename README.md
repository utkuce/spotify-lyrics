# spotify-lyrics

Display lyrics for the currently playing song on the connected spotify account

## Installation

### Setup firebase
- Create a new project on https://console.firebase.google.com/
- Install firebase tools with `npm install -g firebase-tools`
- Login with `firebase login`
- Replace the default project id with yours in `.firebaserc`

### Configure
- Creat an application on [Spotify for Developers Dashboard](https://beta.developer.spotify.com/dashboard) 
and add http://localhost:5000/callback as a redirect uri in the app settings
- Create an environment variables file `.env` in the `functions/` directory and fill the values
```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=
GENIUS_ACCESS_TOKEN=
```
- Run the app with `npm run serve`
- Open http://localhost:5000 on your browser

## Deploy

- Replace the redirect uri in the `.env` file with `https://<your-project-id>.web.app`
- Add `https://<your-project-id>.web.app/callback` as a redirect uri on the [Spotify for Developers Dashboard](https://beta.developer.spotify.com/dashboard)
- `firebase deploy` (Note that google requires the project to be at least on the blaze plan to be able to deploy functions)
