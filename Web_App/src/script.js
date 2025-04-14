const ops = ['¬', '&', '∨', '+', '⊃', '~'];
let func = [];
let truthTableData = [];
let postTableData = [];
let questions = [];
let additionalQuestions = [];
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

function setupAdditionalQuestionsNavigation() {
    const inputs = document.querySelectorAll('#additionalQuestions input');
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
            e.target.value = value.slice(0, 1);
        }
        if (value !== '0' && value !== '1' && value !== '') {
            e.target.value = '';
        }
    });
}

function restrictPostTableInput(input) {
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.length > 1) {
            e.target.value = value.slice(0, 1);
        }
        if (value !== '+' && value !== '-' && value !== '') {
            e.target.value = '';
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
    const headers = ['', 'X', 'Y', ...func.map(op => op === '¬' ? '¬X' : `X ${op} Y`)];
    let thead = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    
    let tbody = '';
    const inputs = [[1, 1], [1, 0], [0, 1], [0, 0]];
    
    inputs.forEach(([x, y], rowIdx) => {
        tbody += '<tr>';
        tbody += `<td>${rowIdx + 1}</td><td>${x}</td><td>${y}</td>`;
        
        func.forEach((_, colIdx) => {
            tbody += `<td><input type="text" id="truth_${rowIdx}_${colIdx}" maxlength="1"></td>`;
        });
        
        tbody += '</tr>';
    });
    
    table.innerHTML = thead + tbody;
    setupTruthTableNavigation();
    
    document.querySelectorAll('#truthTable input').forEach(input => {
        restrictTruthTableInput(input);
    });
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
    document.querySelectorAll('#postTable input').forEach(input => {
        restrictPostTableInput(input);
    });
}

function renderQuestions() {
    const div = document.getElementById('questions');
    if (!div) {
        console.error('Questions div not found');
        return;
    }
    div.innerHTML = '';
    questions.forEach((q, idx) => {
        let label;
        if (q.type === 'M') {
            label = `Укажите номера строк из первой таблицы, нарушающих монотонность для ${q.op}`;
        } else if (q.type === 'S') {
            label = `Укажите номера строк из первой таблицы, доказывающих, что ${q.op} не самодвойственна`;
        }
        div.innerHTML += `
            <div class="coefficient-group">
                <p>${label}</p>
                <input type="text" id="q_${idx}" placeholder="${q.type === 'M' || q.type === 'S' ? 'через пробел' : ''}" oninput="resetButton(${idx})">
                <button class="check-button" onclick="checkAnswer(${idx})">Проверить</button>
            </div>
        `;
    });
    setupQuestionsNavigation();
}

function renderAdditionalQuestions() {
    const div = document.getElementById('additionalQuestions');
    if (!div) {
        console.error('Additional questions div not found');
        return;
    }
    div.innerHTML = '';
    additionalQuestions.forEach((q, idx) => {
        div.innerHTML += `
            <div class="coefficient-group">
                <p>Укажите колонку второй таблицы, доказывающую, что ${q.op} нельзя выразить через ${q.otherOps.join(' и ')}</p>
                <input type="text" id="aq_${idx}" placeholder="T0">
                <button class="check-button" onclick="checkAdditionalAnswer(${idx})">Проверить</button>
            </div>
        `;
    });
    document.getElementById('additionalQuestionsSection').style.display = 'block';
    setupAdditionalQuestionsNavigation();
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
        document.getElementById('postSection').style.display = 'block';
        renderPostTable();
    } else {
        btn.textContent = 'Неверно';
        btn.classList.add('error');
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

function checkExpressibility(targetOp, targetIdx, otherOps) {
    const targetPostRow = postTableData[targetIdx];
    const otherPostRows = otherOps.map(op => postTableData[func.indexOf(op)]);

    const columnNames = ['T0', 'T1', 'L', 'M', 'S'];
    const counterExamples = [];

    for (let col = 0; col < 5; col++) {
        const targetProp = col >= 3 ? targetPostRow[col][0] : targetPostRow[col];
        const otherProps = otherPostRows.map(row => col >= 3 ? row[col][0] : row[col]);

        if (otherProps.every(prop => prop === true) && targetProp === false) {
            counterExamples.push(columnNames[col]);
        }
        if (otherProps.every(prop => prop === false) && targetProp === true) {
            counterExamples.push(columnNames[col]);
        }
    }

    return counterExamples;
}

function checkPostTable() {
    let correct = true;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
            const input = document.getElementById(`post_${row}_${col}`).value;
            const expected = col >= 3 ? postTableData[row][col][0] : postTableData[row][col];
            const isTrue = input === '+' && expected || input === '-' && !expected;
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
        generateQuestions();
        generateAdditionalQuestions();
    } else {
        btn.textContent = 'Неверно';
        btn.classList.add('error');
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
    renderQuestions();
}

function generateAdditionalQuestions() {
    additionalQuestions = [];
    func.forEach((op, idx) => {
        const otherOps = func.filter((_, i) => i !== idx);
        const counterExamples = checkExpressibility(op, idx, otherOps);
        if (counterExamples.length > 0) {
            additionalQuestions.push({
                op,
                type: 'E',
                columns: counterExamples,
                otherOps
            });
        }
    });
    if (additionalQuestions.length > 0) {
        renderAdditionalQuestions();
    }
}

function resetButton(idx) {
    if (isTaskFailed) return;
    const btn = document.querySelector(`#q_${idx} + button`);
    if (btn) {
        btn.textContent = 'Проверить';
        btn.disabled = false;
        btn.classList.remove('correct', 'error');
    }
}

function checkAnswer(idx) {
    if (isTaskFailed) return;

    const inputElement = document.getElementById(`q_${idx}`);
    const btn = document.querySelector(`#q_${idx} + button`);
    const input = inputElement.value.trim();
    const q = questions[idx];
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

    if (btn.classList.contains('checked')) return;
    btn.classList.add('checked');
    btn.disabled = true;
    if (isCorrect) {
        btn.textContent = 'Верно';
        btn.classList.remove('error');
        btn.classList.add('correct');
        checkAllAnswered();
    } else {
        btn.textContent = 'Неверно';
        btn.classList.remove('correct');
        btn.classList.add('error');
        isTaskFailed = true;
        disableAllInputsAndButtons();
    }
}

function checkAdditionalAnswer(idx) {
    if (isTaskFailed) return;
    
    const input = document.getElementById(`aq_${idx}`).value.trim().toUpperCase();
    const btn = document.querySelector(`#aq_${idx} + button`);
    const q = additionalQuestions[idx];
    
    const validColumns = ['T0', 'T1', 'L', 'M', 'S'];
    const isCorrect = validColumns.includes(input) && q.columns.includes(input);
    
    if (btn.classList.contains('checked')) return;
    btn.classList.add('checked');
    btn.disabled = true;
    
    if (isCorrect) {
        btn.textContent = 'Верно';
        btn.classList.add('correct');
        checkAllAnswered();
    } else {
        btn.textContent = 'Неверно';
        btn.classList.add('error');
        isTaskFailed = true;
        disableAllInputsAndButtons();
    }
}

function checkAllAnswered() {
    const allCorrect = 
        Array.from(document.querySelectorAll('#questions button')).every(btn => btn.textContent === 'Верно') &&
        Array.from(document.querySelectorAll('#additionalQuestions button') || []).every(btn => btn.textContent === 'Верно');
    if (allCorrect) {
        const modal = document.getElementById('successModal');
        modal.style.display = 'flex';
        disableAllInputsAndButtons();
    }
}

function disableAllInputsAndButtons() {
    const inputs = document.querySelectorAll('#questions input, #additionalQuestions input');
    const buttons = document.querySelectorAll('#questions button, #additionalQuestions button');
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

function exportToPDF() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    console.log('Exporting to PDF...');
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        doc.addFileToVFS("DejaVuSans.ttf", dejavuSans);
        doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
        doc.setFont("DejaVuSans");

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFillColor(255, 255, 255);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'F');
        doc.setDrawColor(57, 101, 45);
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

        doc.setTextColor(220, 220, 220);
        doc.setFontSize(16);
        const xInc = 30, yInc = 30;
        for (let x = -pageWidth; x < pageWidth * 2; x += xInc) {
            for (let y = -pageHeight; y < pageHeight * 2; y += yInc) {
                doc.text("VERIFIED", x, y, { angle: 45, align: "center" });
            }
        }

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(25);
        doc.text("Критерий Поста", pageWidth / 2, 30, { align: "center" });
        doc.setLineWidth(0.5);
        doc.line(20, 35, pageWidth - 20, 35);

        const now = new Date();
        doc.setFontSize(16);
        doc.text(`Дата и время: ${now.toLocaleDateString()} в ${now.toLocaleTimeString()}`, pageWidth / 2, 45, { align: "center" });

        const studentFIO = sessionStorage.getItem('studentFIO') || 'Не указано';
        const studentGroup = sessionStorage.getItem('studentGroup') || 'Не указано';
        doc.setFontSize(12);
        doc.text(`ФИО: ${studentFIO}`, 20, 60);
        doc.text(`Группа: ${studentGroup}`, 20, 70);

        const timeSpent = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        doc.text(`Время выполнения: ${minutes} мин. ${seconds} сек.`, 20, 85);

        if (!func.length || !truthTableData.length) throw new Error('Truth table data is missing');
        const truthHeaders = [['X', 'Y', ...func.map(op => op === '¬' ? '¬X' : `X ${op} Y`)]];
        const truthBody = [[1, 1], [1, 0], [0, 1], [0, 0]].map((row, i) => 
            [row[0], row[1], ...truthTableData.map(col => col[i] ?? 'N/A')]
        );
        doc.autoTable({
            startY: 90,
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
            startY: doc.lastAutoTable.finalY + 5,
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

        let lastY = doc.lastAutoTable.finalY + 10;

        const columnWidth = (pageWidth - 40) / 2;
        const leftColumnX = 20;
        const rightColumnX = 20 + columnWidth;

        const userQuestions = [];
        questions.forEach((q, idx) => {
            const inputElement = document.getElementById(`q_${idx}`);
            const btn = document.querySelector(`#q_${idx} + button`);
            if (inputElement && btn && btn.textContent === 'Верно') {
                const userInput = inputElement.value.trim();
                if (userInput) {
                    userQuestions.push({ op: q.op, type: q.type, userInput });
                }
            }
        });

        const userAdditionalQuestions = [];
        additionalQuestions.forEach((q, idx) => {
            const inputElement = document.getElementById(`aq_${idx}`);
            const btn = document.querySelector(`#aq_${idx} + button`);
            if (inputElement && btn && btn.textContent === 'Верно') {
                const userInput = inputElement.value.trim().toUpperCase();
                if (userInput) {
                    userAdditionalQuestions.push({ op: q.op, otherOps: q.otherOps, userInput });
                }
            }
        });

        if (userQuestions.length > 0) {
            doc.text("Контрпримеры:", leftColumnX, lastY);
            userQuestions.forEach((q, i) => {
                const text = `${i + 1}. ${q.op} (${q.type === 'M' ? 'Монотонность' : 'Самодвойственность'}): ${q.userInput}`;
                doc.text(text, leftColumnX, lastY + 10 + i * 10, { maxWidth: columnWidth - 10 });
            });
        }

        if (userAdditionalQuestions.length > 0) {
            doc.text("Контрпримеры выразимости:", rightColumnX, lastY);
            userAdditionalQuestions.forEach((q, i) => {
                const text = `${i + 1}. ${q.op} (Выразимость через ${q.otherOps.join(' и ')}): ${q.userInput}`;
                doc.text(text, rightColumnX, lastY + 10 + i * 10, { maxWidth: columnWidth - 5 });
            });
        }

        const leftColumnHeight = userQuestions.length > 0 ? 10 + userQuestions.length * 10 : 0;
        const rightColumnHeight = userAdditionalQuestions.length > 0 ? 10 + userAdditionalQuestions.length * 10 : 0;
        lastY += Math.max(leftColumnHeight, rightColumnHeight);

        doc.save(`${studentGroup}_${studentFIO}_Критерий_Поста.pdf`);
        console.log('PDF exported successfully');
    } catch (error) {
        console.error('Error exporting PDF:', error.message);
        alert('Ошибка при экспорте в PDF: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    startTime = new Date();
    randomFunc();
    truthTable();
});