var selectedCellIndex = -1; // not set yet

$("body").on("click", ".cell:not(#last)", function(e) {
  $(".selectedCell").removeClass("selectedCell");
  $(this).addClass("selectedCell");
  selectedCellIndex = $(this).index();
});

$("body").on("click", "#pitch", function(e) {
  if (selectedCellIndex > -1) {
    console.log("go to pitch screen");
    $("#pitchScreen").addClass("visible");
    $("#pitch").replaceWith('<h2 id="back">Back</h2>');
    $("#send").replaceWith('<h2 id="save">Save</h2>');
  }
});

$("body").on("click", "#send", function(e) {});

$("body").on("click", "#back", function(e) {
  $("#back").replaceWith('<h2 id="pitch">Pitch</h2>');
  $("#save").replaceWith('<h2 id="send">Send</h2>');
  $("#pitchScreen").removeClass("visible");
});
