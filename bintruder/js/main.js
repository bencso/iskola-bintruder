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

document.getElementById("requestBody").addEventListener("mouseup", function () {
    let text = window.getSelection().toString().trim();
    if (text == "") { return; }
    if (args.includes(text)) {
        alert("Ilyen nevű paraméter már van!");
        return;
    }

    let requestBody = document.getElementById("requestBody");
    let start =requestBody.innerText.replaceAll("\n\n", "\n").indexOf(text);
    if (start == -1) { return; }

    let final = requestBody.innerText.replaceAll("\n\n", "\n").slice(0, start) + "$" + text + "$" + requestBody.innerText.replaceAll("\n\n", "\n").slice(start + text.length)
    currentRequest = final
    args.push(text);

    UpdateRequest();
});

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
    requestBody.innerText = currentRequest
}


//#region Start attack
class SimpleListPayload {
    iteration = -1

    Start() {
        let list = document.getElementById("importedList").value
        if (list == "") {
            return false
        }

        this.list = list.split("\n")

        return true
    }

    GetData() {
        this.iteration++
        return { value: this.list[this.iteration % this.list.length], stop: this.iteration >= (this.list.length) * args.length - 1 }
    }
}

class SniperAttack {
    constructor(payload) {
        this.payload = payload
    }

    async SendRequest() {
        let data = this.payload.GetData()
        let position = Math.floor(this.payload.iteration / this.payload.list.length)
        let arg = args[position]
        let start = currentRequest.search(arg) - 1
        let value = data.value
        let req = currentRequest.splice(start, 1, value).splice(start + value.length, arg.length + 1, "").replaceAll("$", "")

        console.log(req)

        return data.stop
    }
}

class ClusterBombAttack {
    constructor(payload) {
        this.payload = payload
    }

    async SendRequest() {
        return true
    }
}

const payloadClasses = {
    0: SimpleListPayload
}

const attackClasses = {
    0: SniperAttack,
    3: ClusterBombAttack
}

let attackQueue = []
const startButton = document.getElementById("startAttack")
startButton.onclick = async function () {
    if (currentRequest == "") { return }

    let payload = new payloadClasses[payloadType.value]
    if (!payload.Start()) {
        return
    }

    let attack = new attackClasses[document.getElementById("attackType").value](payload)
    while (true) {
        if (await attack.SendRequest() == true) {
            break
        }
    }

    console.log("done")
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
                    document.getElementById("importedList").value = ""
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
    payloadConfig.innerText = ""
    let config = payloadFormConfigs[payloadType.value]
    if (config == null) { return }

    let form = renderForm(config)
    payloadConfig.appendChild(form)
    config.setup(form, config)
}

payloadType.onchange = SwitchPayloadConfig
SwitchPayloadConfig() //init
//#endregion