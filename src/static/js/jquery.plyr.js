function showPlyrYT() {
  $("#playerContainer").show();
}

function showPlyrVideo(videoUrl) {
  $("#playerContainer").show();
  window.playerObj = new Plyr("#player");
  window.playerObj.toggleCaptions(true);
}