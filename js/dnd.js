"use strict"

import { micboard } from "./script.js"
import { updateViewOnly } from "./channelview.js"


export function slotOrder() {
  let slotList = []
  $("#micboard > div").each(function(){
    const id = parseInt(this.id.replace ( /[^\d.]/g, '' ))
    if (id && (slotList.indexOf(id) == -1)) {
      slotList.push(id)
    }
  })
  console.log("slotlist:" + slotList)
  return slotList
}


export function renderEditSlots(dl) {
  document.getElementById("eslotlist").innerHTML = ""

  var tx = micboard.transmitters;
  for(let i in dl) {
    let j = dl[i]
    let t
    if (j != 0) {
      t = document.getElementById("column-template").content.cloneNode(true);
      t.querySelector('div.col-sm').id = 'slot-' + tx[j].slot;
      updateViewOnly(t,tx[j])
    }
    else {
      t = document.createElement('div')
      t.className = "col-sm"
    }

    document.getElementById('eslotlist').appendChild(t);
  }
}
