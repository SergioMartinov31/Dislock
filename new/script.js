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

// Глобальные переменные
let truthTable = [];
let fColumn = [];
let correctCoefficients = [];
let userInputs = [];

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
    
    // Назначаем обработчики кнопок
    document.getElementById('startButton').addEventListener('click', displaySecondScreen);
    document.getElementById('restartButton').addEventListener('click', restartTest);
});

// Функция для отображения второго экрана
function displaySecondScreen() {
    document.getElementById('initialScreen').style.display = 'none';
    document.getElementById('secondScreen').style.display = 'block';
    
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
    
    const coefficients = ["XYZ +", "XY +", "XZ +", "YZ +", "X +", "Y +", "Z +", '1'];
    
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
        label.textContent = coeff;
        
        group.appendChild(input);
        group.appendChild(label);
        coefficientsInput.appendChild(group);
    });
    
    // Убедимся, что кнопка проверки активна
    document.getElementById('checkButton').disabled = false;
    document.getElementById('checkButton').addEventListener('click', checkSolution);
}

// Функция проверки решения
function checkSolution() {
    const resultMessage = document.getElementById('resultMessage');
    let userCoefficients = [];
    let hasEmptyFields = false;
    
    // Проверяем заполнение всех полей
    userInputs.forEach(input => {
        if (input.value.trim() === '') {
            hasEmptyFields = true;
        }
    });
    
    if (hasEmptyFields) {
        resultMessage.textContent = "Заполните все поля перед проверкой!";
        resultMessage.className = "result-message error";
        return;
    }
    
    // Собираем введенные пользователем коэффициенты
    userCoefficients = userInputs.map(input => parseInt(input.value.trim()));
    
    // Проверяем правильность решения
    const isCorrect = JSON.stringify(userCoefficients) === JSON.stringify(correctCoefficients);
    
    if (isCorrect) {
        resultMessage.textContent = "Полином Жегалкина найден верно!";
        resultMessage.className = "result-message success";
    } else {
        // Подсвечиваем неверные ответы
        userInputs.forEach((input, i) => {
            if (parseInt(input.value) !== correctCoefficients[i]) {
                input.style.backgroundColor = "#ffdddd";
                input.style.borderColor = "#ff0000";
            }
        });
        
        resultMessage.textContent = "Есть ошибки. Неверные коэффициенты подсвечены красным.";
        resultMessage.className = "result-message error";
    }
    
    // Блокируем редактирование после проверки
    userInputs.forEach(input => {
        input.disabled = true;
    });
    
    // Блокируем кнопку проверки
    document.getElementById('checkButton').disabled = true;
}

// Функция для перезапуска теста
function restartTest() {
    // Сбрасываем все состояния
    document.getElementById('secondScreen').style.display = 'none';
    document.getElementById('initialScreen').style.display = 'block';
    
    // Очищаем сообщение
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.textContent = '';
    resultMessage.className = "result-message";
    
    // Разблокируем кнопку проверки на случай, если она была заблокирована
    document.getElementById('checkButton').disabled = false;
    
    // Генерируем новые случайные значения для следующего теста
    fColumn = generateFColumn();
    correctCoefficients = zhegalkinPolynomial(fColumn);
    
    // Очищаем предыдущие поля ввода (они будут созданы заново при следующем displaySecondScreen)
    userInputs = [];
}