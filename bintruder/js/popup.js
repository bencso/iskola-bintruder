export function openPopup(attackList,requestBodyText) {
    const height = 800;
    const width = 500;
    const popupWindow = window.open("", "_blank", `height=${height}, width=${width}`, false);

    popupWindow.document.body.style.resize = "none";
    
    popupWindow.document.body.style.backgroundColor = "#f9f9f9";
    const cssFile = document.createElement("link");
    cssFile.rel = "stylesheet";
    cssFile.type = "text/css";
    cssFile.href = "css/popup.css";
    popupWindow.document.head.appendChild(cssFile);
    popupWindow.document.title = "Attack result";
    popupWindow.moveTo((window.screen.width - width) / 2, (window.screen.height - height) / 2);

    const headerDiv = document.createElement("div");
    headerDiv.className = "header";
    const title = document.createElement("h3");
    title.textContent = "Attack result";


    const table = document.createElement("table");

    const headers = ["#", "payload", "status", "response"];
    const headerRow = document.createElement("tr");
    
    headers.forEach(headerText => {
        const header = document.createElement("th");
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    
    table.appendChild(headerRow);

    let data = [];

    attackList.forEach((item, index) => {
        data.push({
            number: index + 1,
            payload: item.payload,
            status: item.status,
            response: item.response
        });
    });

    data.forEach(item => {
        const row = document.createElement("tr");
        const numberCell = document.createElement("td");
        const payloadCell = document.createElement("td");
        const statusCell = document.createElement("td");
        const responseCell = document.createElement("td");
        
        numberCell.textContent = item.number;
        payloadCell.textContent = item.payload;
        statusCell.textContent = item.status;
        responseCell.textContent = item.response;
        
        if (item.status === "200") {
            row.classList.add("success");
        }
        
        row.appendChild(numberCell);
        row.appendChild(payloadCell);
        row.appendChild(statusCell);
        row.appendChild(responseCell);
        
        table.appendChild(row);
    });
    
    const requestBody = document.createElement("textarea");
    requestBody.className = "request-body";
    requestBody.textContent = requestBodyText;
    requestBody.disabled = true;
    
    
    headerDiv.appendChild(title);
    popupWindow.document.body.appendChild(headerDiv);
    popupWindow.document.body.appendChild(table);
    popupWindow.document.body.appendChild(requestBody);
}
