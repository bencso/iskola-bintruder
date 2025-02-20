let list = [];
let currentPopup = null;

export function openPopup(attack, requestBodyText) {
    list.push({ attack, requestBodyText });
    if (!currentPopup || currentPopup.closed) {
        showNextPopup();
    }
}

function showNextPopup() {
    if (list.length === 0) {
        return;
    }

    const { attack, requestBodyText } = list.shift();
    console.log(attack,requestBodyText);   

    const height = 800;
    const width = 500;
    currentPopup = window.open("", "_blank", `height=${height}, width=${width}`, false);
    currentPopup.document.body.style.fontFamily = "Arial, sans-serif";
    currentPopup.document.body.style.backgroundColor = "#f9f9f9";
    const cssFile = document.createElement("link");
    cssFile.rel = "stylesheet";
    cssFile.type = "text/css";
    cssFile.href = "css/popup.css";
    currentPopup.document.head.appendChild(cssFile);
    currentPopup.document.title = "Attack result";
    currentPopup.moveTo((window.screen.width - width) / 2, (window.screen.height - height) / 2);

    const headerDiv = document.createElement("div");
    headerDiv.className = "header";
    const title = document.createElement("h3");
    title.textContent = "Attack result"; 
    headerDiv.appendChild(title);


    const table = document.createElement("table");

    const headers = ["#", "payload", "status", "response"];
    const headerRow = document.createElement("tr");

    headers.forEach(headerText => {
        const header = document.createElement("th");
        header.textContent = headerText;
        headerRow.appendChild(header);
    });



    attack.forEach((attack, index) => {
        const row = document.createElement("tr");
        const indexCell = document.createElement("td");
        indexCell.textContent = index + 1;
        row.appendChild(indexCell);

        const payloadCell = document.createElement("td");
        payloadCell.textContent = attack.payload;
        row.appendChild(payloadCell);

        const statusCell = document.createElement("td");
        statusCell.textContent = attack.status;
        row.appendChild(statusCell);

        const responseCell = document.createElement("td");
        responseCell.textContent = attack.response;
        row.appendChild(responseCell);

        table.appendChild(row);
    });

    currentPopup.document.body.appendChild(headerDiv);
    currentPopup.document.body.appendChild(table);

    currentPopup.addEventListener("unload", function () {
        showNextPopup();
    });
}
