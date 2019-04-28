
//Shows smaller fixed header on scroll
$(window).scroll(function() {
  var top = $(this).scrollTop();
  if (top > 120) {
    // $(".headerStandard").slideUp();
    $(".headerScroll").slideDown();
  } else {
    // $(".headerStandard").slideDown();
    $(".headerScroll").slideUp();
  }
});

