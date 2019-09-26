function showPlyrYT(youtubeUrl, provider="youtube") {
  $("#playerContainer").show();
  $("#player").attr("src", "http://www.youtube.com/embed/" + youtubeUrl)
}

function showPlyrVideo(videoUrl) {
  $("#playerContainer").show();
  window.playerObj = new Plyr("#player");
  window.playerObj.toggleCaptions(true);
}