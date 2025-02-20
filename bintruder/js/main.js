//#region Dependencies
import { rawRequest } from "./dependencies.js"
import { renderForm } from "./field.js"
import { openPopup } from "./popup.js"
//#endregion

const requestBody = document.getElementById("requestBody")
const selectedPositionPanel = document.getElementById("selectedPositionPanel")
selectedPositionPanel.style.display = "none"

const selectedPosition = document.getElementById("selectedPosition")
selectedPosition.onchange = () => {
    UpdatePayloadForPosition()
}

function UpdatePayloadForPosition() {
    let position = selectedPosition.value
    if (position == "") { return }

    let data = argsToData[position]
    if (data) {
        SwitchPayloadConfig(null, data.type)
        payloadType.value = data.type
        return
    }

    argsToData[position] = { type: payloadType.value, data: null }
    SwitchPayloadConfig(null, payloadType.value)
}

let currentRequest = ""
let args = []
let argsToData = []

const target = document.getElementById("target")
target.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        UpdateRequest(e.target.value)
    }
    else if (e.key == "") {

    }
})

document.getElementById("addParam").onclick = function () {
    let text = window.getSelection().toString();
    if (text == "") { return; }
    if (args.includes(text.replaceAll("$", ""))) {
        alert("Ilyen nevű paraméter már van!");
        return;
    }

    let start = requestBody.value.indexOf(text);
    if (start == -1) { return; }

    let final = requestBody.value.slice(0, start) + "$" + text + "$" + requestBody.value.slice(start + text.length);
    currentRequest = final
    args.push(text);

    if (IsInClusterMode()) {
        UpdatePayloadForPosition()
        AddPositionToDropdown(text)
    }

    UpdateRequest();
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
    iteration = -1

    Start(data) {
        let list = data || document.getElementById("importedList").value
        if (list == "") {
            return false
        }

        this.list = list.replaceAll("\r", "").split("\n")

        this.maxIter = this.list.length
        if (!IsInClusterMode()) {
            this.maxIter = this.maxIter * args.length
        }

        return true
    }

    GetDataNext() {
        this.iteration++
        return { value: this.list[this.iteration % this.list.length], stop: this.iteration >= this.maxIter - 1 }
    }

    GetDataCurrent() {
        let index = this.iteration
        if (index == -1) {
            index = 0
        }

        return { value: this.list[index % this.list.length], stop: index >= this.maxIter - 1 }
    }

    GetPosition() {
        return Math.floor(this.iteration / this.list.length)
    }

    Reset() {
        this.iteration = -1
    }
}

class BruteForcerPayload {
    iteration = -1

    Start(data) {
        let charset, min, max
        if (data) {
            charset = data.value
            min = data.value
            max = data.value
        }
        else {
            charset = document.getElementById("charset").value
            min = document.getElementById("minLength").value
            max = document.getElementById("maxLength").value
        }

        if (charset == "" || min == "" || max == "") {ú
            return false
        }

        this.charset = charset
        this.min = min
        this.max = max

        let maxIter = 0
        let charCount = charset.length
        for (let index = min; index <= max; index++) {
            maxIter += Math.pow(charCount, index)
        }

        this.maxIter = maxIter * args.length

        return true
    }

    GetDataNext() {
        this.iteration++
        return { value: this.charset, stop: this.iteration >= this.maxIter - 1 }
    }

    GetDataCurrent() {
        let index = this.iteration
        if (index == -1) {
            index = 0
        }

        return { value: this.charset, stop: index >= this.maxIter - 1 }
    }

    GetPosition() {
        return Math.floor(this.iteration / this.maxIter)
    }

    Reset() {
        this.iteration = -1
    }
}

class SniperAttack {
    Setup() {
        this.payload = new payloadClasses[payloadType.value]
        return this.payload.Start()
    }

    SendRequest() {
        let data = this.payload.GetDataNext()
        let position = this.payload.GetPosition()
        let arg = args[position]
        let start = currentRequest.search(arg) - 1
        let value = data.value
        let req = currentRequest.splice(start, 1, value).splice(start + value.length, arg.length + 1, "").replaceAll("$", "")

        return { stop: data.stop, request: req }
    }
}

class ClusterBombAttack {
    Setup() {
        this.payloads = []
        this.currentPayloadIndex = 0

        for ( const [position, data] of Object.entries( argsToData ) ) {
            let payload = new payloadClasses[data.type]
            if (payload.Start(data.data)) {
                this.payloads.push({ position: position, payload: payload})
            }
            else {
                return false
            }
        }

        return true
    }

    SendRequest() {
        let req = currentRequest
        let stop = false
        for (let index = 0; index < this.payloads.length; index++) {
            let isCurrent = index == this.currentPayloadIndex
            let payloadData = this.payloads[index]
            let payload = payloadData.payload
            let data
            if (isCurrent) {
                data = payload.GetDataNext()
            }
            else {
                data = payload.GetDataCurrent()
            }

            let arg = payloadData.position
            let start = req.search(arg) - 1
            let value = data.value
            req = req.splice(start, 1, value).splice(start + value.length, arg.length + 1, "")
            
            if (data.stop && isCurrent) {
                this.currentPayloadIndex++
                // payload.Reset()
                // this.payloads.forEach(element => {
                //     element.payload.Reset()
                // });

                stop = this.currentPayloadIndex >= this.payloads.length
            }
        }

        req.replaceAll("$", "")

        return { stop: stop, request: req }
    }
}

const payloadClasses = {
    0: SimpleListPayload,
    2: BruteForcerPayload
}

const attackClasses = {
    0: SniperAttack,
    3: ClusterBombAttack
}

let attackQueue = []
const startButton = document.getElementById("startAttack")
const attackType = document.getElementById("attackType")
startButton.onclick = async function () {
    if (currentRequest == "") { return }

    let attack = new attackClasses[attackType.value]
    if (!attack.Setup()) {
        return
    }

    while (true) {
        let data = attack.SendRequest()
        console.log(data)
        openPopup({
            payload: "jhdgjd",
            status: 69,
            response: "kaka"
        }, data.request)

        if (data.stop) {
            break
        }
    }

    console.log("done")
}
//#endregion


//#region Attack select functions
attackType.onchange = () => {
    let type = attackType.value
    argsToData = []

    if (type == 3) {
        selectedPosition.innerHTML = ""

        args.forEach(element => {
            AddPositionToDropdown(element)
        })

        UpdatePayloadForPosition()
    }

    selectedPositionPanel.style.display = type == 3 ? "block" : "none"
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
                    let result = event.target.result
                    if (IsInClusterMode()) {
                        argsToData[selectedPosition.value].data = result
                        document.getElementById("importedList").enabled = false
                    }
                    
                    document.getElementById("importedList").value = result
                });
            });

            let list = document.getElementById("importedList")
            if (IsInClusterMode()) {
                let data = argsToData[selectedPosition.value].data
                if (data) {
                    list.enabled = false
                    list.value = data
                    return
                }
            }

            list.value = ""
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

            let charset = "abcd" //efghijklmnopqrstuvwxyz
            let min = 4
            let max = 4 //8
            document.getElementById("charset").value = charset
            document.getElementById("minLength").value = min
            document.getElementById("maxLength").value = max

            if (IsInClusterMode()) {
                argsToData[selectedPosition.value].data = [
                    charset = charset,
                    min = min,
                    max = max
                ]
            }
        }
    }
}

const payloadConfig = document.getElementById("payloadConfig")
const payloadType = document.getElementById("payloadType")

function SwitchPayloadConfig(event, value) {
    if (!value) {
        value = payloadType.value
    }

    payloadConfig.innerText = ""
    let config = payloadFormConfigs[value]
    if (config == null) { return }

    let form = renderForm(config)
    payloadConfig.appendChild(form)
    config.setup(form, config)

    if (IsInClusterMode()) {
        let data = argsToData[selectedPosition.value]
        if (!data || data.type != value) {
            argsToData[selectedPosition.value] = { type: value, data: null }
        }
    }
}

payloadType.onchange = SwitchPayloadConfig
SwitchPayloadConfig() //init
//#endregion



//#region Util
function IsInClusterMode() {
    return attackType.value == 3
}

function AddPositionToDropdown(position) {
    let option = document.createElement("option")
    option.innerText = position
    option.value = position

    selectedPosition.appendChild(option)
}
//#endregion