document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('requestBody');
    const lineNumbersEle = document.getElementById('linenumbers');

    textarea.addEventListener('input',
        () => lineNumbersEle.innerHTML = Array.from({ length: textarea.value.split('\n').length }, (_, i) => i + 1)
        .map((lineNumber) => `<div>${lineNumber}</div>`).join(''));
});
