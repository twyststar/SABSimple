
//Shows smaller fixed header on scroll
$(window).scroll(function() {
  var top = $(this).scrollTop();
  if (top > 120) {
    // $(".headerStandard").slideUp();
    $(".headerScroll").slideDown();
  } else {
    // $(".headerStandard").slideDown();
    $(".headerScroll").hide();
  }
});

// Learn More accordion button functions
$(".schoolAccordion").click(function(){
  alert('This will open a section with more information')
})