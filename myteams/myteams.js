$(".cell").on("click", function() {
  if ($(this).is("#new")) {
    console.log("new team");
  } else {
    console.log("team pressed");
  }
});
