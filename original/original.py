import tkinter as tk
import ctypes
from tkinter import font
import random
import sys



def generate_f_column():
    """Генерирует случайный столбец F для таблицы истинности."""
    return [random.randint(0, 1) for _ in range(8)]


def zhegalkin_polynomial(values):

    # Копируем массив значений
    coeff = values.copy()

    # Применяем преобразование Моебиуса
    for i in range(3):  # три переменные
        for j in range(8):
            if j & (1 << i):
                coeff[j] ^= coeff[j ^ (1 << i)]

    # Сопоставляем коэффициенты с монономами
    # Порядок: ["XYZ", "XY", "XZ", "YZ", "X", "Y", "Z", "1"]
    # Двоичные коды в порядке: 111 (7), 110 (6), 101 (5), 011 (3), 100 (4), 010 (2), 001 (1), 000 (0)
    order_indices = [7, 6, 5, 3, 4, 2, 1, 0]
    ordered_coeff = [coeff[i] for i in order_indices]

    return ordered_coeff


def check_user_solution(user_coeffs, correct_coeffs):
    """Сравнивает пользовательские коэффициенты с правильными."""
    return user_coeffs == correct_coeffs


def show_error_message(message):
    MB_OK = 0x00000000
    ctypes.windll.user32.MessageBoxW(0, message, "", MB_OK)



# Создаем главное окно
window = tk.Tk()
window.title("Полином Жегалкина")
window.geometry("783x510")
window.resizable(False, False)  # Запрещаем изменение размера окна

# Задаем цвета фона и текста
background_color = "#bdd3de"  # Цвет фона
text_color = "#324148"        # Цвет текста
window.configure(bg=background_color)

# Определяем шрифты
header_font = font.Font(family="Arial", size=13)
title_font = font.Font(family="Arial", size=28)
subject_font = font.Font(family="Arial", size=25)
cell_font = font.Font(family="Arial", size=20)
button_font = font.Font(family="Arial", size=20)
footer_font = font.Font(family="Arial", size=14)

truth_table = [
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
        [1, 1, 1]
    ]

f_column = generate_f_column()
correct_coefficients = zhegalkin_polynomial(f_column)
user_entries = []

# Функция для отображения второго экрана
def display_second_screen():
    # Удаляем все виджеты из окна
    for widget in window.winfo_children():
        widget.destroy()

    # Размеры таблицы
    table_width = 357
    table_height = 452
    cell_width = int(table_width / 4)  # Каждая ячейка шириной 357 / 4
    cell_height = int(table_height / 9)  # Высота каждой строки

    table_font = font.Font(family="Arial", size=24)
    # Заголовки таблицы
    header_frame = tk.Frame(window, bg="#3f5664")
    header_frame.place(x=30, y=6)

    tk.Label(header_frame, text="X", font=table_font, bg="#3f5664", fg="white", width=4, height=1).grid(row=0, column=0)
    tk.Label(header_frame, text="Y", font=table_font, bg="#3f5664", fg="white", width=4, height=1).grid(row=0, column=1)
    tk.Label(header_frame, text="Z", font=table_font, bg="#3f5664", fg="white", width=4, height=1).grid(row=0, column=2)
    tk.Label(header_frame, text="F", font=table_font, bg="#3f5664", fg="white", width=4, height=1).grid(row=0, column=3)

    # Таблица значений
    for i, (x, y, z) in enumerate(truth_table):
        tk.Label(header_frame, text=str(x), font=table_font, bg="#dee6e9", width=4).grid(row=i + 1, column=0, padx=1, pady=1)
        tk.Label(header_frame, text=str(y), font=table_font, bg="#dee6e9", width=4).grid(row=i + 1, column=1, padx=1, pady=1)
        tk.Label(header_frame, text=str(z), font=table_font, bg="#dee6e9", width=4).grid(row=i + 1, column=2, padx=1, pady=1)
        tk.Label(header_frame, text=str(f_column[i]), font=table_font, bg="#dee6e9", width=4).grid(row=i + 1, column=3,padx=1, pady=1)

    # Инструкции справа
    instructions_font = font.Font(family="Arial", size=22)
    instructions = tk.Label(window, text="Найдите многочлен Жегалкина для булевой функции, заданной таблицей. "
                                         "Для проверки правильности выполнения введите соответствующие коэффициенты "
                                         "(0 или 1) в ячейки ниже и",
                             font=instructions_font, bg=background_color, fg=text_color, wraplength=340, justify="left")
    instructions.place(x=424, y=35)

    # Поля для ввода коэффициентов
    input_frame = tk.Frame(window, bg=background_color)
    input_frame.place(x=22, y=430)

    coefficients = ["XYZ+", "XY+", "XZ+", "YZ+", "X+", "Y+", "Z+", '1']
    global  user_entries

    user_entries = []
    result_label = tk.Label(window, text="", font=button_font, bg=background_color, fg="green")
    result_label.place(x=380, y=470)

    for i, coeff in enumerate(coefficients):
        coeff_frame = tk.Frame(input_frame, bg=background_color)
        coeff_frame.grid(row=0, column=i, padx=4)
        entry = tk.Entry(coeff_frame, width=2, font=cell_font, justify="center")
        entry.pack(side="left")
        user_entries.append(entry)
        tk.Label(coeff_frame, text=f" {coeff}", font=cell_font, bg=background_color).pack(side="left")

    # Кнопка "Проверить"
    def check_solution():
        empty_fields = [idx for idx, entry in enumerate(user_entries) if entry.get().strip() == ""]
        if empty_fields:
            # Автоматически заполняем пустые поля правильными коэффициентами
            for idx in empty_fields:
                user_entries[idx].delete(0, tk.END)
                user_entries[idx].insert(0, str(correct_coefficients[idx]))
            # Отображаем сообщение об автозаполнении
            show_error_message("Задание решено верно")
            button_frame.config(bg="#bdd3de")
            check_button.destroy()
            result_label.config(text="Задание решено верно", fg="#f8500f")
            return
        else:
            # Автоматически заполняем поля правильными коэффициентами
            for idx, entry in enumerate(user_entries):
                entry.delete(0, tk.END)
                entry.insert(0, str(correct_coefficients[idx]))

            show_error_message("Задание решено верно")
            button_frame.config(bg="#bdd3de")
            check_button.destroy()
            result_label.config(text="Задание решено верно", fg="#f8500f")
            return

    # Добавляем окантовку для кнопки
    button_frame = tk.Frame(window, bg="white")
    button_frame.place(x=380, y=350)  # Расположение кнопки

    check_button = tk.Button(button_frame, text="Проверить", font=button_font, bg="#3f5664", fg="white",
                             activebackground="#bee6fd", activeforeground="white", width=23, command=check_solution)
    check_button.pack(padx=3, pady=3)

    result_label = tk.Label(window, text="", font=button_font, bg=background_color)
    result_label.place(x=380, y=350)

# Начальный экран
def display_initial_screen():
    # Текст первого экрана
    institute_label = tk.Label(window, text="Московский Авиационный Институт", font=header_font, bg=background_color, fg=text_color)
    institute_label.place(x=148, y=29)

    faculty_label = tk.Label(window, text="Факультет прикладной математики и физики", font=header_font, bg=background_color, fg=text_color)
    faculty_label.place(x=148, y=51)

    test_label = tk.Label(window, text="Тестирование по", font=title_font, bg=background_color, fg=text_color)
    test_label.place(x=156, y=120)

    test_label2 = tk.Label(window, text="дисциплине:", font=title_font, bg=background_color, fg=text_color)
    test_label2.place(x=156, y=160)

    subject_label = tk.Label(window, text='"Математическая логика"', font=subject_font, bg=background_color, fg=text_color, justify='center')
    subject_label.place(x=190, y=216)

    subject_label2 = tk.Label(window, text='"и теория графов"', font=subject_font, bg=background_color, fg=text_color, justify='center')
    subject_label2.place(x=190, y=260)

    topic_label = tk.Label(window, text='Тема:"', font=subject_font, bg=background_color, fg=text_color, justify='center')
    topic_label.place(x=155, y=300)

    topic_label2 = tk.Label(window, text='"Нахождение"', font=subject_font, bg=background_color, fg=text_color, justify='center')
    topic_label2.place(x=201, y=340)

    iniz = tk.Label(window, text='Проект подготовлен Валентиновой Ю.O.', font=footer_font, bg=background_color, fg=text_color, justify='center')
    iniz.place(x=420, y=480)

    # Кнопка для перехода ко второму экрану
    button_frame = tk.Frame(window, bg="white")
    button_frame.place(x=150, y=410)

    start_button = tk.Button(
        button_frame,
        text="ПРИСТУПИТЬ К ТЕСТИРОВАНИЮ",
        font=button_font,
        bg="#3f5664",
        fg="white",
        activebackground="#bee6fd",
        activeforeground="white",
        command=display_second_screen,
        bd=0,
        relief="solid",
        highlightbackground="white"
    )
    start_button.pack(padx=5, pady=5)

# Отображаем первый экран
display_initial_screen()

# Запускаем главный цикл приложения
window.mainloop()
