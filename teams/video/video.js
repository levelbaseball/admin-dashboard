var teamName;

teamName = decodeURIComponent(window.location.href.split("name=")[1]);
if (teamName == "undefined") {
  window.location.replace("/login");
}

$("body").on("click", ".expander", function() {
  // if this has class expanded, flip all to up
  if ($(this).hasClass("expanded")) {
    $(this).removeClass("expanded");
    // collapse cells
    var row = $(this).closest("tr");
    collapseRow(row);
  } else {
    $(this)
      .parent()
      .siblings()
      .find(".expander")
      .removeClass("expanded");
    $(this).addClass("expanded");
    //expand cells
    var row = $(this).closest("tr");
    expandRow(row);
    if (
      $(this)
        .closest("tr")
        .hasClass("round")
    ) {
      sortBy = $(this)
        .parent()
        .index();
      console.log(sortBy);
      sortPitches($(this).closest("tr"));
    }
  }
});

function collapseRow(row) {
  var type = row.attr("class");
  var startingIndex = row.index();
  for (var i = startingIndex + 1; i < $("tr").length; i++) {
    var currentRow = $("tr").eq(i);
    if (currentRow.hasClass("event") || currentRow.hasClass(type)) {
      break;
    }
    currentRow.find(".expander").removeClass("expanded");
    currentRow.addClass("hidden");
  }
}

// heirarchy: Event => Round => Pitch
function expandRow(row) {
  var type = row.attr("class");
  var startingIndex = row.index();
  for (var i = startingIndex + 1; i < $("tr").length; i++) {
    var currentRow = $("tr").eq(i);
    if (currentRow.hasClass("event") || currentRow.hasClass(type)) {
      break;
    }
    if (!(type == "event" && currentRow.hasClass("pitch"))) {
      currentRow.removeClass("hidden");
    }
  }
}

function sortPitches(roundRow) {
  // console.log(roundRow, sortBy);
  var endIndex = roundRow.index();
  for (var i = roundRow.index() + 1; true; i++) {
    if (
      !$("tr")
        .eq(i)
        .hasClass("pitch")
    ) {
      endIndex = i;
      break;
    }
  }
  var pitches = [];
  var numerical = true;
  for (var i = roundRow.index() + 1; i < endIndex; i++) {
    statVal = $("tr")
      .eq(i)
      .find("td")
      .eq(sortBy)
      .text()
      .trim();
    if (!parseInt(statVal)) {
      numerical = false;
    } else {
      statVal = parseInt(statVal);
    }
    pitches.push({
      index: i,
      statVal: statVal
    });
  }
  console.log(pitches);
  if (numerical) {
    pitches.sort(function(a, b) {
      return b.statVal - a.statVal;
    });
  } else {
    pitches.sort(function(a, b) {
      return b.statVal.localeCompare(a.statVal);
    });
  }
  var htmlOut = "";
  for (var pitch of pitches) {
    var row = $("tr").eq(pitch.index);
    htmlOut += "<tr class='pitch'>" + row.html() + "</tr>";
  }
  while (true) {
    var row = $("tr").eq(roundRow.index() + 1);
    if (row.hasClass("pitch")) {
      row.remove();
    } else {
      break;
    }
  }
  roundRow.after(htmlOut);
}

$("h2").click(function() {
  $("h2").removeClass("selected");
  $(this).addClass("selected");
  filterByType();
});

function filterByType() {
  var type = $(".selected").text();
  if (type == "All") {
    $(".event").removeClass("hidden");
  } else {
    $("tr").each(function(i) {
      if (i == 0) return;
      if (
        $(this)
          .find("td")
          .eq(4)
          .text() != type
      ) {
        $(this)
          .find(".expander")
          .removeClass("expanded");
        $(this).addClass("hidden");
      } else if ($(this).hasClass("event")) {
        $(this).removeClass("hidden");
      }
    });
  }
}

$("#searchBox").on("input", function() {
  text = $(this).val();
  if (text == "") {
    filterByType();
    return;
  }
  $("tr").each(function(i) {
    if (i == 0) return;
    if (
      !$(this)
        .text()
        .includes(text)
      // $(this)
      //   .prev("tr")
      //   .find(".expanded")
      //   .length() == 0
    ) {
      $(this)
        .find(".expander")
        .removeClass("expanded");
      $(this).addClass("hidden");
    } else if ($(this).hasClass("event")) {
      $(this).removeClass("hidden");
    }
  });
});

$("#creatorLink").click(function() {
  window.location.href = "../creator/?name=" + encodeURI(teamName);
});

$("#teamLink").click(function() {
  window.location.href = "../?name=" + encodeURI(teamName);
});
