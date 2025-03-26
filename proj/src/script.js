// Глобальные переменные для хранения данных приложения
let truthTable = []; // Массив для хранения таблицы истинности
let fColumn = []; // Массив значений функции F
let correctCoefficients = []; // Правильные коэффициенты полинома Жегалкина
let userInputs = []; // Ссылки на DOM-элементы полей ввода пользователя
let exportButton; // Ссылка на кнопку экспорта

/**
 * Генерирует случайные значения для столбца F таблицы истинности
 * @returns {Array} Массив из 8 случайных бинарных значений (0 или 1)
 */
function generateFColumn() {
    return Array.from({length: 8}, () => Math.floor(Math.random() * 2));
}

/**
 * Вычисляет коэффициенты полинома Жегалкина с использованием преобразования Мёбиуса
 * @param {Array} values - Значения функции F из таблицы истинности
 * @returns {Array} Массив коэффициентов полинома Жегалкина
 */
function zhegalkinPolynomial(values) {
    let coeff = [...values];
    
    // Применение преобразования Мёбиуса
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 8; j++) {
            if (j & (1 << i)) {
                coeff[j] ^= coeff[j ^ (1 << i)];
            }
        }
    }
    
    // Порядок коэффициентов в полиноме Жегалкина
    const orderIndices = [7, 6, 5, 3, 4, 2, 1, 0];
    return orderIndices.map(i => coeff[i]);
}

/**
 * Форматирует полином Жегалкина в строку для отображения
 * @param {Array} coefficients - Массив коэффициентов полинома
 * @returns {String} Строковое представление полинома
 */
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

/**
 * Прокручивает страницу к блоку с результатами проверки
 */
function showResult() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('resultMessage').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Генерация всех возможных комбинаций переменных X, Y, Z
    for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 2; y++) {
            for (let z = 0; z < 2; z++) {
                truthTable.push([x, y, z]);
            }
        }
    }
    
    // Инициализация страницы задания, если она существует
    if (document.getElementById('truthTable')) {
        initTask();
    }
});

/**
 * Инициализирует задание: генерирует данные и создает интерфейс
 */
function initTask() {
    fColumn = generateFColumn();
    correctCoefficients = zhegalkinPolynomial(fColumn);

    // Обработчики событий клавиатуры
    document.addEventListener('keydown', handleKeyNavigation);
    
    // Заполнение таблицы истинности в DOM
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
    
    // Создание полей для ввода коэффициентов
    const coefficientsInput = document.getElementById('coefficientsInput');
    coefficientsInput.innerHTML = '';
    userInputs = [];
    
    // Конфигурация полей ввода коэффициентов
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
    
    // Создание DOM-элементов для каждого коэффициента
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
    
    // Назначение обработчиков событий для кнопок
    document.getElementById('checkButton').addEventListener('click', checkSolution);
    exportButton = document.getElementById('exportButton');
    exportButton.addEventListener('click', exportToPDF);

    // Автоматически выделяем текст при фокусе на поле ввода
    userInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.select();
        });
        
        // Ограничиваем ввод только 0 и 1
        input.addEventListener('input', function() {
            if (this.value !== '0' && this.value !== '1') {
                this.value = '';
            }
        });
    });
}

/*
 * Обрабатывает навигацию между полями ввода с помощью клавиатуры
 * @param {KeyboardEvent} event - Событие клавиатуры
 */
function handleKeyNavigation(event) {
    // Проверяем, что событие произошло на поле ввода коэффициента
    if (!event.target.classList.contains('coefficient-input')) {
        return;
    }
    
    const currentInput = event.target;
    const currentIndex = parseInt(currentInput.dataset.index);
    let nextIndex;
    
    // Обработка стрелок влево/вправо
    if (event.key === 'ArrowRight') {
        nextIndex = currentIndex + 1;
        if (nextIndex >= userInputs.length) nextIndex = 0;
    } else if (event.key === 'ArrowLeft') {
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) nextIndex = userInputs.length - 1;
    } 
    // Обработка стрелок вверх/вниз
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        // Проверяем, используется ли горизонтальный макет (flex-wrap)
        const coefficientsGrid = document.querySelector('.coefficients-grid');
        const isHorizontalLayout = window.getComputedStyle(coefficientsGrid).flexWrap === 'wrap';
        
        if (isHorizontalLayout) {
            // Для горизонтального макета - вверх переходит к первому, вниз к последнему
            nextIndex = event.key === 'ArrowUp' ? 0 : userInputs.length - 1;
        } else {
            // Для вертикального макета - обычное поведение (4 колонки)
            if (event.key === 'ArrowDown') {
                nextIndex = currentIndex + 4;
            } else {
                nextIndex = currentIndex - 4;
            }
        }
    } else {
        return; // Если нажата не стрелка, выходим
    }
    
    // Переключаем фокус на следующий input
    userInputs[nextIndex].focus();
    event.preventDefault(); // Предотвращаем прокрутку страницы
}

// Флаг для режима автоматического заполнения правильных ответов (для тестирования)
const AUTO_FILL_MODE = true;

/**
 * Проверяет решение пользователя
 */
function checkSolution() {
    const resultMessage = document.getElementById('resultMessage');
    let userCoefficients = [];
    let hasEmptyFields = false;
    
    // Проверка заполнения всех полей
    userInputs.forEach(input => {
        if (input.value.trim() === '') {
            hasEmptyFields = true;
            input.style.borderColor = "#ff0000";
        } else {
            input.style.borderColor = "#39652df8";
        }
    });
    
    // Обработка незаполненных полей
    if (hasEmptyFields) {
        resultMessage.textContent = "Пожалуйста, заполните все поля!";
        resultMessage.className = "result-message error";
        
        // Автозаполнение в тестовом режиме
        if (AUTO_FILL_MODE) {
            userInputs.forEach((input, i) => {
                input.value = correctCoefficients[i];
                input.style.borderColor = "#39652df8";
            });
            
            showSuccessResult();
        }
        return;
    }
    
    // Получение введенных пользователем коэффициентов
    userCoefficients = userInputs.map(input => {
        const value = input.value.trim();
        return value === '0' ? 0 : 1;
    });
    
    // Проверка правильности решения
    const isCorrect = JSON.stringify(userCoefficients) === JSON.stringify(correctCoefficients);
    
    if (isCorrect || AUTO_FILL_MODE) {
        if (AUTO_FILL_MODE && !isCorrect) {
            userInputs.forEach((input, i) => {
                input.value = correctCoefficients[i];
            });
        }
        showSuccessResult();
    } else {
        // Подсветка неверных коэффициентов
        userInputs.forEach((input, i) => {
            if (parseInt(input.value) !== correctCoefficients[i]) {
                input.style.borderColor = "#ff0000";
            }
        });
        
        // Вывод сообщения об ошибке с правильным ответом
        resultMessage.innerHTML = `
            Есть ошибки. Неверные коэффициенты подсвечены красным.<br><br>
            Правильный ответ:<br>
            <strong>${formatPolynomial(correctCoefficients)}</strong>
        `;
        resultMessage.className = "result-message error";
    }
}

/**
 * Отображает сообщение об успешном выполнении задания
 */
function showSuccessResult() {
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.innerHTML = `
        Полином Жегалкина найден верно!<br><br>
        Правильный ответ:<br>
        <strong>${formatPolynomial(correctCoefficients)}</strong>
    `;
    resultMessage.className = "result-message success";
    
    // Показ модального окна успеха
    document.getElementById('successModal').style.display = 'flex';
    
    // Блокировка полей ввода после проверки
    userInputs.forEach(input => {
        input.disabled = true;
    });
    
    // Переключение видимости кнопок
    document.getElementById('checkButton').style.display = 'none';
    document.getElementById('exportButton').style.display = 'block';
}

/**
 * Перезапускает задание (обновляет страницу)
 */
function restartTask() {
    window.location.reload();
}

/**
 * Завершает задание и возвращает на главную страницу
 */
function finishTask() {
    window.location.href = "index.html";
}

/**
 * Экспортирует результаты в PDF-файл
 */
function exportToPDF() {
    // Проверка загрузки библиотеки jsPDF
    if (typeof jsPDF === 'undefined') {
        alert('PDF export is not available (jsPDF library not loaded)');
        return;
    }

    const doc = new jsPDF();
    
    // Заголовок документа и дата генерации
    doc.setFontSize(18);
    doc.text('Zhegalkin Polynomial Solution', 105, 20, { align: 'center' });
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US');
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    doc.setFontSize(12);
    doc.text(`Generated on: ${dateStr} at ${timeStr}`, 105, 30, { align: 'center' });
    
    // Добавление таблицы истинности в PDF
    doc.setFontSize(14);
    doc.text('Truth Table', 105, 45, { align: 'center' });
    
    const tableData = [['X', 'Y', 'Z', 'F']];
    truthTable.forEach((row, i) => {
        tableData.push([...row, fColumn[i]]);
    });
    
    doc.autoTable({
        startY: 50,
        head: [tableData[0]],
        body: tableData.slice(1),
        margin: { horizontal: 15 },
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] }
    });
    
    // Добавление полинома Жегалкина в PDF
    doc.setFontSize(14);
    doc.text('Zhegalkin Polynomial', 105, doc.autoTable.previous.finalY + 15, { align: 'center' });
    
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
    
    // Добавление таблицы коэффициентов в PDF
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
    
    // Сохранение PDF-файла
    doc.save('Полином_Жегалкина_Результат.pdf');
}