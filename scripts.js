
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
  $("#provinceMap").attr("src", "images/" + areaName + "CanadaMap.png")
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

//Load and play videos on click instead of on page load
var video_wrapper = $('.video-container');
//  Check to see if youtube wrapper exists
if (video_wrapper.length) {
  // If user clicks on the video wrapper load the video.
  $('.video-container').on('click', function () {
    var url = $(this).attr('dataurl');
    /* Dynamically inject the iframe on demand of the user.
     Pull the youtube url from the data attribute on the wrapper element. */
    $(this).html('<iframe width="450" height="300" frameborder="0" allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen src="' + url + '"></iframe >');
  });
}