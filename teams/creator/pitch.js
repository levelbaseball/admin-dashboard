var selectedCellIndex = -1; // not set yet

$("body").on("click", ".cell:not(#last)", function(e) {
  $(".selectedCell").removeClass("selectedCell");
  $(this).addClass("selectedCell");
  selectedCellIndex = $(this).index();
});

$("body").on("click", "#pitch", function(e) {
  if (selectedCellIndex > -1) {
    $("#pitch").replaceWith('<h2 id="back">Back</h2>');
    $("#send").replaceWith('<h2 id="save">Save</h2>');
    var player = "Player not set";
    var type = "Type not set";
    var round = "Round not set";
    if (selectedCellIndex < masterData.length) {
      // to avoid getting undefined when going straight for masterData[selectedCellIndex].key
      var info = masterData[selectedCellIndex];
      if (info.player) {
        player = info.player;
      }
      if (info.type) {
        type = info.type;
      }
      if (info.round) {
        round = "Round: " + info.round;
      }
      if (info.videos) {
        var videos = info.videos;
        var file;
        if (videos["Split"]) {
          file = videos["Split"];
        } else if (videos["Angle 1"]) {
          file = videos["Angle 1"];
        } else if (videos["Angle 2"]) {
          file = videos["Angle 2"];
        }
        var src = URL.createObjectURL(file);
        $("#pitchPrev").attr("src", src); //setting src on video tag just works, lets roll with it
      }
    }
    // var player =
    //   masterData[selectedCellIndex].player == "undefined"
    //     ? "Player not set"
    //     : masterData[selectedCellIndex].player;
    // var type =
    //   masterData[selectedCellIndex].type == "undefined"
    //     ? "Type not set"
    //     : masterData[selectedCellIndex].type;
    // var round =
    //   masterData[selectedCellIndex].round == "undefined"
    //     ? "Round not set"
    //     : masterData[selectedCellIndex].round;
    $("#playerName").text(player);
    $("#type").text(type);
    $("#round").text(round);
    $("#pitchScreen").addClass("visible");
  }
});

$("body").on("click", "#send", function(e) {});

$("body").on("click", "#back", function(e) {
  $("#back").replaceWith('<h2 id="pitch">Pitch</h2>');
  $("#save").replaceWith('<h2 id="send">Send</h2>');
  $("#pitchScreen").removeClass("visible");
});
