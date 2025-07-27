let expression = '';
const displayExpression = document.querySelector('.expression');
const displayResult = document.querySelector('.result');
let history = [];

document.querySelectorAll('.buttons button').forEach(button => {
    button.addEventListener('click', () => {
        const value = button.dataset.value;

        if (value === 'C') {
            expression = '';
            displayResult.textContent = '';
        } else if (value === '=') {
            try {
                const originalExpression = expression;
                const exprToEval = expression
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/π/g, Math.PI.toString());
                const result = eval(exprToEval);
                displayResult.textContent = result;
                addToHistory(originalExpression, result);
            } catch (e) {
                displayResult.textContent = 'Ошибка';
            }
        } else if (value === 'back') {
            expression = expression.slice(0, -1);
            displayResult.textContent = '';
        } else if (value === 'pow') {
            const lastNumber = expression.split(/[\+\-\*\/]/).pop();
            if (lastNumber) {
                const powResult = Math.pow(parseFloat(lastNumber), 2);
                expression = expression.replace(lastNumber, powResult);
            }
            displayResult.textContent = '';
        } else if (value === 'pi') {
            expression += 'π';
            displayResult.textContent = '';
        } else {
            expression += value;
            displayResult.textContent = '';
        }

        displayExpression.textContent = expression;
    });
});

function addToHistory(expr, res) {
    history.unshift({ expression: expr, result: res });
    if (history.length > 10) {
        history.pop();
    }
}

function insertFromHistory(expr) {
    expression = expr;
    displayExpression.textContent = expression;
    displayResult.textContent = '';
    historyModal.classList.remove('active');
}

const historyBtn = document.querySelector('.history-btn');
const historyModal = document.getElementById('history-modal');
const closeBtn = document.querySelector('.close-btn');

historyBtn.addEventListener('click', () => {
    const modalHistoryList = document.getElementById('modal-history-list');
    modalHistoryList.innerHTML = '';
    
    if (history.length === 0) {
        const template = document.getElementById('history-empty-template');
        const li = template.content.cloneNode(true);
        modalHistoryList.appendChild(li);
    } else {
        const template = document.getElementById('history-item-template');
        history.forEach(item => {
            const li = template.content.cloneNode(true);
            li.querySelector('.history-expr').textContent = item.expression;
            li.querySelector('.history-result').textContent = item.result;
            li.querySelector('li').addEventListener('click', () => {
                insertFromHistory(item.expression);
            });
            modalHistoryList.appendChild(li);
        });
    }
    
    historyModal.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    historyModal.classList.remove('active');
});

window.addEventListener('click', (event) => {
    if (event.target === historyModal) {
        historyModal.classList.remove('active');
    }
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/[0-9]/.test(key)) {
        expression += key;
        displayResult.textContent = '';
    } else if (['+', '-', '*', '/'].includes(key)) {
        expression += key;
        displayResult.textContent = '';
    } else if (key === '(' || key === ')') {
        expression += key;
        displayResult.textContent = '';
    } else if (key === '.') {
        expression += key;
        displayResult.textContent = '';
    } else if (key === 'Enter' || key === '=') {
        try {
            const originalExpression = expression;
            const result = eval(expression);
            displayResult.textContent = result;
            addToHistory(originalExpression, result);
        } catch (e) {
            displayResult.textContent = 'Ошибка';
        }
    } else if (key === 'Backspace') {
        expression = expression.slice(0, -1);
        displayResult.textContent = '';
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        expression = '';
        displayResult.textContent = '';
    }

    displayExpression.textContent = expression;
});