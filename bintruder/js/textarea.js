document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('requestBody');
    const lineNumbersEle = document.getElementById('linenumbers');

    const calculateLineNumbers = () => {
        const lines = textarea.value.split('\n').length;
        const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1);

        lineNumbersEle.innerHTML = lineNumbers.map((lineNumber) => `<div>${lineNumber || '&nbsp;'}</div>`).join('');
        lineNumbersEle.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener('input', calculateLineNumbers);
    textarea.addEventListener('blur', () => textarea.value = textarea.value.trim());
});
