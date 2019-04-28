
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

$('.fas').hover(function(){
    $(this).removeClass("fa-bars");
    $(this).addClass("fa-angle-double-down");
  }, function() {
    $(this).addClass("fa-bars");
    $(this).removeClass("fa-angle-double-down");
  }
)