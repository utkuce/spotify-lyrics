var currentSongSource = document.getElementById('current-song-template').innerHTML;
var currentSongTemplate = Handlebars.compile(currentSongSource);
var currentSongPlaceholder = document.getElementById('current-song');

if (localStorage["refresh_token"]) {

  console.log("found spotify refresh token");
  refresh_token = localStorage["refresh_token"];

  refreshAccessToken();

} else {

  var params = getHashParams();

  var access_token = params.access_token;
  var refresh_token = params.refresh_token;
  var error = params.error;

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {

      loggedInView();

    } else {

      // render initial screen
      $('#login').show();
      $('#loggedin').hide();

    }
  }
}

var interval;
function loggedInView() {

  window.location.hash = "loggedin";
  localStorage["refresh_token"] = refresh_token;

  $('#login').hide();
  $('#loggedin').show();

  console.log("Access token:", access_token, "Refresh token:", refresh_token)
  getCurrentSong();
  
  clearInterval(interval);
  interval = setInterval(function(){ getCurrentSong(); }, 5000);
  document.addEventListener("visibilitychange", function() {
    getCurrentSong();
    if (document.visibilityState === 'visible') {
      clearInterval(interval);
      interval = setInterval(function(){ getCurrentSong(); }, 5000);
    } else {
      clearInterval(interval);
    }
  });
}

var wasPlaying = false;
function getCurrentSong() {

  $.ajax({
    url: 'https://api.spotify.com/v1/me/player',
    headers: { 'Authorization': 'Bearer ' + access_token },
    success: function (response) {

      //console.log(response);

      if (response && response.is_playing) {

        wasPlaying = true;
        currentSongPlaceholder.innerHTML = currentSongTemplate(response);
        setLyrics(response);

      } else {

        if (wasPlaying) return;
        
        document.getElementById("lyrics").innerHTML = "";
        currentSongPlaceholder.innerHTML = 
          '<h1>' + 
            'Spotify is currently not playing a song ' + 
            '<button onclick=loggedInView() class="btn btn-default" title="Refresh (r)">' + 
              '<i class="fas fa-sync"></i>'+
            '</button>' + 
          '</h1>'
      }
    }, 
    error: function(XMLHttpRequest, textStatus, errorThrown) { 
      if (errorThrown === "Unauthorized") {

        refreshAccessToken();
      }
  } 
  });
}

var lastSearch = "";
function setLyrics(spotifyPlayer) {

  var songName = spotifyPlayer.item.name.split(" - ")[0];
  var artistName = spotifyPlayer.item.artists[0].name;
  var search = songName + " - " + artistName;

  if (lastSearch === search) return;

  var lyricsDiv = document.getElementById("lyrics");
  lyricsDiv.innerHTML = '<h3>Loading lyrics...</h3>';

  console.log("Getting lyrics for " + search);

  $.ajax({
    url: 'https://spotify-lyrics.utkuce.workers.dev/get_lyrics_embed',
    data: { q: search },
    success: function (response) {
      if (lyricsDiv.hasChildNodes())
        lyricsDiv.innerHTML = "";
      postscribe('#lyrics', response);
    }
  });

  lastSearch = search;
}

/**
* Obtains parameters from the hash of the URL
* @return Object
*/
function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

function refreshAccessToken() {

  console.log("Refreshing access token with refresh token: " + refresh_token);

  $.ajax({
    url: 'https://spotify-lyrics.utkuce.workers.dev/refresh_token',
    data: {'refresh_token': refresh_token },
  }).done(function(data) {
    console.log("refreshin access token is done");
    access_token = data.access_token;
    console.log("Data: " + data);
    loggedInView();
  }).fail(function (jqXHR, textStatus) {
    console.log(textStatus);
});;
}

document.onkeyup = function(e) {
  if (e.which == 82) { // refresh when r key is pressed
    loggedInView();
  } 
};