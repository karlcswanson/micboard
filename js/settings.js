"use strict"

import { ActivateMessageBoard } from './script.js'
import JSONEditor from '@json-editor/json-editor'
import '../node_modules/@json-editor/json-editor/dist/css/jsoneditor.min.css'


export function settingsView(configin) {
  console.log(configin)
  $('#micboard').hide();
  $('.settings').show();
  let editor_div = document.getElementById('editor_holder')
  editor_div.innerHTML = ''

  var editor = new JSONEditor(editor_div,{
        // Enable fetching schemas via ajax
        ajax: false,
        theme: 'bootstrap4',

        // The schema for the editor
        schema: {
          "title": " ",
          "type" : "object",
          // "format": "categories",
          "options" : {
            "disable_properties": true,
            "disable_edit_json" : true,
            "disable_collapse": true
          },
          "properties" : {
            "port" : {
              "title": "Server Port",
              "type" : "integer"
            },
            "prefixes": {
              "type": "array",
              "title" : "Prefixes",
              "format" : "table",
              "items" : {
                "title" : "prefix",
                "type" : "string"
              },
              "options" : {
                "collapsed" : true,
                "disable_array_delete_last_row": true,
                "disable_array_delete_all_rows": true,
                "disable_array_reorder": true
              }
            },
            "slots": {
              "title" : "Receivers",
              "type" : "array",
              "format" : "table",
              "options" : {
                "collapsed" : true,
                "disable_array_delete_last_row": true,
                "disable_array_delete_all_rows": true,
                "disable_array_reorder": true
              },
              "items" : {
                "title" : "receiver",
                "type" : "object",
                "properties" : {
                  "slot" : {
                    "type" : "integer"
                  },
                  "ip" : {
                    "type" : "string"
                  },
                  "type" : {
                    "type" : "string",
                    "enum" : ["uhfr","qlxd","ulxd","axtd"]
                  },
                  "channel" : {
                    "type" : "integer",
                    "enum" : [1,2,3,4]
                  }
                }
              }

            },
            "groups" : {
              "type" : "array",
              "title": "Display Groups",
              "format" :"table",
              "options" : {
                "collapsed" : true,
                "disable_array_delete_last_row": true,
                "disable_array_delete_all_rows": true,
                "disable_array_reorder": true
              },
              "items" : {
                "type" : "object",
                "title" : "display group",
                "properties": {
                  "title" : {
                    "type" : "string"
                  },
                  "group" : {
                    "type" : "integer",
                    "enum" : [1,2,3,4,5,6,7,8,9]
                  },
                  "slots" : {
                    "type" : "array",
                    "format" : "table",
                    "items": {
                      "title": "slot",
                      "type" : "integer"
                    },
                    "options" : {
                      "disable_array_delete_last_row": true,
                      "disable_array_delete_all_rows": true
                    }
                  }
                }
              }
            }
          }
        },
        startval: configin
      });

  document.getElementById('save').addEventListener('click',function() {
    sendSettings(editor.getValue())
  });

  document.getElementById('download').addEventListener('click',function() {
    var a = document.createElement("a")
    console.log(configin)
    var file = new Blob([JSON.stringify(configin)], {type: 'application/json'})
    a.href = URL.createObjectURL(file)
    a.download = 'config.json'
    a.click()
  });
}



function sendSettings(settings) {
  var uri = "/settings";
  var xhr = new XMLHttpRequest()
  xhr.open("POST", uri, true)
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var eb = document.getElementsByClassName('message-board')[0]
      const h1 = 'Settings Saved'
      const p = 'Restart the micboard server and reload the page'
      ActivateMessageBoard(h1,p)
      console.log(xhr.responseText)
    }
  };
  xhr.send(JSON.stringify(settings))
}
