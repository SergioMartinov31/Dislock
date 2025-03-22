const ops = ['¬', '&', '∨', '+', '⊃', '~'];
let func = [];
let truthTableData = [];
let postTableData = [];
let questions = [];

function randomFunc() {
    let availableOps = [...ops];
    func = [];
    for (let i = 0; i < 3; i++) {
        const idx = Math.floor(Math.random() * availableOps.length);
        func.push(availableOps[idx]);
        availableOps.splice(idx, 1);
    }
    document.getElementById('funcDisplay').textContent = `{${func.join(', ')}}`;
}

function boolCalc(op, x, y) {
    if (op === '¬') return !x ? 1 : 0;
    if (op === '&') return x && y ? 1 : 0;
    if (op === '∨') return x || y ? 1 : 0;
    if (op === '+') return (x !== y) ? 1 : 0;
    if (op === '⊃') return (!x || y) ? 1 : 0;
    if (op === '~') return (x === y) ? 1 : 0;
}

function truthTable() {
    const inputs = [[1, 1], [1, 0], [0, 1], [0, 0]];
    truthTableData = func.map(op => inputs.map(([x, y]) => boolCalc(op, x, y)));
    renderTruthTable();
}

function renderTruthTable() {
    const table = document.getElementById('truthTable');
    table.innerHTML = '';
    const headers = ['X', 'Y', ...func.map(op => op === '¬' ? '¬X' : `X ${op} Y`)];
    let thead = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    let tbody = '';
    const inputs = [[1, 1], [1, 0], [0, 1], [0, 0]];
    inputs.forEach(([x, y], rowIdx) => {
        tbody += '<tr>';
        tbody += `<td>${x}</td><td>${y}</td>`;
        func.forEach((_, colIdx) => {
            tbody += `<td><input type="number" min="0" max="1" id="truth_${rowIdx}_${colIdx}"></td>`;
        });
        tbody += '</tr>';
    });
    table.innerHTML = thead + tbody;
}

function checkTruthTable() {
    let correct = true;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            const input = document.getElementById(`truth_${row}_${col}`).value;
            if (input === '' || parseInt(input) !== truthTableData[col][row]) {
                correct = false;
                break;
            }
        }
    }
    const btn = document.querySelector('#truthTable + button');
    if (correct) {
        btn.textContent = 'Верно';
        btn.disabled = true;
        btn.classList.add('correct');
        postTable();
        console.log('Post Table Data:', postTableData);
        document.getElementById('postSection').style.display = 'block';
        renderPostTable();
    } else {
        btn.textContent = 'Неверно';
        btn.classList.add('error');
        setTimeout(() => btn.classList.remove('error'), 1000);
    }
}

function T0(op) { return boolCalc(op, 0, 0) === 0; }
function T1(op) { return boolCalc(op, 1, 1) === 1; }
function zhegalkin(op) {
    const f = truthTableData[func.indexOf(op)];
    const a = f[3];
    const b = f[3] ^ f[1];
    const c = f[3] ^ f[2];
    const d = f[3] ^ f[1] ^ f[2] ^ f[0];
    return [a, b, c, d];
}
function L(op) { return zhegalkin(op)[3] === 0; }
function M(op) {
    const table = truthTableData[func.indexOf(op)]; // [f(1,1), f(1,0), f(0,1), f(0,0)]
    const pairs = [];
    if (table[0] < table[1]) pairs.push([1, 2]); // (1,1) < (1,0)
    if (table[0] < table[2]) pairs.push([1, 3]); // (1,1) < (0,1)
    if (table[0] < table[3]) pairs.push([1, 4]); // (1,1) < (0,0)
    if (table[1] < table[2]) pairs.push([2, 3]); // (1,0) < (0,1)
    if (table[1] < table[3]) pairs.push([2, 4]); // (1,0) < (0,0)
    if (table[2] < table[3]) pairs.push([3, 4]); // (0,1) < (0,0)
    return [pairs.length === 0, pairs];
}
function S(op) {
    const table = truthTableData[func.indexOf(op)]; // [f(1,1), f(1,0), f(0,1), f(0,0)]
    const pairs = [];
    if (table[0] !== 1 - table[3]) pairs.push([1, 4]); // f(1,1) ≠ ¬f(0,0)
    if (table[1] !== 1 - table[2]) pairs.push([2, 3]); // f(1,0) ≠ ¬f(0,1)
    return [pairs.length === 0, pairs];
}

function postTable() {
    postTableData = func.map(op => [T0(op), T1(op), L(op), M(op), S(op)]);
}

function renderPostTable() {
    const table = document.getElementById('postTable');
    table.innerHTML = '';
    let thead = '<tr><th></th><th>T0</th><th>T1</th><th>L</th><th>M</th><th>S</th></tr>';
    let tbody = '';
    func.forEach((op, rowIdx) => {
        tbody += `<tr><td>${op}</td>`;
        for (let colIdx = 0; colIdx < 5; colIdx++) {
            tbody += `<td><input type="text" id="post_${rowIdx}_${colIdx}" placeholder="+/-"></td>`;
        }
        tbody += '</tr>';
    });
    table.innerHTML = thead + tbody;
}

function checkPostTable() {
    let correct = true;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
            const input = document.getElementById(`post_${row}_${col}`).value;
            const expected = col >= 3 ? postTableData[row][col][0] : postTableData[row][col];
            const isTrue = input === '+' && expected || input === '-' && !expected;
            console.log(`Row ${row}, Col ${col}: Input=${input}, Expected=${expected}, isTrue=${isTrue}`);
            if (input !== '+' && input !== '-' || !isTrue) {
                correct = false;
                break;
            }
        }
    }
    const btn = document.querySelector('#postTable + button');
    if (correct) {
        btn.textContent = 'Верно';
        btn.disabled = true;
        btn.classList.add('correct');
        document.getElementById('questionsSection').style.display = 'block';
        generateQuestions();
    } else {
        btn.textContent = 'Неверно';
        btn.classList.add('error');
        setTimeout(() => btn.classList.remove('error'), 1000);
    }
}

function generateQuestions() {
    questions = [];
    postTableData.forEach((row, idx) => {
        const op = func[idx];
        if (!row[0]) { // Не сохраняет 0
            questions.push({ op, type: 'T0', value: boolCalc(op, 0, 0) });
        }
        if (!row[1]) { // Не сохраняет 1
            questions.push({ op, type: 'T1', value: boolCalc(op, 1, 1) });
        }
        if (!row[3][0]) { // Не монотонна
            questions.push({ op, type: 'M', pairs: row[3][1] });
        }
        if (!row[4][0]) { // Не самодвойственна
            questions.push({ op, type: 'S', pairs: row[4][1] });
        }
    });
    console.log('Generated Questions:', questions);
    renderQuestions();
}

function renderQuestions() {
    const div = document.getElementById('questions');
    div.innerHTML = '';
    if (questions.length === 0) {
        div.innerHTML = '<p>Ты справился!</p>';
        return;
    }
    questions.forEach((q, idx) => {
        let label;
        if (q.type === 'T0') {
            label = `Функция ${q.op} не сохраняет 0. Какое значение она принимает при (0,0)? (введите 0 или 1)`;
        } else if (q.type === 'T1') {
            label = `Функция ${q.op} не сохраняет 1. Какое значение она принимает при (1,1)? (введите 0 или 1)`;
        } else if (q.type === 'M') {
            label = `Какие пары нарушают монотонность для ${q.op}? (введите номера строк через пробел, например, "3 1" для (0,1)>(1,1))`;
        } else if (q.type === 'S') {
            label = `Какие пары показывают, что ${q.op} не самодвойственна? (введите номера строк через пробел, например, "1 4" для (1,1)-(0,0))`;
        }
        div.innerHTML += `
            <div>
                <p>${label}</p>
                <input type="text" id="q_${idx}" placeholder="${q.type === 'T0' || q.type === 'T1' ? '0 или 1' : 'например, 3 1'}">
                <button onclick="checkAnswer(${idx})">Проверить</button>
            </div>
        `;
    });
}

function checkAnswer(idx) {
    const input = document.getElementById(`q_${idx}`).value.trim();
    const q = questions[idx];
    const btn = document.querySelector(`#q_${idx} + button`);
    let isCorrect = false;

    if (q.type === 'T0' || q.type === 'T1') {
        const expected = q.value;
        isCorrect = parseInt(input) === expected && (input === '0' || input === '1');
    } else if (q.type === 'M' || q.type === 'S') {
        // Разбиваем ввод пользователя на числа (ожидаем ровно 2 числа для одной пары)
        const inputNumbers = input.split(' ').map(Number).filter(n => !isNaN(n));
        if (inputNumbers.length !== 2) {
            isCorrect = false; // Пользователь должен ввести ровно 2 числа
        } else {
            // Формируем введённую пару и сортируем её для единообразия
            const inputPair = [inputNumbers[0], inputNumbers[1]].sort((a, b) => a - b);

            // Сортируем ожидаемые пары внутри для единообразия
            const expectedPairs = q.pairs.map(pair => pair.sort((a, b) => a - b));

            // Проверяем, есть ли введённая пара в списке ожидаемых пар
            isCorrect = expectedPairs.some(pair => pair[0] === inputPair[0] && pair[1] === inputPair[1]);
        }
    }
}

// Инициализация
randomFunc();
truthTable();