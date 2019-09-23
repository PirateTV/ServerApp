function showPlyrYT(youtubeUrl, provider="youtube") {
  var player = $("<div></div>");
  player.attr("id", "player");
  player.attr("data-plyr-embed-id", youtubeUrl);
  player.attr("data-plyr-provider", provider);

  $("#playerContainer").empty();
  //$("#player").attr("data-plyr-embed-id", youtubeUrl);
  $("#playerContainer").append(player);
  $("#playerContainer").show();
  new Plyr("#player");
}

function showPlyrVideo(videoUrl) {
  $("#playerContainer").show();
  new Plyr("#player");
}