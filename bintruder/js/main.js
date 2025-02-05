//#region Dependencies
import { rawRequest } from "./dependencies.js"
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


//#region Start attack
class SimpleListPayload {
    iteration = 0

    Start() {
        let list = document.getElementById("importedList").value
        if (list == "") {
            return false
        }

        this.list = list.split("\n")

        return true
    }

    async SendRequest() {
        //let position = this.iteration % this.list.length

        let arg = this.list[this.iteration]
        
        let req = currentRequest
        args.forEach(element => {
            let start = req.search(element) - 1
            req = req.splice(start, 1, arg).splice(start + arg.length, element.length + 1, "")
        });

        console.log(req)
        this.iteration++
        return this.iteration >= this.list.length
    }
}

const payloadClasses = {
    0: SimpleListPayload
}

let attackQueue = []
const startButton = document.getElementById("startAttack")
startButton.onclick = function () {
    if (currentRequest == "") { return }

    let payload = new payloadClasses[payloadType.value]
    if (!payload.Start()) {
        return
    }

    while (true) {
        if (payload.SendRequest() == true) {
            break
        }
    }
}
//#endregion


//#region Attack select functions
document.getElementById("attackType").onchange = () => {
    let type = document.getElementById("attackType").value
    console.log(type)
}
//#endregion

//#region Payload select functions
const payloadFormConfigs = {
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
            },
            {
                id: "importedList",
                type: "textarea",
                label: "List:",
                labelOnTop: true
            }
        ],
        setup: (form) => {
            form.className = "simpleListForm"

            let dialog = document.getElementById("loadList_fileDialog")
            dialog.style.display = "none"
            dialog.setAttribute("multiple", false)
            dialog.setAttribute("accept", ".txt")

            document.getElementById("importedList").rows = 10

            //https://web.dev/articles/read-files
            dialog.addEventListener('change', (event) => {
                let reader = new FileReader()
                reader.readAsText(event.target.files[0])
                reader.addEventListener('load', (event) => {
                    document.getElementById("importedList").value = event.target.result
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
const payloadType = document.getElementById("payloadType")

function SwitchPayloadConfig() {
    payloadConfig.innerHTML = ""
    let config = payloadFormConfigs[payloadType.value]
    if (config == null) { return }

    let form = renderForm(config)
    payloadConfig.appendChild(form)
    config.setup(form, config)
}

payloadType.onchange = SwitchPayloadConfig
SwitchPayloadConfig() //init
//#endregion