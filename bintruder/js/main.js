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

const startButton = document.getElementById("startAttack")
startButton.onclick = function() {
    console.log("start")
}

//#region Attack select functions
document.getElementById("attackType").onchange = () =>  {
    let type = document.getElementById("attackType").value
    console.log(type)
}
//#endregion

//#region Payload select functions
let payloadFormConfigs = {
    0 : {
        fields: [
            {
                id: "loadList",
                type: "button",
                label: "Load ...",
                onPress: () => {
                    console.log("Load list")
                }
            },
            {
                id: "clearList",
                type: "button",
                label: "Clear",
                onPress: () => {
                    console.log("Clear list")
                }
            }
        ],
        setup: (form) => {
            form.className = "simpleListForm"
        }
    },
    2 : {
        fields: [
            {
                id: "charset",
                type: "text",
                label: "Character set: ",
            },
            {
                id: "minLength",
                type: "number",
                label: "Minimum length: ",
            },
            {
                id: "maxLength",
                type: "number",
                label: "Maximum length: ",
            }
        ],
        setup: (form, config) => {
            config.fields.forEach(element => {
                let label = document.getElementById("label_" + element.id)
                label.style.display = "block"
                label.style.margin = "0"
            });

            document.getElementById("charset").value = "abcdefghijklmnopqrstuvwxyz"
            document.getElementById("minLength").value = "4"
            document.getElementById("maxLength").value = "8"
        }
    }
}

const payloadConfig = document.getElementById("payloadConfig")

function SwitchPayloadConfig() {
    payloadConfig.innerHTML = ""
    let config = payloadFormConfigs[document.getElementById("payloadType").value]
    if (config == null) { return }

    let form = renderForm(config)
    payloadConfig.appendChild(form)
    config.setup(form, config)
}

document.getElementById("payloadType").onchange = SwitchPayloadConfig
SwitchPayloadConfig() //init
//#endregion