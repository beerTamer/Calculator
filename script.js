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
                const result = evaluateExpression(expression);
                displayResult.textContent = result;
                addToHistory(originalExpression, result);
            } catch (e) {
                displayResult.textContent = e.message; 
            }
        } else if (value === 'back') {
            expression = expression.slice(0, -1);
            displayResult.textContent = '';
        } else if (value === 'pow') {
            const lastNumberMatch = expression.match(/(\d+(\.\d+)?)(?=[+\-*/^]|\s*$)/);
            if (lastNumberMatch) {
                const lastNumber = lastNumberMatch[0];
                expression = expression.replace(new RegExp(`${lastNumber}$`), `${lastNumber}^2`);
            } else {
                expression += '^2';
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
    const code = event.code;
    if (!event.shiftKey && (code.startsWith('Digit') || code.startsWith('Numpad'))) {
        expression += key;
        displayResult.textContent = '';
    } else if (['+', '-', '*', '/', '^'].includes(key)) {
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
            const result = evaluateExpression(expression);
            displayResult.textContent = result;
            addToHistory(originalExpression, result);
        } catch (e) {
            displayResult.textContent = e.message; 
        }
    } else if (key === 'Backspace') {
        expression = expression.slice(0, -1);
        displayResult.textContent = '';
    } else if (key === 'Escape' || key === 'c' || key === 'C' || key === 'с' || key === 'С') {
        expression = '';
        displayResult.textContent = '';
    }

    displayExpression.textContent = expression;
});

function evaluateExpression(expr) {
    expr = expr.replace(/π/g, Math.PI.toString()); 
    const tokens = tokenize(expr);
    const tree = buildExpressionTree(tokens);
    return evaluateTree(tree);
}

function tokenize(expr) {
    const tokens = [];
    let current = '';
    
    for (let char of expr) {
        if (/\s/.test(char)) continue;
        if (/[+\-*/^()]/.test(char)) {
            if (current) tokens.push(current);
            tokens.push(char);
            current = '';
        } else if (char === '.') {
            current += char;
        } else if (!isNaN(parseFloat(char))) {
            current += char;
        }
    }
    if (current) tokens.push(current);
    return tokens;
}

function buildExpressionTree(tokens) {
    let index = 0;

    function parseExpression() {
        let left = parseTerm();

        while (index < tokens.length && ['+', '-'].includes(tokens[index])) {
            const operator = tokens[index++];
            const right = parseTerm();
            left = { left, operator, right };
        }
        return left;
    }

    function parseTerm() {
        let left = parseFactor();

        while (index < tokens.length && ['*', '/', '^'].includes(tokens[index])) {
            const operator = tokens[index++];
            const right = parseFactor();
            left = { left, operator, right };
        }
        return left;
    }

    function parseFactor() {
        if (index >= tokens.length) throw new Error('Недопустимое выражение');

        const token = tokens[index++];

        if (token === '(') {
            const expr = parseExpression();
            if (index >= tokens.length || tokens[index] !== ')') throw new Error('Ожидалась закрывающая скобка');
            index++;
            return expr;
        } else if (!isNaN(parseFloat(token))) {
            return parseFloat(token);
        } else {
            throw new Error(`Неизвестный токен: ${token}`);
        }
    }

    const tree = parseExpression();
    if (index < tokens.length) throw new Error('Недопустимое выражение');
    return tree;
}

function evaluateTree(node) {
    if (typeof node === 'number') return node;

    const left = evaluateTree(node.left);
    const right = evaluateTree(node.right);

    switch (node.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': 
            if (right === 0) throw new Error('Ошибка: деление на ноль');
            return left / right;
        case '^': return Math.pow(left, right);
        default: throw new Error('Неизвестный оператор');
    }
}