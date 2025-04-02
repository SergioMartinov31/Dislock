// Глобальные переменные для хранения данных приложения
let truthTable = []; // Массив для хранения таблицы истинности
let fColumn = []; // Массив значений функции F
let correctCoefficients = []; // Правильные коэффициенты полинома Жегалкина
let userInputs = []; // Ссылки на DOM-элементы полей ввода пользователя
let exportButton; // Ссылка на кнопку экспорта
let startTime; // Время начала тестирования

// Генерирует случайные значения для столбца F таблицы истинности
// @returns {Array} Массив из 8 случайных бинарных значений (0 или 1)
function generateFColumn() {
    return Array.from({length: 8}, () => Math.floor(Math.random() * 2));
}


// Вычисляет коэффициенты полинома Жегалкина с использованием преобразования Мёбиуса
// @param {Array} values - Значения функции F из таблицы истинности
// @returns {Array} Массив коэффициентов полинома Жегалкина
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

// Форматирует полином Жегалкина в строку для отображения
// @param {Array} coefficients - Массив коэффициентов полинома
// @returns {String} Строковое представление полинома
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

// Прокручивает страницу к блоку с результатами проверки
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

// Инициализирует задание: генерирует данные и создает интерфейс
function initTask() {
    fColumn = generateFColumn();
    correctCoefficients = zhegalkinPolynomial(fColumn);

    startTime = new Date(); // Записываем время начала
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
            // Скрываем курсор
            this.style.caretColor = 'transparent';
        });
        
        // Ограничиваем ввод только 0 и 1 с автоматической заменой
        input.addEventListener('keydown', function(e) {
            if (e.key === '0' || e.key === '1') {
                this.value = e.key; // Заменяем значение без необходимости удалять старое
                e.preventDefault(); // Предотвращаем дублирование символа
            } else if (e.key !== 'Backspace' && e.key !== 'Delete' && 
                    e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' &&
                    e.key !== 'ArrowUp' && e.key !== 'ArrowDown' &&
                    e.key !== 'Tab') {
                e.preventDefault(); // Блокируем другие символы
            }
        });
        
        // Обработка клика - сразу выделяем текст
        input.addEventListener('input', function() {
            if (this.value !== '0' && this.value !== '1') {
                this.value = '';
            }
        });
    });
}

// Обрабатывает навигацию между полями ввода с помощью клавиатуры
// @param {KeyboardEvent} event - Событие клавиатуры
function handleKeyNavigation(event) {
    // Проверяем, что событие произошло на поле ввода коэффициента
    if (!event.target.classList.contains('coefficient-input')) 
        return;
    
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


// Проверяет решение пользователя
function checkSolution() {
    const resultMessage = document.getElementById('resultMessage');
    let userCoefficients = [];
    let hasEmptyFields = false;

    window.checkTime = new Date(); // Сохраняем время проверки
    
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
        return;
    }
    
    // Получение введенных пользователем коэффициентов
    userCoefficients = userInputs.map(input => {
        const value = input.value.trim();
        return value === '0' ? 0 : 1;
    });
    
    // Проверка правильности решения
    const isCorrect = JSON.stringify(userCoefficients) === JSON.stringify(correctCoefficients);
    
    if (isCorrect) {
        showSuccessResult();
    } else {
        // Подсветка неверных коэффициентов
        userInputs.forEach((input, i) => {
            input.disabled = true;
            if (parseInt(input.value) !== correctCoefficients[i]) {
                input.style.borderColor = "#ff0000";
            }
        });
        
        // Вывод сообщения об ошибке
        resultMessage.innerHTML = `
            Есть ошибки. Неверные коэффициенты подсвечены красным.<br><br>
            Правильный ответ:<br>
            <strong>${formatPolynomial(correctCoefficients)}</strong>
        `;
        resultMessage.className = "result-message error";
        
        // Заменяем кнопку "Проверить" на "Начать заново"
        const checkButton = document.getElementById('checkButton');
        checkButton.textContent = "Начать заново";
        checkButton.onclick = restartTask;
        checkButton.id = "restartButtonBottom";
        
        // Плавно скрываем кнопку в шапке
        const headerRestartBtn = document.querySelector('.header-restart-btn');
        headerRestartBtn.style.opacity = '0';
        headerRestartBtn.style.pointerEvents = 'none'; // Отключаем взаимодействие
        
        // Через 500мс (после анимации) центрируем заголовок
        setTimeout(() => {
            headerRestartBtn.style.display = 'none';
            document.querySelector('.header__inner').classList.add('centered-header');
        }, 500);
    }
}


// Отображает сообщение об успешном выполнении задания

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

// Перезапускает задание (обновляет страницу)
function restartTask() {
    window.location.reload();
}

// Завершает задание и возвращает на главную страницу
function finishTask() {
    window.location.href = "index.html";
}


// Экспортирует результаты в PDF-файл
function exportToPDF() {
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
    doc.text("Полином Жегалкина", pageWidth / 2, 30, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(20, 35, pageWidth - 20, 35);

    // Добавляем дату и время
    const now = new Date();
    doc.setFontSize(16);
    doc.text(`Дата и время: ${now.toLocaleDateString()} в ${now.toLocaleTimeString()}`, pageWidth / 2, 45, { align: "center" });

    // Добавляем данные пользователя (сдвинуты ниже)
    const studentFIO = sessionStorage.getItem('studentFIO');
    const studentGroup = sessionStorage.getItem('studentGroup');
    
    doc.setFontSize(16);
    doc.text(`ФИО: ${studentFIO}`, 20, 60);
    doc.text(`Группа: ${studentGroup}`, 20, 70);

    // Информация о времени выполнения
    const timeSpent = Math.floor((window.checkTime - startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    doc.setFontSize(18);
    doc.text(`Время выполнения: ${minutes} мин. ${seconds} сек.`, 20, 85);

    // Таблица истинности и полином в одну строку
    const tableData = [['X', 'Y', 'Z', 'F']];
    truthTable.forEach((row, i) => {
        tableData.push([...row, fColumn[i]]);
    });

    // Таблица истинности (шире и компактнее)
    doc.autoTable({
        startY: 95, // Сдвигаем таблицу ниже
        head: [tableData[0]],
        body: tableData.slice(1),
        margin: { left: 20, right: 110 },
        tableWidth: 100,
        styles: { 
            fontSize: 14,
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
            3: { cellWidth: 15 }
        }
    });

    // Полином Жегалкина справа от таблицы
    const polynomialStr = formatPolynomial(correctCoefficients);
    doc.setFontSize(18);
    doc.text("Полином:", 120, 100); // Сдвигаем вместе с таблицей
    doc.setFontSize(16);
    doc.text(polynomialStr, 120, 110, { maxWidth: 75 });

    // Сохраняем PDF
    doc.save(`${studentGroup}_${studentFIO}_Полином_Жегалкина.pdf`);
}