export function renderField(obj) {
    switch (obj.type) {
        case "text":
            return renderText(obj)
        case "number":
            return renderNumber(obj)
        case "email":
            return renderEmail(obj)
        case "select":
            return renderSelect(obj)
        case "button":
            return renderButton(obj)
        case "default":
            return renderDefault(obj)
    }
}

function renderText(obj) {
    return renderLabel(obj, (obj) => {
        let field = document.createElement("input")
        field.id = obj.id
        field.type = "text"

        let saved = obj.state[obj.id]
        if (saved != null) {
            field.value = saved
        }

        field.addEventListener("input", (event) => { OnValueUpdated(obj, field) })

        return field
    })
}

function renderNumber(obj) {
    return renderLabel(obj, (obj) => {
        let field = document.createElement("input")
        field.id = obj.id
        field.type = "number"

        let saved = obj.state[obj.id]
        if (saved != null) {
            field.value = saved
        }

        field.addEventListener("input", (event) => { OnValueUpdated(obj, field) })

        return field
    })
}

function renderEmail(obj) {
    return renderLabel(obj, (obj, container) => {
        let _container = container
        if (_container == null) {
            _container = document.createElement("div")
            _container.id = obj.id
        }

        let name = document.createElement("input")
        name.id = obj.id + "_name"
        name.type = "text"
        name.style.display = "inline"

        let name_saved = obj.state[obj.id + "_name"]
        if (name_saved != null) {
            name.value = name_saved
        }

        name.addEventListener("input", (event) => {
            OnValueUpdated({
                id: obj.id + "_name",
                state: obj.state,
            }, name)
        })

        _container.appendChild(name)

        let kukac = document.createElement("p")
        kukac.innerText = "@"
        kukac.style.display = "inline"

        _container.appendChild(kukac)

        let domain = document.createElement("input")
        domain.id = obj.id + "_domain"
        domain.type = "text"
        domain.style.display = "inline"

        let domain_saved = obj.state[obj.id + "_domain"]
        if (domain_saved != null) {
            domain.value = domain_saved
        }

        domain.addEventListener("input", (event) => {
            OnValueUpdated({
                id: obj.id + "_domain",
                state: obj.state,
            }, domain)
        })

        _container.appendChild(domain)

        if (container == null) {
            return _container
        }
    })
}

function renderSelect(obj) {
    return renderLabel(obj, (obj) => {
        let field = document.createElement("select")
        field.id = obj.id

        obj.options.forEach(element => {
            let option = document.createElement("option")
            option.value = element.value
            option.innerText = element.title
            option.selected = obj.state[obj.id] == element.value

            field.appendChild(option)
        });

        field.addEventListener("input", (event) => { OnValueUpdated(obj, field) })

        return field
    })
}

function renderButton(obj) {
    let field = document.createElement("input")
    field.id = obj.id
    field.type = "button"
    field.onclick = obj.onPress
    field.value = obj.label

    return field
}

function renderDefault(obj) {
    return renderLabel(obj, (obj) => {
        let field = document.createElement("div")
        field.id = obj.id

        return field
    })
}

function renderLabel(obj, createFunc) {
    let container
    if (obj.label) {
        container = document.createElement("div")

        let label = document.createElement("p")
        label.for = obj.id
        label.innerText = obj.label
        label.id = "label_" + obj.id

        if (obj.labelOnTop == true) {
            label.style.display = "block"
            label.style.padding = 0
            label.style.margin = 0
        }
        else {
            label.style.display = "inline"
        }

        container.appendChild(label)
    }

    let field = createFunc(obj, container)

    if (container) {
        if (field) {
            container.appendChild(field)
        }

        return container
    }

    return field
}

var formCount = 0
var formFieldsToFormLabel = {}
export function renderForm(form) {
    let _form = document.createElement("div")
    var formState = {}

    // await fetch("http://localhost:8001/forms/" + form.savePath, {
    //     method: "GET",
    //     headers: {
    //         "Access-Control-Allow-Origin" : "*"
    //     }
    // }).then((response) => {
    //     if (!response.ok) {
    //         throw new Error(`HTTP error: ${response.status}`);
    //     }

    //     return response.json();
    // }).then((data) => {
    //     for (const [key, value] of Object.entries(data)) {
    //         formState[key] = value
    //     }
    // }).catch((error) => {
    //     console.log(`Could not fetch verse: ${error}`);
    // });

    if (form.showState) {
        let label = document.createElement("p")
        label.id = "form_state_" + formCount
        label.innerText = "Form state: " + JSON.stringify(formState)
        _form.appendChild(label)
    }

    for (let index = 0; index < form.fields.length; index++) {
        let config = form.fields[index]
        config.labelOnTop = form.labelOnTop
        config.state = formState
        _form.appendChild(renderField(config))

        formFieldsToFormLabel[config.id] = "form_state_" + formCount
    }

    let controls = form.controls
    if (controls) {
        if (controls.onSave) {
            let but = document.createElement("button")
            but.id = "form_onsave"
            but.innerText = "Save"
            but.onclick = () => { controls.onSave(formState) }
            _form.appendChild(but)
        }

        if (controls.onClear) {
            let but = document.createElement("button")
            but.id = "form_onclear"
            but.innerText = "Clear"
            but.onclick = () => {
                controls.onClear(formState)

                for (const [key, value] of Object.entries(formState)) {
                    delete formState[key]
                }

                UpdateFormStateOutput(formState)
            }
            _form.appendChild(but)
        }
    }

    formCount++

    return _form
}

function OnValueUpdated(obj, field) {
    let value = field.value
    obj.state[obj.id] = value
    field.value = value

    UpdateFormStateOutput(obj.state)
}

function UpdateFormStateOutput(state) {
    let output = document.getElementById(formFieldsToFormLabel[Object.entries(state)[0][0]])
    if (output) {
        output.innerText = "Form state: " + JSON.stringify(state)
    }
}