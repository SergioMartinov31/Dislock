// Глобальные переменные
let truthTable = [];
let fColumn = [];
let correctCoefficients = [];
let userInputs = [];

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
        {label: "XZ +", col: 2},
        {label: "YZ +", col: 2},
        {label: "X +", col: 1},
        {label: "Y +", col: 2},
        {label: "Z +", col: 1},
        {label: "1", col: 2}
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
}

// Проверка решения
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
        return;
    }
    
    // Собираем введенные коэффициенты
    userCoefficients = userInputs.map(input => {
        const value = input.value.trim();
        return value === '0' ? 0 : 1; // Приводим к числу
    });
    
    // Проверяем правильность решения
    const isCorrect = JSON.stringify(userCoefficients) === JSON.stringify(correctCoefficients);
    
    if (isCorrect) {
        resultMessage.textContent = "Полином Жегалкина найден верно!";
        resultMessage.className = "result-message success";
        
        // Показываем модальное окно успеха
        document.getElementById('successModal').style.display = 'flex';
        
        // Блокируем поля ввода
        userInputs.forEach(input => {
            input.disabled = true;
        });
        
        // Блокируем кнопку проверки
        document.getElementById('checkButton').disabled = true;
    } else {
        // Подсвечиваем неверные ответы
        userInputs.forEach((input, i) => {
            if (parseInt(input.value) !== correctCoefficients[i]) {
                input.style.borderColor = "#ff0000";
            }
        });
        
        resultMessage.textContent = "Есть ошибки. Неверные коэффициенты подсвечены красным.";
        resultMessage.className = "result-message error";
    }
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