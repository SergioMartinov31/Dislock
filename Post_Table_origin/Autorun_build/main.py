import random
import sys

from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5 import uic  # Импортируем uic
from PyQt5.QtCore import QSize, Qt, QModelIndex
from PyQt5.QtWidgets import QApplication, QMainWindow, QTableWidgetItem

LENGTH_OF_FUNCTION = 3


if hasattr(QtCore.Qt, 'AA_EnableHighDpiScaling'):
    QtWidgets.QApplication.setAttribute(QtCore.Qt.AA_EnableHighDpiScaling, True)

if hasattr(QtCore.Qt, 'AA_UseHighDpiPixmaps'):
    QtWidgets.QApplication.setAttribute(QtCore.Qt.AA_UseHighDpiPixmaps, True)


class MyWidget(QMainWindow):
    def __init__(self):
        super().__init__()
        uic.loadUi('frontend.ui', self)  # Загружаем дизайн
        self.setWindowTitle("Критерий Поста")
        self.setFixedSize(QSize(1122, 950))
        icon = QtGui.QIcon()
        icon.addPixmap(QtGui.QPixmap("icon.ico"), QtGui.QIcon.Selected, QtGui.QIcon.On)
        self.setWindowIcon(icon)
        self.label.hide()
        self.loading()
        self.pushButton.clicked.connect(self.run_1)
        self.pushButton_2.clicked.connect(self.run_2)
        self.pushButton_3.clicked.connect(self.answ_1)
        self.pushButton_4.clicked.connect(self.answ_2)
        self.pushButton_5.clicked.connect(self.answ_3)
        self.pushButton_6.clicked.connect(self.answ_4)
        self.pushButton_7.clicked.connect(self.answ_5)
        self.pushButton_8.clicked.connect(self.answ_6)
        self.pushButton_9.clicked.connect(self.answ_7)
        self.pushButton_10.clicked.connect(self.answ_8)
        self.pushButton_11.clicked.connect(self.answ_9)
        print(self.answ_1,self.answ_2,)
        self.player_answer = []
        self.stolbci = ["T0", "T1", "L", "M", "S"]
        self.key = 0
        self.last_wing = 0

    def loading(self):
        global func
        self.tableWidget_2.hide()
        self.pushButton_2.hide()
        self.label_18.hide()

        self.label_0.hide()
        self.label_6.hide()
        self.label_7.hide()
        self.label_8.hide()
        self.label_9.hide()
        self.label_10.hide()
        self.label_11.hide()
        self.label_12.hide()
        self.label_13.hide()
        self.label_19.hide()

        self.lineEdit.hide()
        self.lineEdit_2.hide()
        self.lineEdit_3.hide()
        self.lineEdit_4.hide()
        self.lineEdit_5.hide()
        self.lineEdit_6.hide()
        self.lineEdit_7.hide()
        self.lineEdit_8.hide()
        self.lineEdit_9.hide()

        self.pushButton_3.hide()
        self.pushButton_4.hide()
        self.pushButton_5.hide()
        self.pushButton_6.hide()
        self.pushButton_7.hide()
        self.pushButton_8.hide()
        self.pushButton_9.hide()
        self.pushButton_10.hide()
        self.pushButton_11.hide()

        self.label_4.setText("{" + ", ".join(func) + "}")
        # QLabel.set
        self.label_4.setStyleSheet("font-size:14pt; font-weight:600; font-style:italic;")
        self.truth_t = truth_table(func)
        self.post_t = post_table(func)

        # print(self.truth_t)
        # for u in self.post_t:
        #     print(u)

        if "¬" not in func:
            self.tableWidget.setHorizontalHeaderLabels(['X', 'Y', f"X {func[0]} Y", f"X {func[1]} Y", f"X {func[2]} Y"])
        else:
            ss = []
            for u in func:
                if u != "¬":
                    ss.append(f"X {u} Y")
                else:
                    ss.append(f"¬X")
            self.tableWidget.setHorizontalHeaderLabels(['X', 'Y', ss[0], ss[1], ss[2]])
        # self.tableWidget.setItem(0, 0, QTableWidgetItem("0"))
        self.tableWidget.verticalHeader().setDefaultSectionSize(60)
        self.tableWidget.horizontalHeader().setDefaultSectionSize(90)
        self.tableWidget.horizontalHeader().setSectionResizeMode(0, QtWidgets.QHeaderView.Fixed)
        self.tableWidget.horizontalHeader().setSectionResizeMode(1, QtWidgets.QHeaderView.Fixed)
        # QTableWidget.setItem()
        self.tableWidget_2.setHorizontalHeaderLabels(['', 'T0', 'T1', 'L', 'M', 'S'])
        for i in range(3):
            item = QTableWidgetItem(func[i])
            item.setTextAlignment(Qt.AlignCenter)
            item.setBackground(QtGui.QBrush(8))

            item.setFlags(QtCore.Qt.ItemIsEditable)
            item.setFlags(QtCore.Qt.ItemIsEnabled | QtCore.Qt.ItemIsSelectable)
            self.tableWidget_2.setItem(i, 0, item)
        self.tableWidget_2.verticalHeader().setDefaultSectionSize(60)
        self.tableWidget_2.horizontalHeader().setDefaultSectionSize(90)
        self.tableWidget_2.horizontalHeader().setSectionResizeMode(0, QtWidgets.QHeaderView.Fixed)
        self.tableWidget_2.horizontalHeader().setSectionResizeMode(1, QtWidgets.QHeaderView.Fixed)

    def run_1(self):
        error = False
        for i in range(2, 5):
            for u in range(4):
                if self.tableWidget.item(u, i).text() != '':
                    if int(self.tableWidget.item(u, i).text()) == self.truth_t[i - 2][u]:
                        pass
                    else:
                        error = True
                        break
                else:
                    error = True
                    break
        if not error:
            self.pushButton.setStyleSheet("background-color: rgb(54, 255, 32);")
            # self.tableWidget.setSelectionMode(QAbstractItemView.NoSelection)
            # self.tableWidget.setEditTriggers(QAbstractItemView.NoEditTriggers)
            self.tableWidget.setCurrentIndex(QModelIndex())
            self.pushButton.setText("Верно")
            self.pushButton.setEnabled(0)
            self.tableWidget.setEnabled(0)
            self.tableWidget_2.show()
            self.pushButton_2.show()
            self.label_0.show()
        else:
            self.pushButton.setText("Неверно")
            sys.exit()

    def run_2(self):
        error = False
        for i in range(3):
            for u in range(1, 6):
                # print(self.tableWidget_2.item(i, u).text())
                if self.tableWidget_2.item(i, u).text() != '':
                    if type(self.post_t[i][u - 1]) == bool:
                        if self.post_t[i][u - 1]:
                            if self.tableWidget_2.item(i, u).text() == "+":
                                pass
                            else:
                                error = True
                                break
                        else:
                            if self.tableWidget_2.item(i, u).text() == "-":
                                pass
                            else:
                                error = True
                                break
                    else:
                        if self.post_t[i][u - 1][0]:
                            if self.tableWidget_2.item(i, u).text() == "+":
                                pass
                            else:
                                error = True
                                break
                        else:
                            if self.tableWidget_2.item(i, u).text() == "-":
                                pass
                            else:
                                error = True
                                break
                else:
                    error = True
                    break
        if not error:
            self.pushButton_2.setStyleSheet("background-color: rgb(54, 255, 32);")
            self.tableWidget_2.setCurrentIndex(QModelIndex())
            self.pushButton_2.setText("Верно")
            self.pushButton_2.setEnabled(0)
            self.tableWidget_2.setEnabled(0)
            self.label_18.show()
            self.run_others()
            self.run_questions()

        else:
            sys.exit()

    def run_others(self):
        self.questions = 0
        column = 0
        self.list_znak = []
        while column <= 4:
            counter_minus = 0
            znak = 0
            cow = 0
            for u in range(len(self.post_t)):
                if type(self.post_t[u][column]) == bool:
                    if self.post_t[u][column] is False:
                        counter_minus += 1
                        znak = u
                        cow = column
                else:
                    if self.post_t[u][column][0] is False:
                        counter_minus += 1
                        znak = u
                        cow = column
            if counter_minus == 1:
                self.questions += 1
                self.list_znak.append([znak, cow])
            column += 1


    def run_questions(self):
        if self.post_t[0][3][0] is False:
            self.player_answer = self.post_t[0][3]
            self.label_6.setText((self.label_6.text()).replace("znak", func[0], 1))
            self.label_6.show()
            self.lineEdit.show()
            self.pushButton_3.show()
        elif self.post_t[1][3][0] is False:
            self.player_answer = self.post_t[1][3]
            self.label_7.setText((self.label_7.text()).replace("znak", func[1], 1))
            self.label_7.show()
            self.lineEdit_2.show()
            self.pushButton_4.show()
        elif self.post_t[2][3][0] is False:
            self.player_answer = self.post_t[2][3]
            self.label_8.setText((self.label_8.text()).replace("znak", func[2], 1))
            self.label_8.show()
            self.lineEdit_3.show()
            self.pushButton_5.show()
        elif self.post_t[0][4][0] is False:
            self.player_answer = self.post_t[0][4]
            self.label_9.setText((self.label_9.text()).replace("znak", func[0], 1))
            self.label_9.show()
            self.lineEdit_4.show()
            self.pushButton_6.show()
        elif self.post_t[1][4][0] is False:
            self.player_answer = self.post_t[1][4]
            self.label_10.setText((self.label_10.text()).replace("znak", func[1], 1))
            self.label_10.show()
            self.lineEdit_5.show()
            self.pushButton_7.show()
        elif self.post_t[2][4][0] is False:
            self.player_answer = self.post_t[2][4]
            self.label_11.setText((self.label_11.text()).replace("znak", func[2], 1))
            self.label_11.show()
            self.lineEdit_6.show()
            self.pushButton_8.show()
        else:
            if self.questions > 0:
                if self.key == 0:
                    key = 0

                    tex = (self.label_12.text()).replace("znak", func[self.list_znak[0][0]], 1)
                    for u in func:
                        if func[self.list_znak[0][0]] != u and key == 0:
                            tex = tex.replace("znak2", u, 1)
                            key = 1
                        elif func[self.list_znak[0][0]] != u and key == 1:
                            tex = tex.replace("znak3", u, 1)
                    self.label_12.setText(tex)
                    self.label_12.show()
                    self.lineEdit_7.show()
                    self.pushButton_9.show()
                    self.key += 1
                elif self.key == 1:
                    key = 0
                    tex = (self.label_13.text()).replace("znak", func[self.list_znak[0][0]], 1)
                    for u in func:
                        if func[self.list_znak[0][0]] != u and key == 0:
                            tex = tex.replace("znak2", u, 1)
                            key = 1
                        elif func[self.list_znak[0][0]] != u and key == 1:
                            tex = tex.replace("znak3", u, 1)
                    self.label_13.setText(tex)
                    self.label_13.show()
                    self.lineEdit_8.show()
                    self.pushButton_10.show()
                    self.key += 1
                elif self.key == 2:
                    key = 0
                    tex = (self.label_19.text()).replace("znak", func[self.list_znak[0][0]], 1)
                    for u in func:
                        if func[self.list_znak[0][0]] != u and key == 0:
                            tex = tex.replace("znak2", u, 1)
                            key = 1
                        elif func[self.list_znak[0][0]] != u and key == 1:
                            tex = tex.replace("znak3", u, 1)
                    self.label_19.setText(tex)
                    self.label_19.show()
                    self.lineEdit_9.show()
                    self.pushButton_11.show()
                    self.key += 1
            else:
                self.label.show()

    def answ_1(self):
        text = list(map(int, (self.lineEdit.text()).split()))
        text.sort()
        key = 0
        for i in self.player_answer:
            if i == text:
                key = 1
                break
        if key == 1:
            self.pushButton_3.setStyleSheet("background-color: rgb(54, 255, 32);")
            self.pushButton_3.setText("Верно")
            self.pushButton_3.setEnabled(0)
            self.lineEdit.setEnabled(0)
            self.label_6.setEnabled(0)
            self.post_t[0][3][0] = True
            self.run_questions()
        else:
            sys.exit()

    def answ_2(self):
        text = list(map(int, (self.lineEdit_2.text()).split()))
        text.sort()
        key = 0
        for i in self.player_answer:
            if i == text:
                key = 1
                break
        if key == 1:
            self.pushButton_4.setStyleSheet("background-color: rgb(54, 255, 32);")
            self.pushButton_4.setEnabled(0)
            self.pushButton_4.setText("Верно")
            self.lineEdit_2.setEnabled(0)
            self.label_7.setEnabled(0)
            self.post_t[1][3][0] = True
            self.run_questions()
        else:
            sys.exit()

    def answ_3(self):
        text = list(map(int, (self.lineEdit_3.text()).split()))
        text.sort()
        key = 0
        for i in self.player_answer:
            if i == text:
                key = 1
                break
        if key == 1:
            self.pushButton_5.setStyleSheet("background-color: rgb(54, 255, 32);")
            self.pushButton_5.setEnabled(0)
            self.pushButton_5.setText("Верно")
            self.lineEdit_3.setEnabled(0)
            self.label_8.setEnabled(0)
            self.post_t[2][3][0] = True
            self.run_questions()
        else:
            sys.exit()

    def answ_4(self):
        text = list(map(int, (self.lineEdit_4.text()).split()))
        text.sort()
        key = 0
        for i in self.player_answer:
            if i == text:
                key = 1
                break
        if key == 1:
            self.pushButton_6.setStyleSheet("background-color: rgb(54, 255, 32);")
            self.pushButton_6.setEnabled(0)
            self.pushButton_6.setText("Верно")
            self.lineEdit_4.setEnabled(0)
            self.label_9.setEnabled(0)
            self.post_t[0][4][0] = True
            self.run_questions()
        else:
            sys.exit()

    def answ_5(self):
        text = list(map(int, (self.lineEdit_5.text()).split()))
        text.sort()
        key = 0
        for i in self.player_answer:
            if i == text:
                key = 1
                break
        if key == 1:
            self.pushButton_7.setStyleSheet("background-color: rgb(54, 255, 32);")
            self.pushButton_7.setEnabled(0)
            self.pushButton_7.setText("Верно")
            self.lineEdit_5.setEnabled(0)
            self.label_10.setEnabled(0)
            self.post_t[1][4][0] = True
            self.run_questions()
        else:
            sys.exit()

    def answ_6(self):
        text = list(map(int, (self.lineEdit_6.text()).split()))
        text.sort()
        key = 0
        for i in self.player_answer:
            if i == text:
                key = 1
                break
        if key == 1:
            self.pushButton_8.setStyleSheet("background-color: rgb(54, 255, 32);")
            self.pushButton_8.setEnabled(0)
            self.pushButton_8.setText("Верно")
            self.lineEdit_6.setEnabled(0)
            self.label_11.setEnabled(0)
            self.post_t[2][4][0] = True
            self.run_questions()
        else:
            sys.exit()

    def answ_7(self):
        text = (self.lineEdit_7.text()).replace(" ", "")
        if text == self.stolbci[self.list_znak[0][1]]:
            self.pushButton_9.setStyleSheet("background-color: rgb(54, 255, 32);")
            self.pushButton_9.setEnabled(0)
            self.pushButton_9.setText("Верно")
            self.lineEdit_7.setEnabled(0)
            self.label_12.setEnabled(0)
            del self.list_znak[0]
            self.questions -= 1
            if self.questions > 0:
                self.run_questions()
            else:
                self.label.show()
        else:
            sys.exit()

    def answ_8(self):
        text = (self.lineEdit_8.text()).replace(" ", "")
        if text == self.stolbci[self.list_znak[0][1]]:
            self.pushButton_10.setStyleSheet("background-color: rgb(54, 255, 32);")
            self.pushButton_10.setEnabled(0)
            self.pushButton_10.setText("Верно")
            self.lineEdit_8.setEnabled(0)
            self.label_13.setEnabled(0)
            del self.list_znak[0]
            self.questions -= 1
            if self.questions > 0:
                self.run_questions()
            else:
                self.label.show()
        else:
            sys.exit()

    def answ_9(self):
        text = (self.lineEdit_9.text()).replace(" ", "")
        if text == self.stolbci[self.list_znak[0][1]]:
            self.pushButton_11.setStyleSheet("background-color: rgb(54, 255, 32);")
            self.pushButton_11.setEnabled(0)
            self.pushButton_11.setText("Верно")
            self.lineEdit_9.setEnabled(0)
            self.label_19.setEnabled(0)
            del self.list_znak[0]
            self.questions -= 1
            if self.questions > 0:
                self.run_questions()
            else:
                self.label.show()
        else:
            sys.exit()


def random_func():
    ops = ['¬', '&', '∨', '+', '⊃', '~']
    res = []
    for i in range(LENGTH_OF_FUNCTION):
        idx = random.randint(0, len(ops) - 1)
        res.append(ops[idx])
        ops.pop(idx)
    return res


def bool_calc(op, x, y):
    if op == '¬':
        return not x
    elif op == '&':
        return bool(x and y)
    elif op == '∨':
        return bool(x or y)
    elif op == '+':
        return x != y
    elif op == '⊃':
        return x <= y
    elif op == '~':
        return x == y


# x, y = 1, 1 in the top of the table
def truth_table(func):
    table = []
    for i in range(len(func)):
        table.append([])
        for x in [1, 0]:
            for y in [1, 0]:
                table[i].append(bool_calc(func[i], x, y))
    return table


def T0(op):
    if bool_calc(op, 0, 0) == 0:
        return True
    return False


def T1(op):
    if bool_calc(op, 1, 1) == 1:
        return True
    return False


# returning list: [True/False, [lines which explains why False (only pairs)]]
def S(op):
    res = []
    table = truth_table([op])[0]  # one column from truth table
    if (table[0] == table[3]):
        res.append(False)
        res.append([1, 4])
        if (table[1] == table[2]):
            res.append([2, 3])
    elif (table[1] == table[2]):
        res.append(False)
        res.append([2, 3])
    else:
        res.append(True)
    return res


def zhegalkin(op):
    f = truth_table([op])
    for i in range(3):
        buf = []
        for j in range(len(f[i]) - 1):
            buf.append((f[i][j] + f[i][j + 1]) % 2)
        f.append(buf)
    res = []
    for i in range(len(f)):
        res.append(f[i][0])
    return res


def L(op):
    zheg = zhegalkin(op)
    if (zheg[3] == 1):
        return False
    return True


# returning list: [True/False, [lines which explains why False (only pairs)]]
def M(op):
    res = []
    table = truth_table([op])[0]
    if (table[0] < table[1]):
        if len(res) == 0:
            res.append(False)
        res.append([1, 2])
    if (table[0] < table[2]):
        if len(res) == 0:
            res.append(False)
        res.append([1, 3])
    if (table[0] < table[3]):
        if len(res) == 0:
            res.append(False)
        res.append([1, 4])
    if (table[1] < table[3]):
        if len(res) == 0:
            res.append(False)
        res.append([2, 4])
    if (table[2] < table[3]):
        if len(res) == 0:
            res.append(False)
        res.append([3, 4])
    if (len(res) == 0):
        res.append(True)
    return res


# T0, T1, L, M, S
def post_table(func):
    table = []
    for i in range(len(func)):
        table.append([T0(func[i]), T1(func[i]), L(func[i]), M(func[i]), S(func[i])])
    print('T0 T1 L M S\n')
    for i in table:
        print(i)
    print('\n')
    return table


if __name__ == '__main__':
    app = QApplication(sys.argv)
    func = random_func()
    ex = MyWidget()
    ex.show()
    sys.exit(app.exec_())
