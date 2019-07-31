var data = [];

firebase
  .firestore()
  .collection("moments")
  .where("team", "==", teamName)
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      data.push(
        Object.assign(doc.data(), {
          fullName: doc.id
        })
      );
    });
    console.log(data);
    renderTable();
  })
  .catch(function(error) {
    alert(error.message);
    window.location.replace("/login");
  });

var statsObj = {
  Hitter: ["EV", "LA", "Dist"],
  Pitcher: ["Pitch", "MPG", "RPM", "EFF"],
  Fielder: ["MPH", "StS", "GtC"],
  Runner: ["60", "1B", "SB"]
};

function renderTable() {
  var htmlOut =
    '<tr> <th class="videoCell">Video</th> <th class="nameCell">Player</th> <th>Event</th> <th>Date</th> <th>Type</th> <th>Round</th> <th>Pitch</th> </tr>';
  for (var moment of data) {
    console.log(moment);
    var { player, name, date, type, fullName } = moment;
    date = date.toDate();
    date = date.getMonth() + 1 + "/" + date.getDay() + "/" + date.getFullYear();
    htmlOut +=
      '<tr class="event"><td class="videoCell"><a href="' +
      getViewUrl(fullName, 1, 1) +
      '" target="_blank"><img /></a></td><td class="nameCell">' +
      player +
      "</td><td>" +
      name +
      "</td><td>" +
      date +
      "</td><td>" +
      type +
      '</td><td>-</td><td>-</td><td>Expand<div class="expander"></div></td></tr>';
    for (var i = 0; i < moment.rounds.length; i++) {
      var round = moment.rounds[i];
      htmlOut +=
        '<tr class="round hidden"><td class="videoCell"><a href="' +
        getViewUrl(fullName, i + 1, 1) +
        '" target="_blank"><img/></a></td><td class="nameCell">' +
        player +
        "</td><td>" +
        name +
        "</td><td>" +
        date +
        "</td><td>" +
        type +
        "</td><td>" +
        (i + 1) +
        "</td><td>-</td>";
      var possibleStats = statsObj[type];
      for (var stat of possibleStats) {
        htmlOut +=
          '<td class="stat">' + stat + '<div class="expander"></div></td>';
      }
      if (round.notes) {
        htmlOut += '<td><p class="note">' + round.notes + "</p></td></tr>";
      }
      if (round.pitches) {
        for (var j = 0; j < round.pitches.length; j++) {
          var pitch = round.pitches[j];
          htmlOut +=
            '<tr class="pitch hidden"><td class="videoCell"><a href="' +
            getViewUrl(fullName, i + 1, j + 1) +
            '" target="_blank"><img /></a></td><td class="nameCell">' +
            player +
            "</td><td>" +
            name +
            "</td><td>" +
            date +
            "</td><td>" +
            type +
            "</td><td>" +
            (i + 1) +
            "</td><td>" +
            (j + 1) +
            "</td>";
          for (var stat of possibleStats) {
            if (pitch.stats[stat.toLowerCase()]) {
              htmlOut +=
                '<td class="stat">' + pitch.stats[stat.toLowerCase()] + "</td>";
            } else {
              htmlOut += '<td class="stat">-</td>';
            }
          }
          htmlOut += "</tr>";
        }
      }
    }
  }
  $("table").append(htmlOut);
  console.log(htmlOut);
  renderThumbs();
}

async function renderThumbs() {
  urls = [];
  for (var i = 0; i < data.length; i++) {
    var moment = data[i];
    var momentThumb = null;
    for (var round of moment.rounds) {
      if (round.thumb && !momentThumb) {
        momentThumb = round.thumb;
        urls.push(momentThumb);
      }
      urls.push(round.thumb);
      for (var pitch of round.pitches) {
        urls.push(round.thumb);
      }
    }
  }
  console.log(urls);
  console.log(urls.length, $("tr").length);
  for (i = 0; i < urls.length; i++) {
    var url = urls[i];
    var row = $("tr").eq(i + 1);
    thumbRef = firebase.storage().ref(url);
    await thumbRef
      .getDownloadURL()
      .then(function(downloadUrl) {
        renderThumb(row, downloadUrl);
      })
      .catch(function(error) {
        alert(error.message);
      });
  }
}

async function renderThumb(row, url) {
  var img = row.find("img");
  img.attr("src", url);
}

function getViewUrl(momentName, round, pitch) {
  return (
    "/view/?moment=" +
    encodeURI(momentName) +
    "&round=" +
    round +
    "&pitch=" +
    pitch
  );
}
