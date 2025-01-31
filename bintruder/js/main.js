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

//https://stackoverflow.com/a/4314050
if (!String.prototype.splice) {
    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function (start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
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

document.getElementById("addParam").onclick = function () {
    let select = window.getSelection()
    let text = select.toString()

    if (text == "") { return }
    if (args.includes(text)) {
        alert("Ilyen nevű paraméter már van!")
        return
    }

    let start = requestBody.value.search(text)
    console.log(start)
    if (start == -1) { return }

    let final = requestBody.value.splice(start, 0, "$").splice(start + text.length + 1, 0, "$")
    currentRequest = final
    args.push(text)

    UpdateRequest()
}

document.getElementById("removeParams").onclick = function () {
    args = []
    currentRequest = ""
    UpdateRequest()
}

function UpdateRequest(value) {
    if (value == null) {
        value = target.value
    }

    if (currentRequest == "") {
        currentRequest = "GET / HTTP/1.1\nHost: " + value
    }

    requestBody.disabled = false
    requestBody.value = currentRequest
}

const startButton = document.getElementById("startAttack")
startButton.onclick = function () {
    console.log("start")
}

//#region Attack select functions
document.getElementById("attackType").onchange = () => {
    let type = document.getElementById("attackType").value
    console.log(type)
}
//#endregion

//#region Payload select functions
let payloadFormConfigs = {
    0: {
        fields: [
            {
                id: "loadList",
                type: "button",
                label: "Load ...",
                onPress: () => {
                    document.getElementById("loadList_fileDialog").click()
                }
            },
            {
                id: "loadList_fileDialog",
                type: "file"
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

            let dialog = document.getElementById("loadList_fileDialog")
            dialog.style.display = "none"
            dialog.setAttribute("multiple", false)
            dialog.setAttribute("accept", ".txt")

            //https://web.dev/articles/read-files
            dialog.addEventListener('change', (event) => {
                let reader = new FileReader()
                reader.readAsDataURL(event.target.files[0])
                reader.addEventListener('load', (event) => {
                    console.log(event.target.result)
                });
            });
        }
    },
    2: {
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