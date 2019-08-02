urlParams = getUrlVars();

var momentName = decodeURIComponent(urlParams["moment"]);
var roundNum = parseInt(urlParams["round"]) - 1;
var pitchNum = parseInt(urlParams["pitch"]) - 1;

if (momentName == "undefined") {
  alert(momentName);
  window.location.replace("/login");
}

$("h3").click(function() {
  $("h3").removeClass("selectedAngle");
  $(this).addClass("selectedAngle");
  setAngleSource();
});

var data;

firebase
  .firestore()
  .collection("moments")
  .doc(momentName)
  .get()
  .then(function(doc) {
    if (!doc.exists) {
      alert("The moment '" + momentName + "' does not exist");
      return;
    }
    data = doc.data();
    showInfo();
  })
  .catch(function(error) {
    alert(error.message);
  });

function showInfo() {
  var date = data.date.toDate();
  $("h1").text(data.team + ", " + data.name);
  $("h2").text(
    data.player +
      ", " +
      data.type +
      ", " +
      (date.getMonth() + 1) +
      "/" +
      date.getDay() +
      "/" +
      date.getFullYear()
  );
  roundNum = Math.min(roundNum, data.rounds.length - 1);
  setRoundInfo();
  disableElements();
  setAngleSource();
}

function disableElements() {
  var round = data.rounds[roundNum];
  console.log(roundNum);
  var roundSelected = false;
  if (!round.angle1) {
    $("h3")
      .eq(0)
      .addClass("disabled");
    $("h3")
      .eq(0)
      .removeClass("selectedAngle");
  } else {
    $("h3")
      .eq(0)
      .removeClass("disabled");
    $("h3")
      .eq(0)
      .addClass("selectedAngle");
    roundSelected = true;
  }
  if (!round.angle2) {
    $("h3")
      .eq(1)
      .addClass("disabled");
    $("h3")
      .eq(1)
      .removeClass("selectedAngle");
  } else {
    $("h3")
      .eq(1)
      .removeClass("disabled");
    if (!roundSelected) {
      $("h3")
        .eq(1)
        .addClass("selectedAngle");
      roundSelected = true;
    }
  }
  if (!round.split) {
    $("h3")
      .eq(2)
      .addClass("disabled");
    $("h3")
      .eq(2)
      .removeClass("selectedAngle");
  } else {
    $("h3")
      .eq(2)
      .removeClass("disabled");
    if (!roundSelected) {
      $("h3")
        .eq(2)
        .addClass("selectedAngle");
      roundSelected = true;
    }
  }
  if (roundNum == 0) {
    $("#backRound").addClass("disabled");
  } else {
    $("#backRound").removeClass("disabled");
  }
  if (roundNum == data.rounds.length - 1) {
    $("#forwardRound").addClass("disabled");
  } else {
    $("#forwardRound").removeClass("disabled");
  }
  if (data.rounds[roundNum].pitches) {
    if (pitchNum == 0) {
      $("#backPitch").addClass("disabled");
    } else {
      $("#backPitch").removeClass("disabled");
    }
    if (pitchNum == data.rounds[roundNum].pitches.length - 1) {
      $("#forwardPitch").addClass("disabled");
    } else {
      $("#forwardPitch").removeClass("disabled");
    }
  } else {
    $(".switcher")
      .eq(1)
      .find("h4")
      .text("No Pitches");
    $(".switcher")
      .eq(1)
      .addClass("disabled");
  }
}

var startTime;
var endTime;

var roundHasPitches = false;

function setAngleSource() {
  var angleText = $(".selectedAngle").text();
  var angle = angleText.toLowerCase().replace(" ", "");
  $("#download").text("Download Round " + (roundNum + 1) + " " + angleText);
  storageRef = firebase.storage().ref(data.rounds[roundNum][angle]);
  storageRef
    .getDownloadURL()
    .then(function(downloadUrl) {
      var videoPlayer = $("video")[0];
      var currentTime = 0;
      videoPlayer.src = downloadUrl; /*+ "#t=10.123,15.123";*/
      if (data.rounds[roundNum].pitches) {
        var pitch = data.rounds[roundNum].pitches[pitchNum];
        videoPlayer.addEventListener(
          "loadedmetadata",
          function() {
            videoPlayer.currentTime = startTime;
          },
          false
        );
      }
    })
    .catch(function(error) {
      alert(error.message);
    });
}

function setRoundInfo() {
  if (data.rounds[roundNum].notes) {
    $("h6").text(data.rounds[roundNum].notes);
    $("h6").css("display", "block");
  } else {
    $("h6").css("display", "none");
  }
  if (data.rounds[roundNum].pitches) {
    var pitch = data.rounds[roundNum].pitches[pitchNum];
    startTime = pitch.start;
    endTime = pitch.end;
    roundHasPitches = true;
    $(".switcher")
      .eq(1)
      .find("h4")
      .text("Pitch: " + (pitchNum + 1));
    $("#stats").empty();
    for (var stat of Object.keys(pitch.stats)) {
      $("#stats").append(
        "<h5>" +
          formatStat(stat) +
          "<br><span>" +
          pitch.stats[stat] +
          "</span></h5>"
      );
    }
  } else {
    roundHasPitches = false;
  }
  $(".switcher")
    .eq(0)
    .find("h4")
    .text("Round: " + (roundNum + 1));
}

$("video")[0].addEventListener(
  "timeupdate",
  function() {
    if (
      roundHasPitches &&
      ($("video")[0].currentTime > endTime ||
        $("video")[0].currentTime < startTime - 0.1) // to prevent from being stuck at startTime
    ) {
      $("video")[0].currentTime = startTime;
      $("video")[0].play();
    }
  },
  false
);

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
}

function formatStat(stat) {
  stat = stat.toUpperCase();
  if (stat.length == 3 && stat.charAt(1) == "T") {
    stat = stat.charAt(0) + "t" + stat.charAt(2);
  }
  return stat;
}

$("#pausePlay").click(function() {
  if ($("video")[0].paused) {
    $("video")[0].play();
  } else {
    $("video")[0].pause();
  }
});

$("#backFrame").click(function() {
  $("video")[0].currentTime -= 0.03; // one frame at 30 fps
});

$("#forwardFrame").click(function() {
  $("video")[0].currentTime += 0.03;
});

$("#download").click(function() {
  var angle = $(".selectedAngle")
    .text()
    .toLowerCase()
    .replace(" ", "");
  storageRef = firebase.storage().ref(data.rounds[roundNum][angle]);
  storageRef
    .getDownloadURL()
    .then(function(url) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = "blob";
      xhr.onload = function(event) {
        var blob = xhr.response;
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        objUrl = window.URL.createObjectURL(blob);
        a.href = objUrl;
        (a.download = "download"),
          data.name +
            "," +
            data.player +
            "," +
            "round" +
            (roundNum + 1) +
            angle;
        a.click();
        window.URL.revokeObjectURL(objUrl);
      };
      xhr.open("GET", url);
      xhr.send();
    })
    .catch(function(error) {
      alert(error.message);
    });
});
