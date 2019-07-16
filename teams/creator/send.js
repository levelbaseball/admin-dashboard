$("#send").click(async function() {
  var eventName = $("#eventName").val();
  if (eventName == "") {
    alert("Please enter an event name");
    return;
  }
  var date = $("#date").val();
  if (!date) {
    alert("Date incorrectly formatted");
    return;
  }
  var timeStamp = getTimeStamp(date);
  if (masterData.length == 0) {
    alert("Please add player data");
    return;
  }
  for (var i = 0; i < masterData.length; i++) {
    var item = masterData[i];
    if (!item.player) {
      alert("No player set in column " + (i + 1));
      return;
    }
    if (!getPlayerID(item.player)) {
      alert(item.player + " not found in list of players");
      return;
    }
    if (!item.type) {
      alert("No type set in column " + (i + 1));
      return;
    }
    if (!item.videos || !item.notes) {
      alert(
        "No notes or videos found for " + item.player + " in column " + (i + 1)
      );
    }
  }

  var coaches;
  await firebase
    .firestore()
    .collection("teams")
    .doc(teamName)
    .get()
    .then(function(doc) {
      coaches = doc.data().coaches;
      console.log(coaches);
    })
    .catch(function(error) {
      alert(error.message);
    });
  if (masterData.length > 0) {
    var docs = [];
    for (var item of masterData) {
      if (item.player) {
        var round = {};
        if (item.notes) {
          round.notes = item.notes;
        }
        if (item.pitches) {
          round.pitches = item.pitches;
        }
        if (item.videos) {
          var videos = {};
          for (var key of Object.keys(item.videos)) {
            var now = new Date();
            var video = item.videos[key];
            var route = getRoute(now);
            console.log(route);
            await firebase
              .storage()
              .ref()
              .child(route)
              .put(video)
              .then(function(snapshot) {
                console.log(snapshot);
                var newKey = key.replace(/\s+/g, "").toLowerCase();
                videos[newKey] = route;
              })
              .catch(function(error) {
                alert(error.message);
              });
          }
          round = Object.assign(round, videos);
        }
        // check if player already in event
        playerIndex = -1;
        for (var i = 0; i < docs.length; i++) {
          if (
            docs[i].playerID == getPlayerID(item.player) &&
            docs[i].type == item.type
          ) {
            playerIndex = i;
            break;
          }
        }
        if (playerIndex > -1) {
          console.log("should add to existing player");
          docs[playerIndex].rounds.push(round);
        } else {
          console.log("create new player in docs");
          var doc = {
            player: item.player,
            playerID: getPlayerID(item.player),
            rounds: [round],
            coaches: coaches,
            type: item.type
          };
          docs.push(doc);
        }
      } else {
        alert("Player names must be set");
        return;
      }
    }
    for (var doc of docs) {
      await firebase
        .firestore()
        .collection("sessions")
        .doc(
          doc.player +
            ", " +
            doc.type +
            ", " +
            teamName +
            ", " +
            eventName +
            ", " +
            new Date()
        )
        .set(doc)
        .then(function() {
          console.log(doc);
        })
        .catch(function(error) {
          console.log(error);
          alert(error.message);
        });
    }
  }
});

function getRoute(now) {
  return (
    "teams/" +
    teamName +
    "/" +
    now.getFullYear() +
    "/" +
    now.getMonth() +
    "-" +
    now.getDate() +
    "/" +
    now.getHours() +
    ":" +
    now.getMinutes() +
    "," +
    now.getMinutes() +
    "." +
    (now.getMilliseconds() / 1000 + "").substring(2) +
    "s"
  );
}

function getPlayerID(name) {
  for (var player of players) {
    if (player.name == name) {
      return player.id;
    }
  }
  return null;
}

function getTimeStamp(date) {
  var month = parseInt(date.substring(0, 2));
  var day = parseInt(date.substring(3, 5));
  var year = parseInt(date.substring(6, 10));
  var dateObj = new Date(year, month, day);
  try {
    var timeStamp = firebase.firestore.Timestamp.fromDate(dateObj); //use firestore timestamp class for querying purposes
  } catch {
    // something wrong with date formatting
    return null;
  }
  return timeStamp.seconds > 0 ? timeStamp : null;
}
