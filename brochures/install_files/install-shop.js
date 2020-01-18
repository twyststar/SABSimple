var currentShop, themeData;
var wsgTestMode = false;
var hideDomElements = [".hideWsg"];
var fileBackups = {};
var origAsset; //this holds the unmodified asset.value of the code editor after GETing the file  Matt was here.
var currentFileName = "";
var unsavedEditor = false;
const flask = new CodeFlask('#code-editor', {
  language: 'html',
  lineNumbers: true
});
$(".toggle-init").hide();
$("#manual-section").hide();
$("#toggle-manual").on("click", function () {
  $("#manual-section").toggle();
})
//GET theme info
//Initialize
$("#get-assets").on("click", function () {
  //build GET url, add in custom theme-store-id if needed
  
  var reqUrl = "/admin-install/theme?shop=" + shopData.myshopify_domain;
  if ($("#theme-store-id").val().length > 0) {
    reqUrl += "&customId=" + $("#theme-store-id").val()
  }
  if($("#theme-id").val().length > 0){
    reqUrl += "&themeId=" + $("#theme-id").val();
  }
  $.get(reqUrl)
    .done(function (data) {
      showSuccess("#get-assets");
      // $("#get-assets").css("border", "3px solid green")
      $(".toggle-init").slideDown();
      themeData = data.main
      var customList = data.custom;
      //for each item in assets array, organize into new array for each section in DOM
      var toUpdate = {
        theme: [],
        cart: [],
        product: [],
        collection: [],
        collectionItem: [],
        search: [],
        account: [],
        header: [],
        custom: [],
        wsgCustom: []
      }
      data.assets.forEach(function (asset) {
        //create checklist in each auto-install section
        var placements = placeAsset(asset, customList);
        if (placements) {
          placements.forEach(function (location) {
            toUpdate[location].push(asset)
          })
        }
        //build list for code editor
        let fileDir = asset.substring(0, asset.indexOf("/"))
        $("#editor-file-list").find("." + fileDir).append(`<li>${asset}</li>`)
      })
      initEditorList();
      //populate DOM with organized paths
      for (let section in toUpdate) {
        //go through each section and add filenames to list in DOM\
        let tempSel = "#" + section + " .section-content";
        toUpdate[section].forEach(function (path) {
          $("#section-item-master").children().clone().appendTo(tempSel).find("input").prop("name", path)
          $(`input[name='${path}']`).siblings(".filename").text(path)
        })
      }
      //populate checklist with appropriate assets
      buildChecklist(data.genericModel, data.customModel)

      //populate theme info with needed data from custom model
      buildThemeData(data.main, data.themes)
      var themeName = data.customModel.name || "";
      var notes = data.customModel.notes || "Custom Model not found";
      var ajaxNotes = data.customModel.ajaxNotes || "";
      let collectionPrices = data.customModel.collectionPrices || "";
      let productPrice = data.customModel.productPrice || "";
      hideDomElements = data.customModel.hideDomElements || [".hideWsg"];
      $("#custom-notes").text(name + "- " + notes)
      $("#ajaxNotes").text(ajaxNotes);
      $("#collectionPrices").val(collectionPrices)
      $("#productPrice").val(productPrice)
      //check boxes of files to install
      preCheckBoxes(data.customModel);
      //show turbo button if needed
      if($("#theme-store-id").val() == "9901"){
         $("#turbo-container").show()
       }
    })
    .fail(function (data) {
      alert("Error")
      console.log(data)
    })
})
//-----------------------
//    Install Actions
//-----------------------
//Install Section
$(".section-button").on("click", function () {
  let paths = [];
  let section = $(this).closest(".install-section").prop("id");
  //put all checked paths into array
  $(this).closest(".install-section").find(".item-input").each(function (elem) {
    if ($(this).is(":checked")) {
      paths.push($(this).prop("name"))
    }
  })
  //post array of paths to /install-section
  var delayTime = $("#call-limit").val();
  // ** For each item in paths, start timer, post item.

  for (let i = 0; i < paths.length; i++) {
    //for each item, start a timer at i * 500ms, to have one start every 1/2 second to comply with shopify
    // 2perSecond limit.
    let path = paths[i]
    setTimeout(function () {
      $.post('/admin-install/install-section?shop=' + shopData.myshopify_domain, {
        path: [path],
        theme_id: $("#theme-id").val(),
        section: section,
        themeStoreId: $("#theme-store-id").val(),
        delayTime: delayTime,
      })
        // ! changed updates to update
        .done(function (update) {
        //update[0] is data related to file and what we did, update[1] is call limit related data.  maybe refactor to just be one object?
          update = JSON.parse(update);
          //get call limit and button classes, update DOM, and delete from array <== probably can depreciate once new cart is up
          var callLimit, buttonClasses;
          if (update[1].fileName == "Call Limit") {
            callLimit = update[1].value;
          } else if (update[1].fileName == "Button Classes") {
            buttonClasses = update[1].value;
            $("#button-classes").val(buttonClasses)
          }
          $("#current-limit").text(callLimit)

          //color code filename based on success or fail, add to backups if needed
          let sectionSel = "#" + section;
          let spanSel = `span:contains('${update[0].fileName}')`;
          let current = $(sectionSel).find(spanSel); //current is the span with the filename as text
          //color code file names
          if (update[0].updated == true) {
            $(current).css("color", "#008006");
            $(current).addClass("green");
          } else {
            $(current).css("color", "#ff0a63")
            $(current).removeClass("green");
          }
          $(current).siblings().prop( "checked", false )
          //update and color code status messages
          $("#status-master").children().clone(true).appendTo(current);
          //append list of status messages to each View Status link
          update[0].sections.forEach(function (fileStatus) {
            //color-code results
            let openTag = "<li style='color: #008006'>"
            if (!fileStatus.success) {
              openTag = "<li style='color: #ff0a63'>"
            } else {
              //update color of master list on right of update ids
              updateTracker(fileStatus.id)
            }
            let appendStr = `${openTag}${fileStatus.id} - ${fileStatus.message}</li>`
            $(current).find(".status-list").append(appendStr)
          })
          //hide status block
          $(current).find(".status-block").hide()
          //listener to toggle status list
          $(current).find(".show-status").on("click", function () {
            $(this).parentsUntil(".status-container").siblings(".status-block").toggle()
          })

          if (update[0].origFile) {
            //an origFile means the update was successful
            saveBackup({
              key: update[0].fileName,
              value: update[0].origFile
            });
            if (currentFileName == update[0].fileName) {
              flask.updateCode("File updated externally, open again for current value.");
            }
          }
        })
        .fail(function (data) {
          alert("Error")
        })
    }, (i * $("#call-limit").val()));
  }
})
//post latest wsg-* assets to theme
$("#updateAssets").on("click", function () {
  $.ajax({
      method: "post",
      url: "/admin-install/update-wsg-assets?shop=" + shopData.myshopify_domain,
      data: {
        theme_id: $("#theme-id").val()
      }
    })
    .done(function(data) {
      showSuccess();
      reloadInit();
    })
    .fail(function(data) {
      alert("Error")
      console.log(data)
    })
})
//upload split header/footer for turbo theme
$("#uploadSplitHeader").on("click", function() {
  $.ajax({
      method: "post",
      url: "/admin-install/upload-split-header?shop=" + shopData.myshopify_domain,
      data: {
        theme_id: $("#theme-id").val()
      }
    })
    .done(function(data) {
      showSuccess();
      reloadInit();
    })
    .fail(function (data) {
      alert("Error")
      console.log(data)
    })
})
//update button classes listener
$(".add-classes").on("click", function () {
  //get classes from input
  let buttonClasses = $("#button-classes").val()
  $.post('/admin-install/button-classes?shop=' + shopData.myshopify_domain, {
    buttonClasses: buttonClasses,
    theme_id: themeData.theme_id
  })
    .done(function (data) {
      showSuccess(".add-classes");
      checkCodeEditor(["snippets/wsg-header.liquid", "snippets/wsg-footer.liquid"])
    })
    .catch(function (err) {
      alert("Error - see logs for details");
      console.log(err)
    })
  //post to server
})
//enable cart Observer
$("#cartObserverBtn").on("click", function () {
  $.post('/admin-install/enable-cart-observer?shop=' + shopData.myshopify_domain, {
    enable: true,
    theme_id: themeData.theme_id
  })
    .done(function (data) {
      showSuccess()
    })
    .catch(function (err) {
      alert("Error - see logs for details")
      console.log(err)
    })
})
//enable cart Observer
$("#collectionObserverBtn").on("click", function () {
  $.post('/admin-install/enable-collection-observer?shop=' + shopData.myshopify_domain, {
    enable: true,
    theme_id: themeData.theme_id
  })
    .done(function (data) {
      showSuccess("#collectionObserverBtn")
    })
    .catch(function (err) {
      alert("Error - see logs for details")
      console.log(err)
    })
})
//update collection price selectors in wsg-header
$("#saveColPrices").on("click", function () {
  updatePriceSel({
    pricesStr: $("#collectionPrices").val(),
    section: "collection",
    buttonId: "#saveColPrices"
  })
})
//update product price selectors in wsg-header
$("#saveProdPrice").on("click", function () {
  updatePriceSel({
    pricesStr: $("#productPrice").val(),
    section: "product",
    buttonId: "#saveProdPrice"
  })
})
//submit ajax cart data
$("#ajaxSubmit").on("click", function () {
  var enable = false;
  if ($("#enableAjax").is(":checked")) {
    enable = true;
  }
  let wsgAjaxSettings = {}
  if ($("#ajaxPrice").val()) {
    wsgAjaxSettings.price = $("#ajaxPrice").val()
  }
  if ($("#ajaxLinePrice").val()) {
    wsgAjaxSettings.linePrice = $("#ajaxLinePrice").val()
  }
  if ($("#ajaxTotal").val()) {
    wsgAjaxSettings.subtotal = $("#ajaxTotal").val()
  }
  if ($("#ajaxCheckout").val()) {
    wsgAjaxSettings.checkoutBtn = $("#ajaxCheckout").val()
  }

  $.post('/admin-install/ajax-settings?shop=' + shopData.myshopify_domain, {
    settings: wsgAjaxSettings,
    enable: enable,
    theme_id: themeData.theme_id
  })
    .done(function (data) {
      showSuccess("#ajaxSubmit");
      checkCodeEditor(["snippets/wsg-header.liquid", "snippets/wsg-footer.liquid"])
    })
    .catch(function (err) {
      alert("Error - see logs for details")
      console.log(err)
    })
})

//update proxy margin listener
$(".add-proxy").on("click", function () {
  let proxyMargin = $("#proxy-margin").val() || 0;
  $.post("/proxy/styles?shop=" + shopData.myshopify_domain, {
    proxyMargin: proxyMargin
  })
    .then(function () {
      showSuccess(".add-proxy")
    })
    .catch(function (err) {
      alert("Error - See logs for details")
      console.log(err)
    })
})
//hide element
$("#hideSubmit").on("click", function () {
  let hideSel = $("#hideSel").val();
  $.post('/admin-install/hide-element?shop=' + shopData.myshopify_domain, {
    hideSel: hideSel,
    theme_id: themeData.theme_id
  })
    .done(function (data) {
      showSuccess();
      $("#hideSel").val("")
    })
    .catch(function (err) {
      alert("Error - see logs for details")
      console.log(err)
    })
})
//upload hideDomElements from model
$("#hideDomElements").on("click", function () {
  $.post('/admin-install//hide-dom-elm?shop=' + shopData.myshopify_domain, {
    hideDomElements: hideDomElements,
    theme_id: themeData.theme_id
  })
    .done(function (data) {
      showSuccess("#hideDomElements");
    })
    .catch(function (err) {
      alert("Error - see logs for details")
      console.log(err)
    })
})
$(".toggle-section").on("click", function () {
  $(this).closest(".Polaris-Card").find(".section-shops").toggle();
})

function updatePriceSel(priceData) {
  //turn string to array and trim whitespace
  let priceSelectors = priceData.pricesStr.split(",");
  for (let i = 0; i < priceSelectors.length; i++) {
    priceSelectors[i] = priceSelectors[i].trim();
  }
  $.post('/admin-install/price-selectors?shop=' + shopData.myshopify_domain, {
    theme_id: themeData.theme_id,
    section: priceData.section,
    priceSelectors: priceSelectors
  })
    .done(function (data) {
      showSuccess(priceData.buttonId);
      checkCodeEditor(["snippets/wsg-header.liquid", "snippets/wsg-footer.liquid"])
    })
    .catch(function (err) {
      alert("Error - see logs for details")
      console.log(err)
    })
}

function buildThemeData(main, themes) {
  $("#view-themes").on("click", function (e) {
    e.preventDefault()
    $("#theme-list").toggle(function () { })
  })
  $("#theme-store-id").val(main["theme_store_id"])
  $("#theme-id").val(main["theme_id"])
  //build list of other theme data
  themes.forEach(function (theme) {
    let themeStr = `${theme.name}  -  ${theme["theme_store_id"]} <span style='margin-left: 15px'>theme_id: ${theme["id"]}</span>`
    if (theme.role == "main") {
      themeStr = "<strong>" + themeStr + "</strong>"
    }
    themeStr = "<li>" + themeStr + "</li>"
    $("#theme-list ul").append(themeStr)
  })
}

function updateTracker(updateId) {
  //make master checklist item green when installed
  $(".section-checklist li").each(function () {
    if ($(this).find(".update-id").text() == updateId) {
      $(this).find(".update-id").css("color", "#008006")
    }
  })
}

function buildChecklist(genericModel, customModel) {
  //generic model
  var requiredKeys = ["c1", "c8", "c10", "c14"]
  for (let key in genericModel) {
    let updates = genericModel[key].updates;
    for (let i = 0; i < updates.length; i++) {
      //clone checklist master and add update data

      let sectionSel = `#${key} .section-checklist ul`;
      let hoverText = updates[i].textToAdd || updates[i].addStart;
      hoverText = "<strong>" + updates[i].id + "</strong><br><xmp>" + hoverText + "</xmp>";
      $("#checklist-master").children().clone(true).appendTo(sectionSel).find(".update-id").text(updates[i].id).attr("title", hoverText).prop("id", updates[i].id);
      let copyText = updates[i].textToAdd || updates[i].addStart;
      $("#" + updates[i].id).siblings(".textToAdd").text("<xmp>" + copyText + "</xmp>");
    }
  }

  //go through customModel and change toolTip titles or add lis as needed
  for (var key in customModel) {
    //if the value is an array then add new lis to custom section
    if (Array.isArray(customModel[key])) {
      customModel[key].forEach(function (update) {
        let sectionSel = `#custom .section-checklist ul`;
        let hoverText = update.textToAdd || update.addStart;
        hoverText = "<strong>" + update.id + "</strong><br><xmp>" + hoverText + "</xmp>";
        $("#checklist-master").children().clone(true).appendTo(sectionSel).find(".update-id").text(update.id).attr("title", hoverText)

      })
    } else {
      //li already exists, just change tooltip value to custom vaction
      $(".section-checklist li").each(function () {
        //see if key matches .update-id text()
        if (key == $(this).find(".update-id").text()) {
          let hoverText = customModel[key].textToAdd || customModel[key].addStart;
          hoverText = key + "<br><xmp>" + hoverText + "</xmp>";
          $(this).find(".update-id").attr("title", hoverText)
        }
      })
    }
  }

  //enable tooltip
  $('[data-toggle="tooltip"]').tooltip({
    template: "<div class=\"tooltip\" role=\"tooltip\"><div class=\"arrow\"></div><div class=\"tooltip-inner large\"></div></div>"
  });
  //enable copy listener to copy code if needed
  $(".checklist-item").on("click", function () {
    let text = $(this).find(".textToAdd").text();
    text = text.replace("<xmp>", "");
    text = text.replace("</xmp>", "");
    console.log(text)
    $("#copy-holder").val(text)
    $("#copy-holder").show();
    $("#copy-holder").select();
    document.execCommand("copy");
    $("#copy-holder").hide();
  })

  //auto-fill inputs
  if (customModel) {
    if (customModel.ajaxSettings) {
      for (let key in customModel.ajaxSettings) {
        if (customModel.ajaxSettings[key].length > 0) {
          $("#" + key).val(customModel.ajaxSettings[key])
        }
      }
    }
    if (customModel.enableCartObserver) {
      $("#enableCartObserver").prop("checked", true)
    }
    if (customModel.enableColObserver) {
      $("#enableColObserver").prop("checked", true)
    }
    if (customModel.proxyMargin) {
      $("#proxy-margin").val(customModel.proxyMargin)
    }
    if (customModel.btnClasses) {
      $("#button-classes").val(customModel.btnClasses)
    }
  }
}
//build out checklist for autoinstall sections
function placeAsset(asset, customList) {
  //returns names of arrays to put asset in, or null to not update
  var returnArr = [];
  asset = asset.toLowerCase();
  //maybe run custom stuff first?
  //theme
  if (asset.indexOf("theme.liquid") > -1) {
    returnArr.push("theme")
  }
  //cart
  if (asset.indexOf("cart") > -1) {
    returnArr.push("cart")
  }
  //product
  //   if((asset.indexOf("product") > -1) || (asset.indexOf("form") > -1) || (asset.indexOf("swatch") > -1)){
  //     returnArr.push("product")
  //   }
  //collection
  if ((asset.indexOf("collection") > -1) || (asset.indexOf("related") > -1) || (asset.indexOf("loop") > -1) || (asset.indexOf("products") > -1) || (asset.indexOf("carousel") > -1) || (asset.indexOf("rows") > -1) || (asset.indexOf("featured") > -1) || (asset.indexOf("recommendations") > -1)) {
    returnArr.push("collection")
  }
  //collection items
  //   if((asset.indexOf("item") > -1) || (asset.indexOf("price") > -1) || (asset.indexOf("card") > -1) || (asset.indexOf("thumbnail") > -1)){
  //     returnArr.push("collectionItem")
  //   }
  //search
  if (asset.indexOf("search") > -1) {
    returnArr.push("search")
  }
  //account
  if (asset.indexOf("account") > -1) {
    returnArr.push("account")
  }
  //header
  if ((asset.indexOf("head") > -1) || (asset.indexOf("nav") > -1)) {
    returnArr.push("header")
  }
  //wsg
  if (asset.indexOf("wsg") > -1) {
    returnArr.push("wsgCustom")
  }
  //custom
  let custom = false;
  for (let i = 0; i < customList.length; i++) {
    if (customList[i] == asset) {
      custom = true;
    }
  }
  if (custom) {
    returnArr.push("custom")
  }
  //exclusions
  if ((asset.indexOf("asset") > -1) || (asset.indexOf("gift") > -1) || (asset.indexOf("css") > -1) || (asset.indexOf("onboarding") > -1)) {
    returnArr = []
  }
  return returnArr
}

function preCheckBoxes(customModel) {
  if (customModel.fileList) {
    for (let key in customModel.fileList) {
      customModel.fileList[key].forEach(function (fileName) {
        $("#" + key).find("input[name='" + fileName + "']").prop("checked", true)
      })
    }
  }
}

function getFileList() {
  var checklist = {}
  $(".install-section").each(function () {
    // console.log($(this).prop("id"))
    let section = $(this).prop("id");
    let files = $(this).find(".green");
    let fileArr = [];
    files.each(function (file) {
      fileArr.push($(this).siblings("input").prop("name"))
    })
    if (fileArr.length > 0) {
      checklist[section] = fileArr
    }
  })
  console.log(checklist)
}

//-----------------------
//    Test Mode 
//-----------------------
$("#startTest").on("click", function () {
  //   Begin test mode
  wsgTestMode = true;
  $(this).addClass("Polaris-Button--disabled");
  //update wsg-header and wsg-status to enable test mode in liquid
  $.post('/admin-install/install-section?shop=' + shopData.myshopify_domain, {
    paths: ["snippets/wsg-header.liquid", "snippets/wsg-status.liquid"],
    theme_id: $("#theme-id").val(),
    section: "testModeOn",
    themeStoreId: $("#theme-store-id").val(),
    delayTime: $("#call-limit").val(),
  })
    .done(function (updatesData) {
      $("#startTest").removeClass("Polaris-Button--disabled");
      testModeResults({
        updates: JSON.parse(updatesData),
        openShop: true,
        init: true
      })
    })
    .fail(function (err) {
      console.log(err)
    })
})
$("#endTest").on("click", function () {
  $(this).addClass("Polaris-Button--disabled");
  endTest();
})
function endTest() {
  wsgTestMode = false;
  //update wsg-header and wsg-status to end test mode in liquid
  $.post('/admin-install/install-section?shop=' + shopData.myshopify_domain, {
    paths: ["snippets/wsg-header.liquid", "snippets/wsg-status.liquid"],
    theme_id: $("#theme-id").val(),
    section: "testModeOff",
    themeStoreId: $("#theme-store-id").val(),
    delayTime: $("#call-limit").val(),
  })
  .done(function (updatesData) {
    $("#endTest").removeClass("Polaris-Button--disabled");
    testModeResults({
      updates: JSON.parse(updatesData),
      openShop: false,
      init: false
    })
  })
  .fail(function(err){
    console.log(err)
  })
  
}

//warn dev if leaving page with test mode on.  Exclusions might not run properly for end user if left on.
var warnedTestMode = false;
$(".leave-page").on("click", function(e){
  e.preventDefault();
  if(wsgTestMode == true && warnedTestMode == false){
    alert("Test Mode still active.  Are you sure you want to leave the page?? \n\nThis is the only time this warning will appear.");
    warnedTestMode = true;
  } else {
    window.location = "/install-manager/index"
  }
})
  
function testModeResults(data){
    let fileNames = "";
    //display error messages if needed
    data.updates.forEach(function(update){
      if(update.updated == false){
        fileNames += "\n" + update.fileName + " --> " + update.sections[0].message;
      }
    })

}
function testModeResults(data) {
  let fileNames = "";
  //display error messages if needed
  data.updates.forEach(function (update) {
    if (update.updated == false) {
      fileNames += "\n" + update.fileName + " --> " + update.sections[0].message;
    }
  })
  if (fileNames.length > 0) {
    alert("Error updating file(s): " + fileNames)
  } else {
    //open new window with querystring added
    showSuccess();
    if (data.init) {
      $(".test-indicator").show()
    } else {
      $(".test-indicator").hide()
    }
    if (data.openShop == true) {
      setTimeout(function () {
        window.open(`https://${shopData.myshopify_domain}?wsgTestMode`, '_blank')
      }, 300)
    }
  }
}

//-----------------------
//    code editor 
//-----------------------
//   //PUT code back to file in Shopify
$(".save-code").on("click", function () {
  let asset = {};
  asset.key = currentFileName;
  asset.value = flask.getCode();
  $(".save-code-button").addClass("Polaris-Button--disabled");
  saveBackup({
    key: currentFileName,
    value: origAsset.value
  });
  putAsset(asset);
})
$("#restore-btn").on("click", function () {
  if (fileBackups[currentFileName]) {
    let asset = {
      key: currentFileName,
      value: fileBackups[currentFileName]
    };
    putAsset(asset);
    flask.updateCode(asset.value);
  } else {
    alert("No backup found.")
  }
})
// listen for changes to editor
$(".codeflask__textarea").on("input", function () {
  if (unsavedEditor == false) {
    $(".save-code-button").removeClass("Polaris-Button--disabled");
  }
  unsavedEditor = true;
})
//searchable file list
$("#search-filelist").on("input", function () {
  let query = $(this).val();
  if (query.length > 0) {
    query = query.toLowerCase();
    $("#editor-file-list li").each(function () {
      let filePath = $(this).text().toLowerCase();
      if (filePath.indexOf(query) > -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    })
  } else {
    $("#editor-file-list li").show();
  }
})

function putAsset(asset) {
  $.ajax({
    type: "PUT",
    url: `/admin/asset?key=${currentFileName}&shop=${shopData.myshopify_domain}`,
    data: {
      asset: asset,
      themeId: $("#theme-id").val()
    }
  })
    .done(function (status) {
      showSuccess();
      //update saved button
      if (unsavedEditor == true) {
        unsavedEditor = false;
        $(".save-code-button").addClass("Polaris-Button--disabled");
      }
    })
    .fail(function (err) {
      alert("Error saving file")
      console.log(err)
      $(".save-code-button").removeClass("Polaris-Button--disabled");
    })
}
//save backup to object if it isn't already
function saveBackup(asset) {
  if (!(fileBackups[asset.key])) {
    fileBackups[asset.key] = asset.value;
    //mark filelist
    $(`#editor-file-list li:contains(${asset.key})`).addClass("backup-indicator")
  }
  toggleRestoreBtn(asset.key);
}
//sets listeners for code editor
function initEditorList() {
  //load an asset into the editor
  $("#editor-file-list li").on("click", function () {
    let assetKey = $(this).text();
    let themeId = $("#theme-id").val();
    $.get(`/admin/asset?key=${assetKey}&themeId=${themeId}&shop=${shopData.myshopify_domain}`)
      .done(function (asset) {
        //hold on to asset in case we want to back it up
        origAsset = asset;
        //update DOM of code editor
        currentFileName = asset.key;
        $("#currentFileName").text(asset.key);
        flask.updateCode(asset.value);
        toggleRestoreBtn(asset.key);
      })
      .fail(function (err) {
        console.log(err)
      })
  })
}
function toggleRestoreBtn(key) {
  if (fileBackups[key]) {
    $("#restore-btn").show();
  } else {
    $("#restore-btn").hide();
  }
}
//on inputs such as updating prices, observer, etc. check to see if our file is open in the editor to prevent overwriting.
//takes an array of file paths, if any of the paths match the currently open file in the editor it warns the user.
function checkCodeEditor(filePaths) {
  filePaths.forEach(function (path) {
    if (currentFileName == path) {
      flask.updateCode("File updated externally, open again for current value.");
    }
  })
}
// ---------  Init Shop Data -----------
//requestAccess
if (shopData.requestAccess) {
  $("#request-complete").show()
} else {
  $("#request-complete").hide()
}
//mote
$('#shop-note').val(shopData.installNote);
//customer req
if (shopData.customerComplete) {
  $("#customer-complete").show()
} else {
  $("#customer-complete").hide()
}
//discount complete
if (shopData.discountComplete) {
  $("#discount-complete").show()
} else {
  $("#discount-complete").hide()
}
//email
if (shopData.welcomeEmail) {
  $("#email-complete").show()
} else {
  $("#email-complete").hide()
}

//-----  General Shop actions ------------
//verify out of test mode
$(".verify-test").on("click", function () {
  currentShop = $(this).attr("id");
  $.ajax({
    method: "post",
    url: "/admin-install/verify-test",
    data: {
      shop: currentShop
    }
  })
    .done(function (data) {
      showSuccess();
    })
    .fail(function (data) {
      alert("Error")
      console.log(data)
    })
})
//mark as waiting
$(".waiting").on("click", function () {
  currentShop = $(this).attr("id");
  $.ajax({
    method: "post",
    url: "/install-manager/waiting",
    data: {
      shop: currentShop
    }
  })
    .done(function (data) {
      showSuccess();
    })
    .fail(function (data) {
      alert("Error")
      console.log(data)
    })
})
$("#removeMaybe").on("click", function () {
  removeMaybe();
})
function removeMaybe(showSuccess = true) {
  //showSuccess = true will disable the success alert.  in install complete we don't want to show double successes
  var conflicts = {
    wholesale: "ok",
    volume: "ok",
    recurring: "ok",
    options: "ok"
  }
  $.ajax({
    method: 'PUT',
    url: "/conflicts?shop=" + shopData.myshopify_domain,
    data: {
      conflicts: conflicts
    }
  })
  .then(function () {
    if(showSuccess == true){
      showSuccess();
    }
  })
  .catch(function (err) {
    alert("Error - See logs for details")
    console.log(err)
  })
}
//save note
$("#save-note").on('click', function () {
  $.post('/install-manager/shop-note', {
    shop: shopData.myshopify_domain,
    note: $('#shop-note').val()
  })
    .done(function (data) {
      showSuccess();
    })
    .fail(function (data) {
      alert("Error")
      console.log(data)
    })
})
//weclome email
$('#send-email').on('click', function () {
  $.post('/install-manager/welcome-email', {
    email: shopData.email,
    shop: shopData.myshopify_domain,
    content: $('#email-contents').val()
  })
    .done(function (data) {
      $('#exampleModal').modal('hide')
      $("#email-complete").show();
      showSuccess();
    })
    .fail(function (data) {
      alert("Error")
      console.log(data)
    })
})
//checklist
$("#checklist li").click(function () {
  $(this).css('text-decoration', 'line-through');
})
$('.toggle-checklist').on('click', function () {
  $('#checklist').toggleClass('hideElement')
})
let newDiscounts = [{
  tags: "wsgTestTag",
  discountType: "fixed",
  amount: 111,
  scope: "all",
  title: "Enitre Store"
}];
//create test discount
$('#discount').on('click', function () {
  $.post('/api/' + shopData.shop_id + '/discounts', {
    newDiscounts: newDiscounts
  })
    .done(function (data) {
      $("#discount-complete").show();
      showSuccess();
      //save that it waas sent
      $.post('/install-manager/save-discount', {
        shop: shopData.myshopify_domain
      })
        .done(function (data) {
          //done
        })
        .fail(function (data) {
          alert("Error")
          console.log(data)
        })
    })
    .fail(function (data) {
      alert("Error")
      console.log(data)
    })
})
//Create Dummy Customer
$('#customer').on('click', function () {
  //create and activate dummy customer in store
  let email = $('#customerEmail').val();
  $.post('/install-manager/create-customer', {
    email: email,
    shop: shopData.myshopify_domain
  })
    .done(function (data) {
      console.log(data)
      $("#customer-complete").show();
      showSuccess();
    })
    .fail(function (data) {
      alert("Error: email may already be taken")
      console.log(data)
    })
})
//request access
$("#requestText").hide()
$('#requestLink').on('click', function () {
  //copy text
  $("#requestText").show();
  copy("#requestText");
  $("#requestText").hide()

  //save that it was sent
  $.post('/install-manager/access-req', {
    shop: shopData.myshopify_domain
  })
    .done(function (data) {
      $("#request-complete").show()
    })
    .fail(function (data) {
      console.log(data)
      alert("Error Saving Data")
    })
})
//trigger init if in querystring (after updating assets, etc)
if(window.location.href.indexOf("trigger-init") > -1){
  let currentUrl = window.location.href;
  //check to see if there was a custom id
  let customIdIndex = currentUrl.indexOf("customId");
  var customId;
  if( customIdIndex > -1){
      customIdIndex += 9;
      let endIndex = currentUrl.indexOf("&", customIdIndex);
      if(endIndex > -1){
        customId = currentUrl.substring(customIdIndex, endIndex)
      } else {
        customId = currentUrl.substring(customIdIndex)
      }
    $("#theme-store-id").val(customId)
  }
  $("#get-assets").trigger("click");
}
//reload page with custom theme id if needed and trigger init
function reloadInit(){
  let redirectUrl = window.location.origin + window.location.pathname + "?shop=" + shopData.myshopify_domain + "&trigger-init";
  if ($("#theme-store-id").val().length > 0) {
    redirectUrl += "&customId=" + $("#theme-store-id").val();
  }
  window.location.href = redirectUrl;
}

//install complete
$("#installComplete").on("click", function () {
  $(this).addClass("Polaris-Button--disabled");
  //end test mode if it's still on
  $.post('/admin-install/update-tags?shop=' + shopData.myshopify_domain, {})
  .done(function (data) {
    return $.post('/admin-install/install-complete?shop=' + shopData.myshopify_domain, {})
  })
  .done(function (data) {
    endTest();

    removeMaybe(false);
  })
  .fail(function (data) {
    alert("Error - see console for details.")
    console.log(data)
  })
  .always(function(){
    $(this).removeClass("Polaris-Button--disabled");
  })
})
$('#success-alert').hide();
function copy(selector) {
  var copyText = document.querySelector(selector);
  copyText.select();
  document.execCommand("copy");
}
function showSuccess(str) {
  $('#success-alert').slideDown(400);
  $(`${str}`).css("border", "3px solid green")
  setTimeout(function () {
    $('#success-alert').slideUp(400);
  }, 3000)
}