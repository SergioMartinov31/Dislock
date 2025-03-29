// ------------------------
// Регистрация и настройка экзамена
// ------------------------
document.getElementById('registration-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const fio = document.getElementById('fio').value;
    const group = document.getElementById('group').value;

    // Сохраняем данные студента и время начала экзамена глобально
    window.student = {
        fio: fio,
        group: group,
        startTime: new Date()
    };

    // Скрываем экран регистрации и показываем экран экзамена
    document.getElementById('registration-screen').classList.add('hidden');
    document.getElementById('exam-screen').classList.remove('hidden');

    // Отображаем информацию о студенте на экране экзамена
    document.getElementById('student-info').textContent =
        `Студент: ${fio} | Группа: ${group} | Время начала: ${window.student.startTime.toLocaleTimeString()}`;

    // Заполняем таблицу истинности и вычисляем минимальную ДНФ
    populateTruthTable();
});

// ------------------------
// Генерация таблицы истинности и минимальной ДНФ
// ------------------------

// Генерирует случайную таблицу истинности для 3 переменных
function generateTruthTable() {
    const table = [];
    for (let i = 0; i < 8; i++) {
        let bin = i.toString(2).padStart(3, '0');
        // Случайным образом выбираем 0 или 1 для значения функции f
        const value = Math.round(Math.random());
        table.push({ index: i, inputs: bin, value: value });
    }
    return table;
}

// Заполняет таблицу в DOM и вычисляет минимальную ДНФ
function populateTruthTable() {
    const table = generateTruthTable();
    window.truthTable = table; // сохраняем для дальнейшего использования

    const tableBody = document.getElementById('truth-table').querySelector('tbody');
    const rows = [];
    // Отображаем строки в порядке убывания (от 111 до 000)
    table.slice().reverse().forEach(row => {
        rows.push(`<tr>
        <td>${row.inputs[0]}</td>
        <td>${row.inputs[1]}</td>
        <td>${row.inputs[2]}</td>
        <td>${row.value}</td>
      </tr>`);
    });
    tableBody.innerHTML = rows.join('');

    // Вычисляем минимальное ДНФ выражение на основе таблицы истинности
    const dnf = getMinimalDNF(table);
    console.log("Правильная минимальная ДНФ:", dnf); // для отладки
    window.correctDNF = dnf;
}

// Вычисляет минимальную ДНФ с помощью упрощённого алгоритма Квайна–МакКласки для 3 переменных
function getMinimalDNF(truthTable) {
    let minterms = [];
    truthTable.forEach(row => { if (row.value === 1) { minterms.push(row.index); } });
    if (minterms.length === 0) return "0";
    if (minterms.length === truthTable.length) return "1";

    let implicants = [];
    minterms.forEach(m => {
        let bin = m.toString(2).padStart(3, '0');
        implicants.push({ term: bin, minterms: [m] });
    });

    function countOnes(str) {
        return str.split('').filter(c => c === '1').length;
    }

    let allPrimeImplicants = [];
    let currentImplicants = implicants;

    while (true) {
        let nextRound = [];
        let marked = new Array(currentImplicants.length).fill(false);
        let groups = {};
        currentImplicants.forEach((imp, idx) => {
            let count = countOnes(imp.term.replace(/-/g, '0'));
            if (!groups[count]) groups[count] = [];
            groups[count].push({ imp, idx });
        });
        let groupKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);
        for (let i = 0; i < groupKeys.length - 1; i++) {
            let group1 = groups[groupKeys[i]];
            let group2 = groups[groupKeys[i + 1]];
            group1.forEach(item1 => {
                group2.forEach(item2 => {
                    let term1 = item1.imp.term;
                    let term2 = item2.imp.term;
                    let diffCount = 0, diffIndex = -1;
                    for (let j = 0; j < term1.length; j++) {
                        if (term1[j] !== term2[j]) {
                            if (term1[j] !== '-' && term2[j] !== '-') {
                                diffCount++;
                                diffIndex = j;
                            }
                        }
                    }
                    if (diffCount === 1) {
                        let newTerm = term1.split('');
                        newTerm[diffIndex] = '-';
                        newTerm = newTerm.join('');
                        if (!nextRound.some(e => e.term === newTerm)) {
                            nextRound.push({ term: newTerm, minterms: [...new Set([...item1.imp.minterms, ...item2.imp.minterms])] });
                        }
                        marked[item1.idx] = true;
                        marked[item2.idx] = true;
                    }
                });
            });
        }
        currentImplicants.forEach((imp, idx) => {
            if (!marked[idx]) { allPrimeImplicants.push(imp); }
        });
        if (nextRound.length === 0) break;
        currentImplicants = nextRound;
    }

    allPrimeImplicants = allPrimeImplicants.filter((imp, idx, self) =>
        idx === self.findIndex(t => t.term === imp.term)
    );

    let chart = {};
    minterms.forEach(m => { chart[m] = []; });
    allPrimeImplicants.forEach((imp, idx) => {
        minterms.forEach(m => {
            if (imp.minterms.includes(m)) { chart[m].push(idx); }
        });
    });

    let essentialIndices = new Set();
    for (let m in chart) {
        if (chart[m].length === 1) {
            essentialIndices.add(chart[m][0]);
        }
    }

    let covered = new Set();
    essentialIndices.forEach(idx => { allPrimeImplicants[idx].minterms.forEach(m => covered.add(m)); });
    allPrimeImplicants.forEach((imp, idx) => {
        if (!essentialIndices.has(idx) && imp.minterms.some(m => !covered.has(m))) {
            essentialIndices.add(idx);
            imp.minterms.forEach(m => covered.add(m));
        }
    });

    let dnfTerms = [];
    essentialIndices.forEach(idx => {
        dnfTerms.push(implicantToLiteral(allPrimeImplicants[idx].term));
    });
    return dnfTerms.join(" + ");
}

function implicantToLiteral(term) {
    const vars = ['X', 'Y', 'Z'];
    let literals = [];
    for (let i = 0; i < term.length; i++) {
        if (term[i] === '1') { literals.push(vars[i]); }
        else if (term[i] === '0') { literals.push(vars[i] + "̅"); }
    }
    return literals.join(" ");
}

// ------------------------
// Функция нормализации
// ------------------------
// Позволяет пользователю вводить "not X", "not Y", "not Z" вместо X̅, Y̅, Z̅.
function normalizeDNFAnswer(answer) {
    let normalized = answer;
    normalized = normalized.replace(/not\s*X/gi, "X̅");
    normalized = normalized.replace(/not\s*Y/gi, "Y̅");
    normalized = normalized.replace(/not\s*Z/gi, "Z̅");
    normalized = normalized.replace(/\s*\+\s*/g, " + ");
    return normalized.trim();
}

// ------------------------
// Проверка ответа, финальные результаты и генерация PDF
// ------------------------
document.getElementById('submit-answer').addEventListener('click', function () {
    let answer = document.getElementById('dnf-answer').value.trim();
    const userAnswerNormalized = normalizeDNFAnswer(answer);

    const endTime = new Date();
    const elapsedMs = endTime - window.student.startTime;
    const seconds = Math.floor((elapsedMs / 1000) % 60);
    const minutes = Math.floor((elapsedMs / (1000 * 60)) % 60);
    window.elapsedTime = { minutes, seconds };

    let resultMessage = (userAnswerNormalized === window.correctDNF)
        ? "Правильный ответ! Экзамен сдан."
        : "Неправильный ответ. Экзамен не сдан.";

    window.normalizedAnswer = userAnswerNormalized;
    window.resultMessage = resultMessage;

    document.getElementById('exam-screen').classList.add('hidden');
    document.getElementById('final-screen').classList.remove('hidden');

    document.getElementById('final-student-info').textContent =
        `Студент: ${window.student.fio} | Группа: ${window.student.group}`;
    document.getElementById('final-answer').textContent =
        `Ваш ответ: ${userAnswerNormalized} | ${resultMessage}`;
    document.getElementById('final-time').textContent =
        `Затраченное время: ${minutes} минут и ${seconds} секунд`;

    // Автоматически генерируем и скачиваем PDF с водяными знаками
    generatePDF();
});

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Use the imported Base64 string to embed the font
    doc.addFileToVFS("DejaVuSans.ttf", dejavuSans);
    doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
    doc.setFont("DejaVuSans");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- Draw Container Background with Rounded Corners ---
    doc.setFillColor(255, 255, 255);
    if (doc.roundedRect) {
        doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 10, 10, 'F');
    } else {
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'F');
    }

    doc.setDrawColor(57, 101, 45);
    doc.setLineWidth(2);
    if (doc.roundedRect) {
        doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 10, 10, 'S');
    } else {
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');
    }

    // --- Add Frequent Watermarks ---
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(16);
    const xInc = 30, yInc = 30;
    for (let x = -pageWidth; x < pageWidth * 2; x += xInc) {
        for (let y = -pageHeight; y < pageHeight * 2; y += yInc) {
            doc.text("VERIFIED", x, y, { angle: 45, align: "center" });
        }
    }

    // --- Add Main Content ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.text("Результаты экзамена", pageWidth / 2, 30, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(20, 35, pageWidth - 20, 35);
    doc.setFontSize(14);
    let currentY = 50;
    const lineHeight = 8;
    doc.text(`Студент: ${window.student.fio}`, 20, currentY);
    currentY += lineHeight;
    doc.text(`Группа: ${window.student.group}`, 20, currentY);
    currentY += lineHeight;
    doc.text(`Ваш ответ: ${window.normalizedAnswer}`, 20, currentY);
    currentY += lineHeight;
    doc.text(`Результат: ${window.resultMessage}`, 20, currentY);
    currentY += lineHeight;
    doc.text(`Затраченное время: ${window.elapsedTime.minutes} минут и ${window.elapsedTime.seconds} секунд`, 20, currentY);
    currentY += 2 * lineHeight;

    // --- Save PDF ---
    doc.save(`${window.student.fio}_${window.student.group}_exam_results.pdf`);
}


// ------------------------
// Перезапуск экзамена
// ------------------------
document.getElementById('restart-btn').addEventListener('click', function () {
    location.reload();
});
