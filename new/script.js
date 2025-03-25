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
    
    const coefficients = ["XYZ+", "XY+", "XZ+", "YZ+", "X+", "Y+", "Z+", '1'];
    
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
    
    document.getElementById('checkButton').addEventListener('click', checkSolution);
}

// Функция проверки решения
function checkSolution() {
    const resultMessage = document.getElementById('resultMessage');
    let userCoefficients = [];
    let hasEmptyFields = false;
    
    // Собираем введенные пользователем коэффициенты
    userInputs.forEach(input => {
        const value = input.value.trim();
        if (value === '') {
            hasEmptyFields = true;
            input.value = correctCoefficients[input.dataset.index];
            userCoefficients.push(correctCoefficients[input.dataset.index]);
        } else {
            userCoefficients.push(parseInt(value));
        }
        
        // Блокируем редактирование после проверки
        input.disabled = true;
    });
    
    // Проверяем правильность решения
    const isCorrect = JSON.stringify(userCoefficients) === JSON.stringify(correctCoefficients);
    
    if (isCorrect) {
        resultMessage.textContent = "Полином Жегалкина найден верно!";
        resultMessage.className = "result-message success";
    } else {
        resultMessage.textContent = "Полином Жегалкина найден неверно. Правильные коэффициенты были подставлены.";
        resultMessage.className = "result-message error";
    }
    
    // Блокируем кнопку проверки
    document.getElementById('checkButton').disabled = true;
}

// Функция для перезапуска теста
function restartTest() {
    document.getElementById('secondScreen').style.display = 'none';
    document.getElementById('initialScreen').style.display = 'block';
    document.getElementById('resultMessage').textContent = '';
    document.getElementById('resultMessage').className = "result-message";
}