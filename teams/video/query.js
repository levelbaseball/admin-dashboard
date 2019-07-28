var data = [];

firebase
  .firestore()
  .collection("moments")
  .where("team", "==", teamName)
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      data.push(doc.data());
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
  var htmlOut = "";
  for (var moment of data) {
    var { player, name, date, type } = moment;
    date = date.toDate();
    date = date.getMonth() + 1 + "/" + date.getDay() + "/" + date.getFullYear();
    htmlOut +=
      '<tr class="event"><td class="videoCell"><video><source type="video/*"></video></td><td class="nameCell">' +
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
        '<tr class="round hidden"><td class="videoCell"><video><source type="video/*"></video></td><td class="nameCell">' +
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
      for (var j = 0; j < round.pitches.length; j++) {
        var pitch = round.pitches[j];
        htmlOut +=
          '<tr class="pitch hidden"><td class="videoCell"><video><source type="video/*"></video></td><td class="nameCell">' +
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
  $("tr")
    .eq(0)
    .after(htmlOut);
  console.log(htmlOut);
  renderThumbs();
}

async function renderThumbs() {
  urls = [];
  for (var i = 0; i < data.length; i++) {
    var moment = data[i];
    var momentThumb = null;
    for (var round of moment.rounds) {
      var roundThumb = null;
      if (round.angle1) {
        roundThumb = round.angle1;
      }
      if (round.angle2) {
        urls.push(round.angle2);
      }
      if (round.split) {
        urls.push(round.split);
      }
      if (roundThumb && !momentThumb) {
        momentThumb = roundThumb;
        urls.push({ url: momentThumb, time: 0 });
      }
      urls.push({ url: roundThumb, time: 0 });
      for (var pitch of round.pitches) {
        urls.push({ url: roundThumb, time: pitch.start });
      }
    }
    // var moment = data[i];
    // var urlFound = false;
    // for (var round of moment.rounds) {
    //   if (round.angle1) {
    //     urls.push(round.angle1);
    //     urlFound = true;
    //     break;
    //   }
    //   if (round.angle2) {
    //     urls.push(round.angle2);
    //     urlFound = true;
    //     break;
    //   }
    //   if (round.split) {
    //     urls.push(round.split);
    //     urlFound = true;
    //     break;
    //   }
    // }
  }
  console.log(urls);
  console.log(urls.length, $("tr").length);
  for (i = 0; i < urls.length; i++) {
    var { url, time } = urls[i];
    var row = $("tr").eq(i + 1);
    videoRef = firebase.storage().ref(url);
    await videoRef
      .getDownloadURL()
      .then(function(downloadUrl) {
        renderVideo(row, downloadUrl);
        // var video = $("tr")
        //   .eq(3)
        //   .find("video");
        // console.log(i);
        // // video.html(
        // //   "<video src='" + downloadUrl + "'><source type='video/*'></video>"
        // // );
        // video.attr("src", downloadUrl);
        // console.log(downloadUrl);
        // video[0].load();
        // // video[0].addEventListener(
        // //   "loadeddata", //"loadedmetadata",
        // //   function() {
        // //     console.log(video[0]);
        // //   },
        // //   false
        // // );
        // // //video.attr("currentTime", time);
      })
      .catch(function(error) {
        alert(error.message);
      });
  }
}

async function renderVideo(row, url) {
  var video = row.find("video");
  video.attr("src", url);
  video[0].load();
}
