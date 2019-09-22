function hideShow(idElem){
  $('#'+idElem).is(":visible") ? $('#'+idElem).hide() : $('#'+idElem).show();
}

function hideShowMenu(){
  if($("#mainMenu").hasClass("hidden")) {
    $("#mainMenu").removeClass("hidden").addClass("visible");
  }
  else {
    $("#mainMenu").removeClass("visible").addClass("hidden");
   }
}


function showPlyrYT(youtubeUrl) {
  var player = $("<div></div>");
  player.attr("id", "player");
  player.attr("data-plyr-embed-id", youtubeUrl);
  player.attr("data-plyr-provider", "youtube");

  $("#playerContainer").empty();
  //$("#player").attr("data-plyr-embed-id", youtubeUrl);
  $("#playerContainer").append(player);
  $("#playerContainer").show();
  new Plyr("#player");
}