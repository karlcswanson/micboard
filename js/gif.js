"use strict";

import { gif_list } from "./script.js"


$(document).ready(function() {
  window.addEventListener("resize", showDivSize);
});

function showDivSize() {
  if($("#micboard").hasClass("uploadmode")) {
    e = document.getElementsByClassName("mic_name")[0]
    width = Math.ceil(parseInt(window.getComputedStyle(e)["width"]))
    height = window.getComputedStyle(e)["height"]
    string = width + " x " + height
    $(".mic_id").html(string)
  }
}

function uploadMode(){
  document.getElementById("micboard").classList.add("uploadmode")
  showDivSize()

  $(".mic_name").each(function(){
    $(this).on('dragover',false);
    $(this).on('drop',function(e){
      slot_name = $(this).children(".name").html().toLowerCase();
      e.preventDefault();
      upload = e.originalEvent.dataTransfer.files[0];
      extension = upload.name.split(/[\s.]+/).pop().toLowerCase();
      filename = slot_name + "." + extension;
      console.log("bin:  " + slot_name + " FileName: " + upload.name + " newName:  " + filename);

      sendFile(upload,filename);
    });
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications
function sendFile(file, filename) {
  var uri = "/upload";
  var xhr = new XMLHttpRequest();
  var fd = new FormData();

  xhr.open("POST", uri, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText); // handle response.
    }
  };
  fd.append('myFile', file);
  fd.append('filename', filename);
  // Initiate a multipart/form-data upload
  xhr.send(fd);
}


export function updateGIFBackgrounds() {
  $(".mic_name").each(function(key, value){

    name = $(this).children(".name").html().toLowerCase() + ".gif";
    if(gif_list.indexOf(name) > -1){
      $(this).css('background-image', 'url("static/backgrounds/' + name + '")');
      $(this).css('background-size', 'cover');
      console.log(name);
    }
    else {
      $(this).css('background-image', '');
      $(this).css('background-size', '');
    }
  });
}
