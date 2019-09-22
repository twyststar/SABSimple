
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

  $(".accordionShow").hide();
  $(this).parent().next().show();
})

// Canada Tabbed Content

function openArea(evt, areaName) {
  // Declare all variables
  var i, tabcontent, tablinks;
  $(".accordionShow").hide();
  // Get all elements with class="tabcontent" and hide them
  $(".tabcontent").hide();
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  // document.getElementById(areaName).style.display = "block";
  $("#" + areaName).show().addClass("activeBorder");
  // document.getElementById(areaName).style.display = "block";
  evt.currentTarget.className += " active";
}

function openSubArea(evt, areaName) {
  // Declare all variables
  var i, tabcontent, tablinks;
  $(".accordionShow").hide();
  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent2");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks2");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active2", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  // document.getElementById(areaName).style.display = "block";
  $("#" + areaName).show();
  // document.getElementById(areaName).style.display = "block";
  evt.currentTarget.className += " active2";
}