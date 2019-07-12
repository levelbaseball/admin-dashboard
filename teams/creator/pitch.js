var selectedCellIndex = -1; // not set yet

$("body").on("click", ".cell:not(#last)", function(e) {
  $(".selectedCell").removeClass("selectedCell");
  $(this).addClass("selectedCell");
  selectedCellIndex = $(this).index();
});

var duration;
var info;

$("body").on("click", "#pitch", function(e) {
  if (selectedCellIndex > -1 && selectedCellIndex < masterData.length) {
    info = masterData[selectedCellIndex];
    if (info.videos) {
      var videos = info.videos;
      var file;
      if (videos["Angle 2"]) {
        file = videos["Angle 2"];
        loadTimeline(1, file);
      }
      if (videos["Angle 1"]) {
        file = videos["Angle 1"];
        loadTimeline(0, file);
      }
      if (videos["Split"]) {
        file = videos["Split"];
        loadTimeline(2, file);
      }
      var src = URL.createObjectURL(file);
      $("#pitchPrev").attr("src", src);
      duration = document.getElementById("pitchPrev").duration;
    } else {
      //no videos, dont even bother showing pitch
      alert("No videos have been uploaded to this column");
      return;
    }
    var player = "Player not set";
    var type = "Type not set";
    var round = "Round not set";
    if (info.player) {
      player = info.player;
    }
    if (info.type) {
      type = info.type;
    }
    if (info.round) {
      round = "Round: " + info.round;
    }
    $("#pitch").replaceWith('<h2 id="back">Back</h2>');
    $("#send").addClass("disabled");
    $("#playerName").text(player);
    $("#type").text(type);
    $("#round").text(round);
    setStats("", "", "", "");
    $("#pitchScreen").addClass("visible");
    renderPitches(); // has to be last because pitches object can be null
  }
});

$("body").on("click", "#send", function(e) {});

$("body").on("click", "#back", function(e) {
  $("#back").replaceWith('<h2 id="pitch">Pitch</h2>');
  $("#send").removeClass("disabled");
  $("#pitchScreen").removeClass("visible");
});

function loadTimeline(index, file) {
  $(".timeline")
    .eq(index)
    .find("video")
    .each(function() {
      var video = $(this)[0];
      video.src = URL.createObjectURL(file);
      video.load();
      video.addEventListener(
        "loadeddata", //"loadedmetadata",
        function() {
          setVideoTime($(this));
        },
        false
      );
    });
}

function setVideoTime(element) {
  var video = element[0];
  var offset = element.offset().left - element.parent().offset().left;
  var percentAhead = offset / element.parent().width();
  var duration = video.duration;
  var currentTime = percentAhead * duration;
  video.currentTime = currentTime;
}

$(window).resize(function() {
  $(".timeline video").each(function() {
    setVideoTime($(this));
  });
});

$("#timelineWrapper").mousemove(function(e) {
  var mouseX = e.originalEvent.pageX;
  var video = $("#pitchPrev")[0];
  var duration = video.duration;
  var currentTime = (mouseX / $(".timeline").width()) * duration;
  // console.log(currentTime);
  video.currentTime = currentTime;
  $("#playHead").css("transform", "translateX(" + (mouseX + 0) + "px)");
});

var pitchStarted = false;
var clickedHeadPercent;

$("#timelineWrapper").click(function(e) {
  var mouseX = e.originalEvent.pageX;
  clickedHeadPercent = ((mouseX + 0) / $(this).width()) * 100;
  if (!clickedOnPitch(clickedHeadPercent)) {
    $("#clickedHead").css("left", clickedHeadPercent + "%");
    $("#deletePitch").addClass("disabled");
    $(".pitch").removeClass("selectedCell");
    $("#stats").addClass("disabled");
    setStats("", "", "", "");
    if (pitchStarted) {
      $("#markEnd").removeClass("disabled");
      $("#markStart").addClass("disabled");
    } else {
      $("#markEnd").addClass("disabled");
      $("#markStart").removeClass("disabled");
    }
  } else {
    $("#markEnd").addClass("disabled");
    $("#markStart").addClass("disabled");
  }
});

function clickedOnPitch(percent) {
  if (masterData[selectedCellIndex].pitches) {
    for (var pitch of masterData[selectedCellIndex].pitches) {
      if (percent >= pitch.startPercent && percent <= pitch.endPercent) {
        return true;
      }
    }
    return false;
  }
  return false;
}

var clickedStartPercent;
$("#markStart").click(function() {
  pitchStarted = !pitchStarted;
  $("#markStart").addClass("disabled");
  $("#markEnd").addClass("disabled");
  clickedStartPercent = clickedHeadPercent;
  $("#timelineWrapper").append("<div id='startMarker'></div>");
  $("#startMarker").css("left", clickedStartPercent + "%");
});

$("#markEnd").click(function() {
  pitchStarted = !pitchStarted;
  $("#markStart").addClass("disabled");
  $("#markEnd").addClass("disabled");
  var duration = $("#pitchPrev")[0].duration;
  var obj = {
    start: (clickedStartPercent * duration) / 100,
    end: (clickedHeadPercent * duration) / 100,
    startPercent: clickedStartPercent,
    endPercent: clickedHeadPercent
  };
  if (masterData[selectedCellIndex].pitches) {
    masterData[selectedCellIndex].pitches.push(obj);
  } else {
    masterData[selectedCellIndex].pitches = [obj];
  }
  $("#startMarker").remove();
  renderPitches();
});

function renderPitches() {
  $(".pitch").remove();
  var pitches = masterData[selectedCellIndex].pitches.sort(function(a, b) {
    return b.start - a.start;
  });
  console.log(pitches);
  //must sort array to add elements in correct indexes
  for (var pitch of pitches) {
    $("#timelineWrapper").append("<div class='pitch'></div>");
    console.log("pitch element made");
    $(".pitch:last-child").css({
      left: pitch.startPercent + "%",
      right: 100 - pitch.endPercent + "%"
    });
  }
}

var pitchIndex;

$("body").on("click", ".pitch", function() {
  $(".pitch").removeClass("selectedCell");
  $(this).addClass("selectedCell");
  $("#deletePitch").removeClass("disabled");
  $("#stats").removeClass("disabled");
  pitchIndex = $(this).index(".pitch");
  var pitch = masterData[selectedCellIndex].pitches[pitchIndex];
  console.log(pitch);
  setStats(pitch.mph, pitch.ev, pitch.la, pitch.dist);
});

$("body").on("input", ".stat input", function(e) {
  var statText = $(this)
    .siblings("h4")
    .text();
  var stat = statText.substring(0, statText.length - 1).toLowerCase();
  var val = $(this).val();
  console.log(stat, val);
  masterData[selectedCellIndex].pitches[pitchIndex][stat] = val;
});

$("#deletePitch").click(function() {
  masterData[selectedCellIndex].pitches.splice(pitchIndex, 1);
  renderPitches();
  setStats("", "", "", "");
  $(this).addClass("disabled");
  $("#stats").addClass("disabled");
});

function setStats(mph, ev, la, dist) {
  $("#mphInput").val(mph);
  $("#evInput").val(ev);
  $("#laInput").val(la);
  $("#distInput").val(dist);
}
