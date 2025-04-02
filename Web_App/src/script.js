const ops = ['¬', '&', '∨', '+', '⊃', '~'];
let func = [];
let truthTableData = [];
let postTableData = [];
let questions = [];
let isTaskFailed = false;
let startTime;

function randomFunc() {
    console.log('randomFunc called');
    let availableOps = [...ops];
    func = [];
    for (let i = 0; i < 3; i++) {
        const idx = Math.floor(Math.random() * availableOps.length);
        func.push(availableOps[idx]);
        availableOps.splice(idx, 1);
    }
    const funcDisplay = document.getElementById('funcDisplay');
    if (funcDisplay) {
        funcDisplay.textContent = `{${func.join(', ')}}`;
    } else {
        console.error('Element with id "funcDisplay" not found');
    }
    console.log('Generated functions:', func);
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
    console.log('truthTable called');
    const inputs = [[1, 1], [1, 0], [0, 1], [0, 0]];
    truthTableData = func.map(op => inputs.map(([x, y]) => boolCalc(op, x, y)));
    console.log('Truth Table Data:', truthTableData);
    renderTruthTable();
}

function setupTruthTableNavigation() {
    const inputs = document.querySelectorAll('#truthTable input');
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            let newIndex = index;

            if (e.key === 'ArrowUp' && row > 0) {
                newIndex = index - 3;
            } else if (e.key === 'ArrowDown' && row < 3) {
                newIndex = index + 3;
            } else if (e.key === 'ArrowLeft' && col > 0) {
                newIndex = index - 1;
            } else if (e.key === 'ArrowRight' && col < 2) {
                newIndex = index + 1;
            }

            if (newIndex !== index) {
                inputs[newIndex].focus();
                e.preventDefault();
            }
        });
    });
}

function setupPostTableNavigation() {
    const inputs = document.querySelectorAll('#postTable input');
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            let newIndex = index;

            if (e.key === 'ArrowUp' && row > 0) {
                newIndex = index - 5;
            } else if (e.key === 'ArrowDown' && row < 2) {
                newIndex = index + 5;
            } else if (e.key === 'ArrowLeft' && col > 0) {
                newIndex = index - 1;
            } else if (e.key === 'ArrowRight' && col < 4) {
                newIndex = index + 1;
            }

            if (newIndex !== index) {
                inputs[newIndex].focus();
                e.preventDefault();
            }
        });
    });
}

function setupQuestionsNavigation() {
    const inputs = document.querySelectorAll('#questions input');
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            let newIndex = index;

            if (e.key === 'ArrowUp' && index > 0) {
                newIndex = index - 1;
            } else if (e.key === 'ArrowDown' && index < inputs.length - 1) {
                newIndex = index + 1;
            }

            if (newIndex !== index) {
                inputs[newIndex].focus();
                e.preventDefault();
            }
        });
    });
}

function restrictTruthTableInput(input) {
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.length > 1) {
            e.target.value = value.slice(0, 1); // Оставляем только первый символ
        }
        if (value !== '0' && value !== '1' && value !== '') {
            e.target.value = ''; // Очищаем поле, если введён недопустимый символ
        }
    });
}

function restrictPostTableInput(input) {
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.length > 1) {
            e.target.value = value.slice(0, 1); // Оставляем только первый символ
        }
        if (value !== '+' && value !== '-' && value !== '') {
            e.target.value = ''; // Очищаем поле, если введён недопустимый символ
        }
    });
}

function renderTruthTable() {
    console.log('renderTruthTable called');
    const table = document.getElementById('truthTable');
    if (!table) {
        console.error('Element with id "truthTable" not found');
        return;
    }
    table.innerHTML = '';
    const headers = ['X', 'Y', ...func.map(op => op === '¬' ? '¬X' : `X ${op} Y`)];
    let thead = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    let tbody = '';
    const inputs = [[1, 1], [1, 0], [0, 1], [0, 0]];
    inputs.forEach(([x, y], rowIdx) => {
        tbody += '<tr>';
        tbody += `<td>${x}</td><td>${y}</td>`;
        func.forEach((_, colIdx) => {
            tbody += `<td><input type="text" id="truth_${rowIdx}_${colIdx}" maxlength="1"></td>`;
        });
        tbody += '</tr>';
    });
    table.innerHTML = thead + tbody;
    setupTruthTableNavigation();
    // Добавляем ограничения на ввод
    document.querySelectorAll('#truthTable input').forEach(input => {
        restrictTruthTableInput(input);
    });
    if (isDevMode) autoFillTruthTable();
    console.log('Table rendered:', table.innerHTML);
}

function renderPostTable() {
    const table = document.getElementById('postTable');
    table.innerHTML = '';
    let thead = '<tr><th></th><th>T0</th><th>T1</th><th>L</th><th>M</th><th>S</th></tr>';
    let tbody = '';
    func.forEach((op, rowIdx) => {
        tbody += `<tr><td>${op}</td>`;
        for (let colIdx = 0; colIdx < 5; colIdx++) {
            tbody += `<td><input type="text" id="post_${rowIdx}_${colIdx}" maxlength="1" placeholder="+/-"></td>`;
        }
        tbody += '</tr>';
    });
    table.innerHTML = thead + tbody;
    setupPostTableNavigation();
    // Добавляем ограничения на ввод
    document.querySelectorAll('#postTable input').forEach(input => {
        restrictPostTableInput(input);
    });
    if (isDevMode) autoFillPostTable();
}

function renderQuestions() {
    const div = document.getElementById('questions');
    if (!div) {
        console.error('Questions div not found');
        return;
    }
    div.innerHTML = '';
    if (questions.length === 0) {
        div.innerHTML = '<p>Все функции удовлетворяют условиям монотонности и самодвойственности!</p>';
        console.log('No questions to display');
        return;
    }
    questions.forEach((q, idx) => {
        let label;
        if (q.type === 'M') {
            label = `Какие пары нарушают монотонность для ${q.op}?`;
        } else if (q.type === 'S') {
            label = `Какие пары показывают, что ${q.op} не самодвойственна?`;
        }
        div.innerHTML += `
            <div class="coefficient-group">
                <p>${label}</p>
                <input type="text" id="q_${idx}" placeholder="${q.type === 'M' || q.type === 'S' ? 'например, 1 2' : ''}" oninput="resetButton(${idx})">
                <button class="check-button" onclick="checkAnswer(${idx})">Проверить</button>
            </div>
        `;
    });
    setupQuestionsNavigation();
    if (isDevMode) autoFillQuestions(); // Автозаполнение в режиме разработчика
    console.log('Rendered questions:', questions);
}

function checkTruthTable() {
    let correct = true;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            const input = document.getElementById(`truth_${row}_${col}`).value.trim();
            if (input !== '0' && input !== '1') {
                correct = false;
                break;
            }
            const expected = truthTableData[col][row];
            if (parseInt(input) !== expected) {
                correct = false;
                break;
            }
        }
        if (!correct) break;
    }
    const btn = document.querySelector('#truthTable + div button');
    if (btn.classList.contains('checked')) return;
    btn.classList.add('checked');
    btn.disabled = true;
    if (correct) {
        btn.textContent = 'Верно';
        btn.classList.add('correct');
        postTable();
        console.log('Post Table Data:', postTableData);
        document.getElementById('postSection').style.display = 'block';
        renderPostTable();
    } else {
        btn.textContent = 'Неверно';
        btn.classList.add('error');
        console.log('Truth table check failed');
        isTaskFailed = true;
        disableAllInputsAndButtons();
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
    const table = truthTableData[func.indexOf(op)];
    const pairs = [];
    if (table[0] < table[1]) pairs.push([1, 2]);
    if (table[0] < table[2]) pairs.push([1, 3]);
    if (table[0] < table[3]) pairs.push([1, 4]);
    if (table[1] < table[2]) pairs.push([2, 3]);
    if (table[1] < table[3]) pairs.push([2, 4]);
    if (table[2] < table[3]) pairs.push([3, 4]);
    return [pairs.length === 0, pairs];
}
function S(op) {
    const table = truthTableData[func.indexOf(op)];
    const pairs = [];
    if (table[0] !== 1 - table[3]) pairs.push([1, 4]);
    if (table[1] !== 1 - table[2]) pairs.push([2, 3]);
    return [pairs.length === 0, pairs];
}

function postTable() {
    postTableData = func.map(op => [T0(op), T1(op), L(op), M(op), S(op)]);
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
    const btn = document.querySelector('#postTable + div button');
    if (btn.classList.contains('checked')) return;
    btn.classList.add('checked');
    btn.disabled = true;
    if (correct) {
        btn.textContent = 'Верно';
        btn.classList.add('correct');
        document.getElementById('questionsSection').style.display = 'block';
        console.log('Showing questions section');
        generateQuestions();
    } else {
        btn.textContent = 'Неверно';
        btn.classList.add('error');
        console.log('Post table check failed');
        isTaskFailed = true;
        disableAllInputsAndButtons();
    }
}

function generateQuestions() {
    questions = [];
    postTableData.forEach((row, idx) => {
        const op = func[idx];
        if (!row[3][0]) {
            questions.push({ op, type: 'M', pairs: row[3][1] });
        }
        if (!row[4][0]) {
            questions.push({ op, type: 'S', pairs: row[4][1] });
        }
    });
    console.log('Generated Questions:', questions);
    renderQuestions();
}

function resetButton(idx) {
    if (isTaskFailed) return;
    const btn = document.querySelector(`#q_${idx} + button`);
    if (btn) {
        btn.textContent = 'Проверить';
        btn.disabled = false;
        btn.classList.remove('correct', 'error');
        console.log(`Button reset for idx=${idx}`);
    }
}

function checkAnswer(idx) {
    if (isTaskFailed) return;

    console.log(`checkAnswer called with idx=${idx}`);
    const inputElement = document.getElementById(`q_${idx}`);
    const btn = document.querySelector(`#q_${idx} + button`);
    if (!inputElement || !btn) {
        console.error(`Input or button not found for idx=${idx}`);
        return;
    }
    const input = inputElement.value.trim();
    const q = questions[idx];
    if (!q) {
        console.error(`Question not found for idx=${idx}`);
        return;
    }
    let isCorrect = false;

    if (q.type === 'M' || q.type === 'S') {
        const inputNumbers = input.split(' ').map(Number).filter(n => !isNaN(n));
        if (inputNumbers.length !== 2) {
            isCorrect = false;
        } else {
            const inputPair = [inputNumbers[0], inputNumbers[1]].sort((a, b) => a - b);
            const expectedPairs = q.pairs.map(pair => pair.sort((a, b) => a - b));
            isCorrect = expectedPairs.some(pair => pair[0] === inputPair[0] && pair[1] === inputPair[1]);
        }
    }

    console.log(`Question: ${q.type} for ${q.op}, Input: ${input}, Expected: ${q.pairs}, isCorrect: ${isCorrect}`);
    if (btn.classList.contains('checked')) return;
    btn.classList.add('checked');
    btn.disabled = true;
    if (isCorrect) {
        btn.textContent = 'Верно';
        btn.classList.remove('error');
        btn.classList.add('correct');
        console.log(`Added 'correct' class to button for idx=${idx}, classList: ${btn.classList}`);
        checkAllAnswered();
    } else {
        btn.textContent = 'Неверно';
        btn.classList.remove('correct');
        btn.classList.add('error');
        console.log(`Added 'error' class to button for idx=${idx}, classList: ${btn.classList}`);
        isTaskFailed = true;
        disableAllInputsAndButtons();
    }
}

function checkAllAnswered() {
    const allCorrect = Array.from(document.querySelectorAll('#questions button')).every(btn => btn.textContent === 'Верно');
    if (allCorrect) {
        const modal = document.getElementById('successModal');
        modal.style.display = 'flex';
        disableAllInputsAndButtons();
    }
}

function disableAllInputsAndButtons() {
    const inputs = document.querySelectorAll('#questions input');
    const buttons = document.querySelectorAll('#questions button');
    inputs.forEach(input => {
        input.disabled = true;
    });
    buttons.forEach(button => {
        button.disabled = true;
    });
}

function restartTask() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    window.location.reload();
}

function finishTask() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    window.location.href = '../public/menu.html';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    startTime = new Date();
    randomFunc();
    truthTable();
});

function exportToPDF() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    console.log('Exporting to PDF...');
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        // Добавляем шрифт DejaVuSans для поддержки кириллицы
        doc.addFileToVFS("DejaVuSans.ttf", dejavuSans);
        doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
        doc.setFont("DejaVuSans");

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Стилизованный фон с рамкой
        doc.setFillColor(255, 255, 255);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'F');
        doc.setDrawColor(57, 101, 45);
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

        // Водяные знаки
        doc.setTextColor(220, 220, 220);
        doc.setFontSize(16);
        const xInc = 30, yInc = 30;
        for (let x = -pageWidth; x < pageWidth * 2; x += xInc) {
            for (let y = -pageHeight; y < pageHeight * 2; y += yInc) {
                doc.text("VERIFIED", x, y, { angle: 45, align: "center" });
            }
        }

        // Основное содержимое
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(25);
        doc.text("Критерий Поста", pageWidth / 2, 30, { align: "center" });
        doc.setLineWidth(0.5);
        doc.line(20, 35, pageWidth - 20, 35);

        // Дата и время
        const now = new Date();
        doc.setFontSize(16);
        doc.text(`Дата и время: ${now.toLocaleDateString()} в ${now.toLocaleTimeString()}`, pageWidth / 2, 45, { align: "center" });

        // Данные пользователя
        const studentFIO = sessionStorage.getItem('studentFIO') || 'Не указано';
        const studentGroup = sessionStorage.getItem('studentGroup') || 'Не указано';
        doc.setFontSize(12);
        doc.text(`ФИО: ${studentFIO}`, 20, 60);
        doc.text(`Группа: ${studentGroup}`, 20, 70);

        // Время выполнения
        const timeSpent = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        doc.text(`Время выполнения: ${minutes} мин. ${seconds} сек.`, 20, 85);

        // Таблица истинности
        if (!func.length || !truthTableData.length) throw new Error('Truth table data is missing');
        const truthHeaders = [['X', 'Y', ...func.map(op => op === '¬' ? '¬X' : `X ${op} Y`)]];
        const truthBody = [[1, 1], [1, 0], [0, 1], [0, 0]].map((row, i) => 
            [row[0], row[1], ...truthTableData.map(col => col[i] ?? 'N/A')]
        );
        doc.autoTable({
            startY: 95,
            head: truthHeaders,
            body: truthBody,
            margin: { left: 20, right: 20 },
            tableWidth: 100,
            styles: { 
                fontSize: 12,
                cellPadding: 3,
                font: "DejaVuSans",
                cellWidth: 'wrap'
            },
            headStyles: { 
                fillColor: [57, 101, 45],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 25 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 }
            }
        });

        // Таблица Поста
        if (!postTableData.length) throw new Error('Post table data is missing');
        const postHeaders = [['', 'T0', 'T1', 'L', 'M', 'S']];
        const postBody = func.map((op, i) => [
            op,
            postTableData[i]?.[0] ? '+' : '-',
            postTableData[i]?.[1] ? '+' : '-',
            postTableData[i]?.[2] ? '+' : '-',
            postTableData[i]?.[3]?.[0] ? '+' : '-',
            postTableData[i]?.[4]?.[0] ? '+' : '-'
        ]);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: postHeaders,
            body: postBody,
            margin: { left: 20, right: 20 },
            tableWidth: 100,
            styles: { 
                fontSize: 12,
                cellPadding: 3,
                font: "DejaVuSans",
                cellWidth: 'wrap'
            },
            headStyles: { 
                fillColor: [57, 101, 45],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 15 },
                2: { cellWidth: 15 },
                3: { cellWidth: 15 },
                4: { cellWidth: 15 },
                5: { cellWidth: 15 }
            }
        });

        // Контрпримеры
        if (questions.length > 0) {
            doc.text("Контрпримеры:", 20, doc.lastAutoTable.finalY + 20);
            questions.forEach((q, i) => {
                const text = `${i + 1}. ${q.op} (${q.type === 'M' ? 'Монотонность' : 'Самодвойственность'}): ${q.pairs.map(p => p.join('-')).join(', ')}`;
                doc.text(text, 20, doc.lastAutoTable.finalY + 30 + i * 10, { maxWidth: 170 });
            });
        }

        doc.save(`${studentGroup}_${studentFIO}_Критерий_Поста.pdf`);
        console.log('PDF exported successfully');
    } catch (error) {
        console.error('Error exporting PDF:', error.message);
        alert('Ошибка при экспорте в PDF: ' + error.message);
    }
}