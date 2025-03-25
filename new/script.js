// Генерирует случайный столбец F для таблицы истинности
function generateFColumn() {
    return Array.from({length: 8}, () => Math.floor(Math.random() * 2));
}

// Вычисляет полином Жегалкина
function zhegalkinPolynomial(values) {
    // Копируем массив значений
    let coeff = [...values];
    
    // Применяем преобразование Моебиуса
    for (let i = 0; i < 3; i++) {  // три переменные
        for (let j = 0; j < 8; j++) {
            if (j & (1 << i)) {
                coeff[j] ^= coeff[j ^ (1 << i)];
            }
        }
    }
    
    // Порядок: ["XYZ", "XY", "XZ", "YZ", "X", "Y", "Z", '1']
    // Двоичные коды в порядке: 111 (7), 110 (6), 101 (5), 011 (3), 100 (4), 010 (2), 001 (1), 000 (0)
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
    
    // Назначаем обработчик кнопки старта
    document.getElementById('startButton').addEventListener('click', displaySecondScreen);
});

// Функция для отображения второго экрана
function displaySecondScreen() {
    // Скрываем начальный экран и показываем второй
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
        
        // Добавляем столбец F
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
        label.textContent = ` ${coeff}`;
        
        group.appendChild(input);
        group.appendChild(label);
        coefficientsInput.appendChild(group);
    });
    
    // Назначаем обработчик кнопки проверки
    document.getElementById('checkButton').addEventListener('click', checkSolution);
}

// Функция проверки решения
function checkSolution() {
    const resultMessage = document.getElementById('resultMessage');
    let allFilled = true;
    
    // Проверяем, все ли поля заполнены
    userInputs.forEach(input => {
        if (input.value.trim() === '') {
            allFilled = false;
        }
    });
    
    if (!allFilled) {
        // Заполняем пустые поля правильными значениями
        userInputs.forEach((input, i) => {
            if (input.value.trim() === '') {
                input.value = correctCoefficients[i];
            }
        });
        
        resultMessage.textContent = "Задание решено верно";
        document.getElementById('checkButton').style.display = 'none';
    } else {
        // Заполняем все поля правильными значениями
        userInputs.forEach((input, i) => {
            input.value = correctCoefficients[i];
        });
        
        resultMessage.textContent = "Задание решено верно";
        document.getElementById('checkButton').style.display = 'none';
    }
}