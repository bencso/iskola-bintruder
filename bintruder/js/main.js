//#region Dependencies
// https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

import { renderForm } from "./field.js"
//#endregion

const requestBody = document.getElementById("requestBody")
let currentRequest = ""
let args = []

const target = document.getElementById("target")
target.addEventListener("keydown", (e) => {
    if (e.key != "Enter") { return }

    UpdateRequest(e.target.value)
})

document.getElementById("addParam").onclick = function() {
    let select = window.getSelection()
    let text = select.toString()
   
    if (text == "") { return }
    if (args.includes(text)) {
        alert("Ilyen nevű paraméter már van!")
        return
    }

    currentRequest += "\n{" + text + "}"
    args.push(text)

    UpdateRequest()
}

document.getElementById("removeParams").onclick = function() {
    args = []
    currentRequest = ""
    UpdateRequest()
}

function UpdateRequest(value) {
    if (value == null) {
        value = target.value
    }

    if (currentRequest == "") {
        currentRequest = "GET / HTTP/1.1\nHost: {0}"
    }

    requestBody.value = String.format(currentRequest, value)
}

//#region Attack select functions
function AttackTypeSelected() {
    let type = document.getElementById("attackType").value
    console.log(type)
}
//#endregion

//#region Payload select functions
let payloadFormConfigs = {
    0 : {
        fields: [
            {
                id: "text1",
                type: "text",
                label: "ez itt most az első text",
            }
        ]
    }
}
const payloadConfig = document.getElementById("payloadConfig")

function PayloadTypeSelected() {
    payloadConfig.innerHTML = ""
    let config = payloadFormConfigs[document.getElementById("payloadType").value]
    if (config == null) { return }

    payloadConfig.appendChild(renderForm())
}
//#endregion