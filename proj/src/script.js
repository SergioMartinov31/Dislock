// Глобальные переменные
let truthTable = [];
let fColumn = [];
let correctCoefficients = [];
let userInputs = [];
let exportButton;

// Режим автозаполнения (true - включен, false - выключен)
const AUTO_FILL_MODE = false;

// Генерирует случайный столбец F для таблицы истинности
function generateFColumn() {
    return Array.from({length: 8}, () => Math.floor(Math.random() * 2));
}

// Вычисляет полином Жегалкина
function zhegalkinPolynomial(values) {
    let coeff = [...values];
    
    // Применяем преобразование Моебиуса
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 8; j++) {
            if (j & (1 << i)) {
                coeff[j] ^= coeff[j ^ (1 << i)];
            }
        }
    }
    
    const orderIndices = [7, 6, 5, 3, 4, 2, 1, 0];
    return orderIndices.map(i => coeff[i]);
}

// Форматирует полином для отображения
function formatPolynomial(coefficients) {
    const terms = [
        coefficients[0] ? 'XYZ' : '',
        coefficients[1] ? 'XY' : '',
        coefficients[2] ? 'XZ' : '',
        coefficients[3] ? 'YZ' : '',
        coefficients[4] ? 'X' : '',
        coefficients[5] ? 'Y' : '',
        coefficients[6] ? 'Z' : '',
        coefficients[7] ? '1' : ''
    ].filter(term => term !== '');
    
    return terms.join(' + ') || '0';
}

// Показывает результат (прокручивает к нему страницу)
function showResult() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('resultMessage').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Генерируем таблицу истинности
    for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 2; y++) {
            for (let z = 0; z < 2; z++) {
                truthTable.push([x, y, z]);
            }
        }
    }
    
    // Если мы на странице задания, инициализируем интерфейс
    if (document.getElementById('truthTable')) {
        initTask();
    }
    
    // Назначаем обработчик кнопки "Начать заново"
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.addEventListener('click', restartTask);
    }
});

// Инициализация задания
function initTask() {
    // Генерируем случайные значения F
    fColumn = generateFColumn();
    correctCoefficients = zhegalkinPolynomial(fColumn);
    
    // Заполняем таблицу истинности
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    truthTable.forEach((row, i) => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        
        const tdF = document.createElement('td');
        tdF.textContent = fColumn[i];
        tr.appendChild(tdF);
        
        tableBody.appendChild(tr);
    });
    
    // Создаем поля для ввода коэффициентов
    const coefficientsInput = document.getElementById('coefficientsInput');
    coefficientsInput.innerHTML = '';
    userInputs = [];
    
    const coefficients = [
        {label: "XYZ +", col: 1},
        {label: "XY +", col: 1},
        {label: "XZ +", col: 1},
        {label: "YZ +", col: 2},
        {label: "X +", col: 2},
        {label: "Y +", col: 2},
        {label: "Z +", col: 3},
        {label: "1", col: 3}
    ];
    
    coefficients.forEach((coeff, i) => {
        const group = document.createElement('div');
        group.className = 'coefficient-group';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'coefficient-input';
        input.maxLength = 1;
        input.dataset.index = i;
        userInputs.push(input);
        
        const label = document.createElement('span');
        label.className = 'coefficient-label';
        label.textContent = coeff.label;
        
        group.appendChild(input);
        group.appendChild(label);
        coefficientsInput.appendChild(group);
    });
    
    // Назначаем обработчик кнопки проверки
    document.getElementById('checkButton').addEventListener('click', checkSolution);
    
    // Создаем кнопку экспорта
    exportButton = document.getElementById('exportButton');
    exportButton.addEventListener('click', exportToPDF);

    // Проверяем доступность jsPDF
    if (typeof jsPDF === 'undefined') {
        console.error('jsPDF не загружен!');
        // Можно показать сообщение пользователю
        const exportBtn = document.getElementById('exportButton');
        exportBtn.disabled = true;
        exportBtn.title = "Функция экспорта недоступна (не загружена библиотека)";
    }
}


// Проверка решения с автофиллом
function checkSolution() {
    const resultMessage = document.getElementById('resultMessage');
    let userCoefficients = [];
    let hasEmptyFields = false;
    
    // Проверяем заполнение всех полей
    userInputs.forEach(input => {
        if (input.value.trim() === '') {
            hasEmptyFields = true;
            input.style.borderColor = "#ff0000";
        } else {
            input.style.borderColor = "#39652df8";
        }
    });
    
    if (hasEmptyFields) {
        resultMessage.textContent = "Пожалуйста, заполните все поля!";
        resultMessage.className = "result-message error";
        
        // Автозаполнение если включен режим
        if (AUTO_FILL_MODE) {
            userInputs.forEach((input, i) => {
                input.value = correctCoefficients[i];
                input.style.borderColor = "#39652df8";
            });
            
            showSuccessResult();
        }
        return;
    }
    
    // Собираем введенные коэффициенты
    userCoefficients = userInputs.map(input => {
        const value = input.value.trim();
        return value === '0' ? 0 : 1;
    });
    
    // Проверяем правильность решения
    const isCorrect = JSON.stringify(userCoefficients) === JSON.stringify(correctCoefficients);
    
    if (isCorrect || AUTO_FILL_MODE) {
        // Если режим автозаполнения включен, заполняем правильные ответы
        if (AUTO_FILL_MODE && !isCorrect) {
            userInputs.forEach((input, i) => {
                input.value = correctCoefficients[i];
            });
        }
        showSuccessResult();
    } else {
        // Показываем ошибки
        userInputs.forEach((input, i) => {
            if (parseInt(input.value) !== correctCoefficients[i]) {
                input.style.borderColor = "#ff0000";
            }
        });
        
        resultMessage.innerHTML = `
            Есть ошибки. Неверные коэффициенты подсвечены красным.<br><br>
            Правильный ответ:<br>
            <strong>${formatPolynomial(correctCoefficients)}</strong>
        `;
        resultMessage.className = "result-message error";
    }
}

// Показывает успешный результат
function showSuccessResult() {
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.innerHTML = `
        Полином Жегалкина найден верно!<br><br>
        Правильный ответ:<br>
        <strong>${formatPolynomial(correctCoefficients)}</strong>
    `;
    resultMessage.className = "result-message success";
    
    // Показываем модальное окно
    document.getElementById('successModal').style.display = 'flex';
    
    // Блокируем поля ввода
    userInputs.forEach(input => {
        input.disabled = true;
    });
    
    // Заменяем кнопку проверки на кнопку экспорта
    document.getElementById('checkButton').style.display = 'none';
    document.getElementById('exportButton').style.display = 'block';
    
    // Блокируем кнопку проверки
    document.getElementById('checkButton').disabled = true;
    
    // Загружаем jsPDF и autoTable только когда нужно
    if (typeof jsPDF === 'undefined') {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', () => {
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js', () => {
                // После загрузки скриптов можно использовать
                window.jsPDF = window.jspdf.jsPDF;
                exportButton.disabled = false;
            });
        });
    }
}

// Функция для динамической загрузки скриптов
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

// Перезапуск задания
function restartTask() {
    // Если есть модальное окно, скрываем его
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Перезагружаем страницу
    window.location.reload();
}

// Завершение задания
function finishTask() {
    // Перенаправляем на главную страницу
    window.location.href = "index.html";
}

function exportToPDF() {
    // Проверяем доступность jsPDF
    if (typeof jsPDF === 'undefined') {
        console.error('jsPDF не загружен!');
        alert('PDF export is not available (jsPDF library not loaded)');
        return;
    }

    // Создаем новый PDF документ
    const doc = new jsPDF();
    
    // Добавляем заголовок
    doc.setFontSize(18);
    doc.text('Zhegalkin Polynomial Solution', 105, 20, { align: 'center' });
    
    // Добавляем дату и время в 24-часовом формате
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US');
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${dateStr} at ${timeStr}`, 105, 30, { align: 'center' });
    
    // Добавляем таблицу истинности
    doc.setFontSize(14);
    doc.text('Truth Table', 105, 45, { align: 'center' });
    
    // Подготавливаем данные таблицы
    const tableData = [
        ['X', 'Y', 'Z', 'F'] // Заголовки
    ];
    
    // Заполняем данные таблицы
    truthTable.forEach((row, i) => {
        tableData.push([...row, fColumn[i]]);
    });
    
    // Генерируем таблицу
    doc.autoTable({
        startY: 50,
        head: [tableData[0]],
        body: tableData.slice(1),
        margin: { horizontal: 15 },
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] }
    });
    
    // Добавляем полином Жегалкина
    doc.setFontSize(14);
    doc.text('Zhegalkin Polynomial', 105, doc.autoTable.previous.finalY + 15, { align: 'center' });
    
    // Форматируем полином без кириллицы
    const terms = [
        correctCoefficients[0] ? 'XYZ' : '',
        correctCoefficients[1] ? 'XY' : '',
        correctCoefficients[2] ? 'XZ' : '',
        correctCoefficients[3] ? 'YZ' : '',
        correctCoefficients[4] ? 'X' : '',
        correctCoefficients[5] ? 'Y' : '',
        correctCoefficients[6] ? 'Z' : '',
        correctCoefficients[7] ? '1' : ''
    ].filter(term => term !== '');
    
    const polynomialStr = terms.join(' + ') || '0';
    doc.setFontSize(12);
    doc.text(polynomialStr, 105, doc.autoTable.previous.finalY + 25, { align: 'center' });
    
    // Добавляем коэффициенты
    doc.setFontSize(14);
    doc.text('Coefficients', 105, doc.autoTable.previous.finalY + 40, { align: 'center' });
    
    const coeffData = [
        ['Term', 'Value'],
        ['XYZ', correctCoefficients[0]],
        ['XY', correctCoefficients[1]],
        ['XZ', correctCoefficients[2]],
        ['YZ', correctCoefficients[3]],
        ['X', correctCoefficients[4]],
        ['Y', correctCoefficients[5]],
        ['Z', correctCoefficients[6]],
        ['1', correctCoefficients[7]]
    ];
    
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 45,
        head: [coeffData[0]],
        body: coeffData.slice(1),
        margin: { horizontal: 60 },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 1: { cellWidth: 30 } },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] }
    });
    
    // Сохраняем PDF
    doc.save('Zhegalkin_Polynomial.pdf');
}
