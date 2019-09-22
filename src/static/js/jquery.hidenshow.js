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