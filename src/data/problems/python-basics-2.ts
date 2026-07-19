import type { Problem } from '@/types/course'

// Сборник задач: Основы Python, часть 2
export const problems: Problem[] = [
  {
    type: 'quiz',
    id: 'b1',
    difficulty: 'medium',
    question: 'Что выведет код `print(0.1 + 0.2 == 0.3)`?',
    options: [
      '`True` — числа равны математически, значит равны и в Python',
      '`False` — из-за двоичного представления float сумма равна 0.30000000000000004',
      'Ошибка `TypeError` — числа с плавающей точкой нельзя сравнивать через `==`',
      '`True`, но интерпретатор выдаст предупреждение о потере точности',
    ],
    correctIndex: 1,
    explanation:
      'Числа 0.1 и 0.2 не представимы точно в двоичном виде, поэтому их сумма чуть больше 0.3. Ошибки не будет — сравнение просто вернёт `False`; для денег и других точных величин используйте `decimal.Decimal`.',
  },
  {
    type: 'quiz',
    id: 'b2',
    difficulty: 'medium',
    question: 'Что вернёт выражение `list(zip([1, 2, 3], [\'a\', \'b\']))`?',
    options: [
      '`[(1, \'a\'), (2, \'b\')]` — `zip` останавливается на самом коротком итерируемом',
      '`[(1, \'a\'), (2, \'b\'), (3, None)]` — недостающие позиции дополняются `None`',
      'Ошибка `ValueError` — объединять итерируемые разной длины нельзя',
      '`[(1, \'a\'), (2, \'b\'), (3,)]` — последний кортеж останется неполным',
    ],
    correctIndex: 0,
    explanation:
      '`zip` завершает работу, как только исчерпался самый короткий источник, — элемент `3` просто отбрасывается. Дополнить недостающие значения `None` умеет `itertools.zip_longest`, а начиная с Python 3.10 `zip(..., strict=True)` бросает `ValueError` при разной длине.',
  },
  {
    type: 'code',
    id: 'b3',
    difficulty: 'medium',
    title: 'Нормализация телефонного номера',
    description:
      'Пользователи вводят телефоны как попало: `8 (912) 345-67-89`, `+7 912 345 67 89`. Напишите функцию `normalize_phone(raw)`, которая оставляет только цифры, заменяет ведущую `8` на `7` и возвращает строку вида `+7XXXXXXXXXX`. Если после очистки получилось не 11 цифр или номер начинается не с 7/8 — верните `None`.',
    language: 'python',
    starterCode: `def normalize_phone(raw):
    # TODO: оставьте только цифры, замените ведущую 8 на 7
    # и верните строку '+7...' либо None, если номер некорректен
    pass


print(normalize_phone('8 (912) 345-67-89'))   # +79123456789
print(normalize_phone('+7 912 345 67 89'))    # +79123456789
print(normalize_phone('12345'))               # None`,
    hints: [
      'Соберите цифры генераторным выражением: `\'\'.join(ch for ch in raw if ch.isdigit())`.',
      'В номере с кодом страны должно быть ровно 11 цифр — иначе сразу возвращайте `None`.',
      'Если первая цифра `8`, замените её срезом: `\'7\' + digits[1:]`. В конце проверьте, что номер начинается с `7`, и добавьте `+`.',
    ],
    solution: `def normalize_phone(raw):
    digits = ''.join(ch for ch in raw if ch.isdigit())
    if len(digits) != 11:
        return None
    if digits[0] == '8':
        digits = '7' + digits[1:]
    if digits[0] != '7':
        return None
    return '+' + digits


print(normalize_phone('8 (912) 345-67-89'))   # +79123456789
print(normalize_phone('+7 912 345 67 89'))    # +79123456789
print(normalize_phone('12345'))               # None`,
  },
  {
    type: 'quiz',
    id: 'b4',
    difficulty: 'medium',
    question:
      'Выполняется код: `numbers = [3, 1, 2]`, затем `result = numbers.sort()` и `print(result, numbers)`. Что будет выведено?',
    options: [
      '`[1, 2, 3] [1, 2, 3]` — `sort()` возвращает отсортированный список',
      '`None [1, 2, 3]` — `sort()` сортирует список на месте и возвращает `None`',
      '`[1, 2, 3] [3, 1, 2]` — `sort()` возвращает новый список, не трогая исходный',
      '`None [3, 1, 2]` — без присваивания результата сортировка не применяется',
    ],
    correctIndex: 1,
    explanation:
      'Метод `sort()` изменяет список на месте, а возвращает `None` — по соглашению Python методы, меняющие объект, не возвращают его. Получить новый отсортированный список, не трогая исходный, позволяет функция `sorted(numbers)`.',
  },
  {
    type: 'code',
    id: 'b5',
    difficulty: 'medium',
    title: 'Группировка заказов по статусу',
    description:
      'Из БД пришёл список заказов — словарей с полями `id` и `status`. Напишите функцию `group_by_status(orders)`, которая вернёт словарь вида `{статус: [список id]}`. Порядок id внутри группы должен совпадать с порядком в исходном списке.',
    language: 'python',
    starterCode: `orders = [
    {'id': 1, 'status': 'paid'},
    {'id': 2, 'status': 'new'},
    {'id': 3, 'status': 'paid'},
    {'id': 4, 'status': 'canceled'},
]


def group_by_status(orders):
    # TODO: верните словарь {статус: [id, ...]}
    pass


print(group_by_status(orders))
# {'paid': [1, 3], 'new': [2], 'canceled': [4]}`,
    hints: [
      'Заведите пустой словарь и в цикле добавляйте `order[\'id\']` в список по ключу `order[\'status\']`.',
      'Чтобы не проверять `if status not in grouped`, используйте `dict.setdefault(status, [])` — он вернёт существующий список или создаст новый.',
      'Одной строкой в цикле: `grouped.setdefault(order[\'status\'], []).append(order[\'id\'])`.',
    ],
    solution: `orders = [
    {'id': 1, 'status': 'paid'},
    {'id': 2, 'status': 'new'},
    {'id': 3, 'status': 'paid'},
    {'id': 4, 'status': 'canceled'},
]


def group_by_status(orders):
    grouped = {}
    for order in orders:
        grouped.setdefault(order['status'], []).append(order['id'])
    return grouped


print(group_by_status(orders))
# {'paid': [1, 3], 'new': [2], 'canceled': [4]}`,
  },
  {
    type: 'quiz',
    id: 'b6',
    difficulty: 'medium',
    question:
      'Функция объявлена как `def create_user(name, *, role=\'user\')`. Как правильно передать роль при вызове?',
    options: [
      '`create_user(\'bob\', \'admin\')` — второй аргумент подставится в `role` позиционно',
      'Никак — одиночная звёздочка в сигнатуре является синтаксической ошибкой',
      '`create_user(\'bob\', admin)` — после звёздочки аргументы передаются без кавычек',
      '`create_user(\'bob\', role=\'admin\')` — параметры после `*` можно передавать только по имени',
    ],
    correctIndex: 3,
    explanation:
      'Одиночная `*` в сигнатуре делает все последующие параметры keyword-only: их можно передать только по имени. Позиционный вызов `create_user(\'bob\', \'admin\')` упадёт с `TypeError`.',
  },
  {
    type: 'quiz',
    id: 'b7',
    difficulty: 'medium',
    question:
      'Что вернёт `sorted(users, key=lambda u: u[1])` для списка `users = [(\'bob\', 30), (\'alice\', 25), (\'carol\', 30)]`?',
    options: [
      '`[(\'alice\', 25), (\'carol\', 30), (\'bob\', 30)]` — при равных ключах порядок непредсказуем',
      '`[(\'bob\', 30), (\'carol\', 30), (\'alice\', 25)]` — сортировка по убыванию ключа',
      '`[(\'alice\', 25), (\'bob\', 30), (\'carol\', 30)]` — сортировка стабильна, `bob` остаётся раньше `carol`',
      '`TypeError` — кортежи нельзя сортировать по отдельному элементу',
    ],
    correctIndex: 2,
    explanation:
      'Timsort в Python стабилен: элементы с одинаковым ключом сохраняют исходный взаимный порядок, поэтому `bob` идёт раньше `carol`. На это свойство можно опираться при многоступенчатой сортировке.',
  },
  {
    type: 'code',
    id: 'b8',
    difficulty: 'medium',
    title: 'Безопасный доступ к вложенному конфигу',
    description:
      'JSON-конфиги приходят как вложенные словари, и любой ключ может отсутствовать. Напишите функцию `safe_get(data, path, default=None)`, где `path` — строка вида `\'db.pool.size\'`. Функция идёт по ключам через точку и возвращает найденное значение либо `default`, если ключа нет или промежуточное значение — не словарь.',
    language: 'python',
    starterCode: `config = {'db': {'pool': {'size': 10}}, 'debug': False}


def safe_get(data, path, default=None):
    # TODO: пройдите по ключам из path (разделитель — точка)
    # и верните значение или default
    pass


print(safe_get(config, 'db.pool.size'))          # 10
print(safe_get(config, 'db.host', 'localhost'))  # localhost
print(safe_get(config, 'debug.level'))           # None (False — не словарь)`,
    hints: [
      'Разбейте путь методом `path.split(\'.\')` и идите по ключам в цикле, храня текущее значение.',
      'Перед обращением по ключу проверяйте два условия: текущее значение — словарь (`isinstance(current, dict)`) и ключ в нём есть.',
      'Если любая проверка не прошла — сразу `return default`; после цикла верните накопленное значение.',
    ],
    solution: `config = {'db': {'pool': {'size': 10}}, 'debug': False}


def safe_get(data, path, default=None):
    current = data
    for key in path.split('.'):
        if not isinstance(current, dict) or key not in current:
            return default
        current = current[key]
    return current


print(safe_get(config, 'db.pool.size'))          # 10
print(safe_get(config, 'db.host', 'localhost'))  # localhost
print(safe_get(config, 'debug.level'))           # None (False — не словарь)`,
  },
  {
    type: 'quiz',
    id: 'b9',
    difficulty: 'medium',
    question:
      'В строке два пробела подряд: `\'a  b\'`. Чем результат `\'a  b\'.split(\' \')` отличается от `\'a  b\'.split()`?',
    options: [
      'Ничем — `split` в обоих случаях вернёт `[\'a\', \'b\']`',
      '`split(\' \')` вернёт `[\'a\', \'\', \'b\']` — при явном разделителе пустые строки между соседними пробелами сохраняются',
      '`split(\' \')` вернёт `[\'a\', \' \', \'b\']` — разделитель попадает в результат',
      '`split(\' \')` вызовет `ValueError` — разделитель не может быть пробелом',
    ],
    correctIndex: 1,
    explanation:
      '`split()` без аргументов схлопывает любые последовательности пробельных символов и отбрасывает пустые куски, а `split(\' \')` режет строго по каждому пробелу, оставляя пустые строки. Это частая причина «лишних» элементов при разборе логов.',
  },
  {
    type: 'code',
    id: 'b10',
    difficulty: 'medium',
    title: 'Счётчик уровней в лог-файле',
    description:
      'В файле `app.log` каждая строка имеет вид `2026-07-17 10:00:01 LEVEL сообщение` — уровень лога стоит третьим полем. Напишите функцию `count_levels(path)`, которая читает файл построчно и возвращает словарь `{уровень: количество}`. Пустые и битые строки (меньше трёх полей) пропускайте.',
    language: 'python',
    starterCode: `with open('app.log', 'w', encoding='utf-8') as f:
    f.write('2026-07-17 10:00:01 INFO Server started\\n')
    f.write('2026-07-17 10:00:05 ERROR Payment failed\\n')
    f.write('\\n')
    f.write('2026-07-17 10:00:09 ERROR DB timeout\\n')
    f.write('2026-07-17 10:00:12 WARNING Slow query\\n')


def count_levels(path):
    # TODO: прочитайте файл построчно и посчитайте уровни
    pass


print(count_levels('app.log'))
# {'INFO': 1, 'ERROR': 2, 'WARNING': 1}`,
    hints: [
      'Файловый объект — итератор по строкам: `for line in f` читает файл лениво, не загружая его в память целиком.',
      'Разберите строку через `line.split()` и проверьте `len(parts) >= 3`, чтобы пропустить пустые и битые строки.',
      'Для подсчёта удобен `counts.get(level, 0) + 1` — не нужно заранее знать все уровни.',
    ],
    solution: `with open('app.log', 'w', encoding='utf-8') as f:
    f.write('2026-07-17 10:00:01 INFO Server started\\n')
    f.write('2026-07-17 10:00:05 ERROR Payment failed\\n')
    f.write('\\n')
    f.write('2026-07-17 10:00:09 ERROR DB timeout\\n')
    f.write('2026-07-17 10:00:12 WARNING Slow query\\n')


def count_levels(path):
    counts = {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            parts = line.split()
            if len(parts) < 3:
                continue
            level = parts[2]
            counts[level] = counts.get(level, 0) + 1
    return counts


print(count_levels('app.log'))
# {'INFO': 1, 'ERROR': 2, 'WARNING': 1}`,
  },
  {
    type: 'quiz',
    id: 'b11',
    difficulty: 'medium',
    question:
      'Найдите ошибку: в обработчике сначала стоит `except Exception: log_error()`, а ниже — `except ValueError: fix_value()`. Что не так?',
    options: [
      'Блок `except ValueError` никогда не выполнится: `Exception` перехватывает всё раньше него',
      'Код не запустится: два блока `except` у одного `try` запрещены',
      'Ошибки нет: Python сам выбирает самый специфичный обработчик независимо от порядка',
      '`ValueError` обработается дважды — сначала общим блоком, потом специфичным',
    ],
    correctIndex: 0,
    explanation:
      'Блоки `except` проверяются сверху вниз, и `ValueError` — подкласс `Exception`, поэтому до второго блока дело не дойдёт. Специфичные исключения всегда ставят раньше общих; несколько `except` у одного `try` — это нормально.',
  },
  {
    type: 'code',
    id: 'b12',
    difficulty: 'medium',
    title: 'Dataclass заказа с изменяемым полем',
    description:
      'Опишите заказ через `@dataclass`: поля `id` (int) и `items` — список пар `(название, цена)`, по умолчанию пустой. Добавьте метод `total()`, возвращающий сумму цен. Важно: пустой список по умолчанию нужно задать так, чтобы разные заказы **не делили** один список.',
    language: 'python',
    starterCode: `from dataclasses import dataclass

# TODO: объявите @dataclass Order с полями id и items
# (items по умолчанию — пустой список!) и методом total()


order = Order(1)
order.items.append(('coffee', 250))
order.items.append(('bagel', 150))
print(order.total())     # 400
print(Order(2).items)    # [] — у каждого заказа свой список`,
    hints: [
      'Записать `items: list = []` нельзя — dataclass запретит изменяемое значение по умолчанию и поднимет `ValueError` при создании класса.',
      'Импортируйте `field` из `dataclasses` и используйте `field(default_factory=list)` — фабрика создаёт новый список для каждого экземпляра.',
      'В `total()` пройдитесь по парам: `sum(price for _, price in self.items)`.',
    ],
    solution: `from dataclasses import dataclass, field


@dataclass
class Order:
    id: int
    items: list = field(default_factory=list)

    def total(self):
        return sum(price for _, price in self.items)


order = Order(1)
order.items.append(('coffee', 250))
order.items.append(('bagel', 150))
print(order.total())     # 400
print(Order(2).items)    # [] — у каждого заказа свой список`,
  },
  {
    type: 'quiz',
    id: 'b13',
    difficulty: 'hard',
    question: 'Выполняется код: `t = (1, 2, [3])`, затем `t[2] += [4]`. Что произойдёт?',
    options: [
      'Ошибка `TypeError`, список останется `[3]` — кортеж неизменяем, поэтому операция откатится полностью',
      'Код отработает без ошибок: меняется вложенный список, а не сам кортеж',
      'Ошибка `TypeError`, но список внутри кортежа всё же станет `[3, 4]`: `+=` успел изменить его на месте, а упало только присваивание элемента кортежа',
      'Ошибка `AttributeError`: у кортежа нет метода `__iadd__`',
    ],
    correctIndex: 2,
    explanation:
      'Запись `t[2] += [4]` разворачивается в `t[2] = t[2].__iadd__([4])`: сначала список дописывается на месте (это разрешено), затем результат присваивается обратно в кортеж — и вот это падает с `TypeError`. Итог — исключение и при этом «наполовину применённая» операция: список уже `[3, 4]`.',
  },
  {
    type: 'quiz',
    id: 'b14',
    difficulty: 'hard',
    question:
      'Выполнен код: `a = [1, 2]`, `b = a`, `a += [3]`, затем `a = a + [4]`. Что теперь в `b`?',
    options: [
      '`[1, 2]` — `b` получил копию списка ещё при присваивании',
      '`[1, 2, 3, 4]` — `b` и `a` навсегда остаются одним объектом',
      '`[1, 2, 4]` — оператор `+` изменяет список на месте, а `+=` создаёт новый',
      '`[1, 2, 3]` — `+=` изменил общий список на месте, а `a + [4]` создал новый объект, на который `b` уже не ссылается',
    ],
    correctIndex: 3,
    explanation:
      'Для списков `+=` вызывает `__iadd__` и дописывает элементы в тот же объект, который виден и через `b`. А `a = a + [4]` создаёт новый список и перепривязывает только имя `a` — `b` продолжает указывать на старый объект `[1, 2, 3]`.',
  },
  {
    type: 'code',
    id: 'b15',
    difficulty: 'hard',
    title: 'Последние N строк большого лога',
    description:
      'Нужен аналог команды `tail`: функция `tail(path, n)` возвращает список последних `n` строк файла. Файл может весить гигабайты, поэтому держать его целиком в памяти нельзя — храните не больше `n` строк одновременно. Используйте `collections.deque`.',
    language: 'python',
    starterCode: `from collections import deque

with open('big.log', 'w', encoding='utf-8') as f:
    for i in range(1, 10001):
        f.write(f'line {i}\\n')


def tail(path, n=10):
    # TODO: верните последние n строк, не загружая файл целиком
    pass


print(tail('big.log', 3))
# ['line 9998\\n', 'line 9999\\n', 'line 10000\\n']`,
    hints: [
      'Читайте файл построчно (`for line in f`) — так в памяти находится только текущая строка и буфер.',
      '`deque(maxlen=n)` автоматически выталкивает старые элементы слева, когда добавляется новый справа.',
      'Можно вообще без цикла: `deque(f, maxlen=n)` — deque сам прочитает итератор. Останется обернуть в `list(...)`.',
    ],
    solution: `from collections import deque

with open('big.log', 'w', encoding='utf-8') as f:
    for i in range(1, 10001):
        f.write(f'line {i}\\n')


def tail(path, n=10):
    with open(path, encoding='utf-8') as f:
        return list(deque(f, maxlen=n))


print(tail('big.log', 3))
# ['line 9998\\n', 'line 9999\\n', 'line 10000\\n']`,
  },
  {
    type: 'quiz',
    id: 'b16',
    difficulty: 'hard',
    question:
      'На уровне модуля объявлено `counter = 0`. Функция содержит единственную строку `counter += 1` (без `global`). Что произойдёт при её вызове?',
    options: [
      'Глобальный `counter` увеличится до 1',
      'Ошибка `UnboundLocalError`: присваивание делает имя локальным, и функция пытается прочитать локальную переменную до её инициализации',
      'Внутри функции создастся локальная переменная со значением 1, а глобальная останется равной 0',
      'Ошибка `NameError`: из функции глобальные переменные не видны',
    ],
    correctIndex: 1,
    explanation:
      'Python на этапе компиляции функции помечает имя локальным, если внутри есть хоть одно присваивание ему, а `counter += 1` — это чтение плюс присваивание. Чтение ещё не инициализированной локальной переменной даёт `UnboundLocalError`. Менять глобальную переменную позволяет объявление `global counter`, но чаще правильнее передать значение аргументом и вернуть новое.',
  },
  {
    type: 'code',
    id: 'b17',
    difficulty: 'hard',
    title: 'Транзакция как контекстный менеджер',
    description:
      'Оформите работу с транзакцией БД через протокол контекстного менеджера. Напишите класс `Transaction(db)`: `__enter__` вызывает `db.begin()` и возвращает `self`; `__exit__` вызывает `db.commit()`, если блок завершился без ошибок, и `db.rollback()`, если внутри произошло исключение. Само исключение менеджер подавлять **не должен**.',
    language: 'python',
    starterCode: `class FakeDB:
    def begin(self):
        print('BEGIN')

    def commit(self):
        print('COMMIT')

    def rollback(self):
        print('ROLLBACK')


class Transaction:
    def __init__(self, db):
        self.db = db

    # TODO: реализуйте __enter__ и __exit__(exc_type, exc, tb)


with Transaction(FakeDB()):
    print('insert row')
# BEGIN / insert row / COMMIT

try:
    with Transaction(FakeDB()):
        raise ValueError('битые данные')
except ValueError:
    print('ошибка дошла до вызывающего кода')
# BEGIN / ROLLBACK / ошибка дошла до вызывающего кода`,
    hints: [
      '`__enter__` выполняется при входе в блок `with`: вызовите `self.db.begin()` и верните `self`.',
      '`__exit__` принимает `exc_type, exc, tb`; признак успеха — `exc_type is None`: тогда вызывайте `commit`, иначе `rollback`.',
      'Верните из `__exit__` значение `False` (или `None`) — тогда исключение полетит дальше и его поймает внешний `try`. Вернёте `True` — ошибка будет молча проглочена.',
    ],
    solution: `class FakeDB:
    def begin(self):
        print('BEGIN')

    def commit(self):
        print('COMMIT')

    def rollback(self):
        print('ROLLBACK')


class Transaction:
    def __init__(self, db):
        self.db = db

    def __enter__(self):
        self.db.begin()
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type is None:
            self.db.commit()
        else:
            self.db.rollback()
        return False  # исключение не подавляем


with Transaction(FakeDB()):
    print('insert row')
# BEGIN / insert row / COMMIT

try:
    with Transaction(FakeDB()):
        raise ValueError('битые данные')
except ValueError:
    print('ошибка дошла до вызывающего кода')
# BEGIN / ROLLBACK / ошибка дошла до вызывающего кода`,
  },
  {
    type: 'quiz',
    id: 'b18',
    difficulty: 'hard',
    question:
      'Классы: `A` определяет метод `hello`, `B(A)` и `C(A)` его переопределяют, а `D(B, C)` — нет. Что вернёт `D().hello()`?',
    options: [
      'Версию из `B` — MRO обходит классы в порядке `D → B → C → A`',
      'Версию из `A` — Python всегда поднимается сразу к общему базовому классу',
      'Версию из `C` — побеждает последний класс в списке наследования',
      '`TypeError` — ромбовидное наследование в Python запрещено',
    ],
    correctIndex: 0,
    explanation:
      'Python строит порядок разрешения методов (MRO) по алгоритму C3: для `D(B, C)` это `D, B, C, A`, поэтому найдётся метод из `B`. Ромбовидное наследование разрешено — посмотреть порядок можно через `D.__mro__`.',
  },
  {
    type: 'quiz',
    id: 'b19',
    difficulty: 'hard',
    question:
      'Есть генератор `g = (x * x for x in range(3))`. Выполнили `print(sum(g))`, затем `print(list(g))`. Что выведет второй `print`?',
    options: [
      '`[0, 1, 4]` — генератор можно обходить сколько угодно раз',
      'Программа упадёт: `StopIteration` вылетит наружу',
      '`[]` — генератор одноразовый: `sum` уже прошёл его до конца, и повторный обход не даст значений',
      '`[5]` — генератор вернёт накопленную сумму',
    ],
    correctIndex: 2,
    explanation:
      'Генераторное выражение создаёт одноразовый итератор: `sum(g)` исчерпал его, после чего каждый `next` сразу поднимает `StopIteration`, который `list` воспринимает как штатный конец — получается пустой список, без ошибки. Нужен повторный проход — создайте генератор заново или сохраните данные в список.',
  },
  {
    type: 'code',
    id: 'b20',
    difficulty: 'hard',
    title: 'Итератор экспоненциальных задержек',
    description:
      'Для повторных попыток обращения к внешнему API нужен итератор задержек с экспоненциальным ростом. Напишите класс `Backoff(base, cap, attempts)`: реализуйте `__iter__` и `__next__`, чтобы он выдавал `base * 2 ** n` секунд для попыток `n = 0, 1, 2, ...`, но не больше `cap`, и завершался после `attempts` значений.',
    language: 'python',
    starterCode: `class Backoff:
    def __init__(self, base=1, cap=30, attempts=5):
        self.base = base
        self.cap = cap
        self.attempts = attempts
        # TODO: заведите счётчик текущей попытки

    # TODO: реализуйте __iter__ и __next__


print(list(Backoff()))                        # [1, 2, 4, 8, 16]
print(list(Backoff(base=1, cap=10, attempts=6)))  # [1, 2, 4, 8, 10, 10]`,
    hints: [
      '`__iter__` у итератора обычно возвращает `self` — тогда объект можно использовать прямо в `for` и в `list(...)`.',
      'В `__next__` сначала проверьте, не исчерпаны ли попытки, и если да — `raise StopIteration`.',
      'Задержка: `min(self.base * 2 ** self.attempt, self.cap)`; не забудьте увеличить счётчик до `return`.',
    ],
    solution: `class Backoff:
    def __init__(self, base=1, cap=30, attempts=5):
        self.base = base
        self.cap = cap
        self.attempts = attempts
        self.attempt = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.attempt >= self.attempts:
            raise StopIteration
        delay = min(self.base * 2 ** self.attempt, self.cap)
        self.attempt += 1
        return delay


print(list(Backoff()))                        # [1, 2, 4, 8, 16]
print(list(Backoff(base=1, cap=10, attempts=6)))  # [1, 2, 4, 8, 10, 10]`,
  },
  {
    type: 'quiz',
    id: 'b21',
    difficulty: 'hard',
    question:
      'Внутри `except ZeroDivisionError:` код поднимает новое исключение: `raise ValueError(\'bad input\')` — **без** `from`. Что произойдёт с исходной ошибкой деления?',
    options: [
      'Она потеряется без следа — в traceback попадёт только `ValueError`',
      'Python объединит обе ошибки в `ExceptionGroup`',
      'Наружу выйдет `ZeroDivisionError`, а `ValueError` будет проигнорирован',
      'Наружу выйдет `ValueError`, а `ZeroDivisionError` сохранится в его `__context__` и появится в traceback с пометкой «During handling of the above exception...»',
    ],
    correctIndex: 3,
    explanation:
      'Python автоматически связывает исключения: ошибка, во время обработки которой подняли новую, попадает в `__context__` (неявная цепочка). `raise ... from exc` делает связь явной через `__cause__` — но и без него исходная ошибка не теряется.',
  },
  {
    type: 'code',
    id: 'b22',
    difficulty: 'hard',
    title: 'Декоратор retry для нестабильных вызовов',
    description:
      'Сетевые вызовы иногда падают, и их принято повторять. Напишите декоратор с параметрами `retry(times=3, exceptions=(ConnectionError,))`: он вызывает функцию до `times` раз, перехватывая только указанные исключения, и, если все попытки провалились, пробрасывает последнюю ошибку. Имя и докстрока обёрнутой функции должны сохраниться.',
    language: 'python',
    starterCode: `import functools


def retry(times=3, exceptions=(ConnectionError,)):
    # TODO: фабрика декораторов — три уровня вложенности:
    # retry -> decorator -> wrapper
    pass


calls = 0


@retry(times=3)
def flaky():
    global calls
    calls += 1
    if calls < 3:
        raise ConnectionError('network down')
    return 'ok'


print(flaky(), '— попыток:', calls)   # ok — попыток: 3
print(flaky.__name__)                 # flaky`,
    hints: [
      'Декоратор с аргументами — это функция, возвращающая декоратор: `retry` принимает параметры, `decorator` принимает `func`, `wrapper` принимает `*args, **kwargs`.',
      'В `wrapper` крутите цикл `for attempt in range(times)`: успешный вызов — сразу `return`, ошибка из `exceptions` — запомните её и продолжайте.',
      'После цикла выполните `raise last_error`. Не забудьте `@functools.wraps(func)` на `wrapper`, иначе `__name__` станет `wrapper`.',
    ],
    solution: `import functools


def retry(times=3, exceptions=(ConnectionError,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except exceptions as exc:
                    last_error = exc
            raise last_error
        return wrapper
    return decorator


calls = 0


@retry(times=3)
def flaky():
    global calls
    calls += 1
    if calls < 3:
        raise ConnectionError('network down')
    return 'ok'


print(flaky(), '— попыток:', calls)   # ok — попыток: 3
print(flaky.__name__)                 # flaky`,
  },
  {
    type: 'quiz',
    id: 'b23',
    difficulty: 'hard',
    question:
      'Фоновый воркер обёрнут в `try: ... except Exception: log_and_continue()`, чтобы переживать любые сбои. Почему нажатие Ctrl+C всё равно останавливает программу?',
    options: [
      '`KeyboardInterrupt` наследуется от `BaseException`, а не от `Exception`, поэтому `except Exception` его не перехватывает',
      'Ctrl+C завершает процесс на уровне операционной системы, минуя механизм исключений Python',
      'Перехватить `KeyboardInterrupt` в Python невозможно в принципе',
      '`except Exception` ловит только исключения, поднятые оператором `raise` вручную',
    ],
    correctIndex: 0,
    explanation:
      'Сигнальные исключения `KeyboardInterrupt` и `SystemExit` намеренно выведены из-под `Exception` и наследуются напрямую от `BaseException` — чтобы «широкий» `except Exception` не мешал корректно останавливать программу. Перехватить их можно, но только явно (`except KeyboardInterrupt`), и делать это стоит осознанно — например, для аккуратного завершения воркера.',
  },
  {
    type: 'quiz',
    id: 'b24',
    difficulty: 'hard',
    question:
      'Функция собирает большой отчёт из 100 000 фрагментов текста. Какой способ сборки строки лучший и почему?',
    options: [
      '`result += part` в цикле — CPython всегда оптимизирует такую конкатенацию',
      '`result = result + part` — оператор `+` быстрее, чем `+=`',
      'Накопить фрагменты в список и вызвать `\'\'.join(parts)` — одна финальная сборка вместо копирования всей строки на каждой итерации',
      'Разницы нет: строки в Python изменяемые, `+=` дописывает символы на месте',
    ],
    correctIndex: 2,
    explanation:
      'Строки неизменяемы, поэтому каждая конкатенация создаёт новую строку и копирует всё накопленное — в цикле это O(n²). Оптимизация `+=` в CPython существует, но она ситуативная (зависит от количества ссылок на строку) и на неё нельзя полагаться; `join` гарантированно линеен.',
  },
  {
    type: 'code',
    id: 'b25',
    difficulty: 'hard',
    title: 'Ленивое разворачивание вложенных списков',
    description:
      'Из API приходят списки произвольной вложенности: `[1, [2, [3, 4], 5], [[6]]]`. Напишите **генератор** `flatten(items)`, который лениво выдаёт элементы в исходном порядке, разворачивая любую глубину. Строки при этом должны оставаться целыми элементами, а не разбиваться на символы.',
    language: 'python',
    starterCode: `def flatten(items):
    # TODO: рекурсивный генератор — yield from для вложенных списков
    pass


print(list(flatten([1, [2, [3, 4], 5], [], [[6]]])))
# [1, 2, 3, 4, 5, 6]

print(list(flatten(['ab', ['cd', ['ef']]])))
# ['ab', 'cd', 'ef'] — строки не разобраны на буквы`,
    hints: [
      'Идите по `items` циклом: если элемент — список, нужно рекурсивно развернуть его, иначе — выдать как есть.',
      '`yield from flatten(item)` передаёт наружу все значения вложенного генератора — это чище, чем внутренний цикл с `yield`.',
      'Проверяйте именно `isinstance(item, list)`: проверка «любой итерируемый» затянула бы и строки, ведь они тоже итерируемы.',
    ],
    solution: `def flatten(items):
    for item in items:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item


print(list(flatten([1, [2, [3, 4], 5], [], [[6]]])))
# [1, 2, 3, 4, 5, 6]

print(list(flatten(['ab', ['cd', ['ef']]])))
# ['ab', 'cd', 'ef'] — строки не разобраны на буквы`,
  },
  {
    type: 'quiz',
    id: 'b26',
    difficulty: 'hard',
    question:
      'Сервис держит в памяти миллионы объектов `Point`, и в классе объявили `__slots__ = (\'x\', \'y\')`. Что это даёт?',
    options: [
      'Атрибуты фиксируются списком из `__slots__`, у экземпляров исчезает `__dict__` — объекты занимают заметно меньше памяти',
      'Атрибуты становятся приватными — доступ к ним возможен только из методов класса',
      'Python автоматически сгенерирует `__init__` и `__repr__` по списку полей, как `@dataclass`',
      'Ускоряется наследование за счёт кеширования MRO класса',
    ],
    correctIndex: 0,
    explanation:
      '`__slots__` заменяет per-instance словарь `__dict__` фиксированными слотами: экономится память и чуть ускоряется доступ к атрибутам, а попытка создать атрибут вне списка даст `AttributeError`. К приватности и генерации методов это отношения не имеет.',
  },
  {
    type: 'code',
    id: 'b27',
    difficulty: 'hard',
    title: 'Класс Money без ошибок округления',
    description:
      'Хранить деньги во `float` нельзя — накапливаются ошибки округления. Напишите класс `Money`: конструктор принимает сумму (строкой или числом) и валюту, внутри сумма хранится как `Decimal`. Реализуйте `__add__` (складывать можно только одинаковые валюты, иначе `ValueError`), `__eq__` и `__repr__`.',
    language: 'python',
    starterCode: `from decimal import Decimal


class Money:
    def __init__(self, amount, currency='RUB'):
        # TODO: сохраните amount как Decimal (через str!) и currency
        pass

    # TODO: __add__, __eq__, __repr__


print(Money('0.1') + Money('0.2') == Money('0.3'))   # True — Decimal точен
print(Money(100, 'RUB'))                             # Money(100 RUB)
Money(1, 'RUB') + Money(1, 'USD')                    # ValueError`,
    hints: [
      'Создавайте `Decimal(str(amount))`: `Decimal(0.1)` унаследует двоичную погрешность float, а `Decimal(\'0.1\')` — точен.',
      'В `__add__` сначала проверьте `isinstance(other, Money)` (иначе верните `NotImplemented`), затем сравните валюты.',
      '`__eq__` должен сравнивать и сумму, и валюту; для чужих типов возвращайте `NotImplemented`, чтобы Python попробовал сравнение с другой стороны.',
    ],
    solution: `from decimal import Decimal


class Money:
    def __init__(self, amount, currency='RUB'):
        self.amount = Decimal(str(amount))
        self.currency = currency

    def __add__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        if self.currency != other.currency:
            raise ValueError('нельзя складывать разные валюты')
        return Money(self.amount + other.amount, self.currency)

    def __eq__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        return self.amount == other.amount and self.currency == other.currency

    def __repr__(self):
        return f'Money({self.amount} {self.currency})'


print(Money('0.1') + Money('0.2') == Money('0.3'))   # True — Decimal точен
print(Money(100, 'RUB'))                             # Money(100 RUB)
Money(1, 'RUB') + Money(1, 'USD')                    # ValueError`,
  },
  {
    type: 'quiz',
    id: 'b28',
    difficulty: 'hard',
    question:
      'Что выведет код `d = {True: \'yes\', 1: \'no\', 1.0: \'maybe\'}` и затем `print(len(d), d)`?',
    options: [
      '`3` — это три ключа разных типов: bool, int и float',
      '`2` — `True` и `1` схлопнутся, а `1.0` останется отдельным ключом',
      '`TypeError` — `bool` нельзя использовать как ключ словаря',
      '`1 {True: \'maybe\'}` — все три ключа равны и имеют одинаковый хеш, поэтому остаётся первый ключ с последним значением',
    ],
    correctIndex: 3,
    explanation:
      '`bool` — подкласс `int`, и `True == 1 == 1.0`, а равные объекты обязаны иметь равные хеши — для словаря это один ключ. Сохраняется первый встреченный ключ (`True`), но каждое следующее присваивание перезаписывает значение.',
  },
  {
    type: 'code',
    id: 'b29',
    difficulty: 'hard',
    title: 'Ленивое слияние отсортированных потоков',
    description:
      'Два источника отдают события, отсортированные по времени: например, итераторы строк двух логов. Напишите генератор `merge_sorted(a, b)`, который лениво сливает их в один отсортированный поток, не превращая источники в списки. Подсказка-ловушка: внутри генератора нельзя дать `StopIteration` «всплыть» — используйте `next(it, default)`.',
    language: 'python',
    starterCode: `def merge_sorted(a, b):
    # TODO: лениво сливайте два отсортированных итератора;
    # конец итератора определяйте через next(it, sentinel)
    pass


print(list(merge_sorted([1, 3, 5], [2, 3, 6])))
# [1, 2, 3, 3, 5, 6]

print(list(merge_sorted(iter([]), iter([1, 2]))))
# [1, 2]`,
    hints: [
      'Заведите уникальный маркер `sentinel = object()` и читайте элементы через `next(it, sentinel)` — так конец потока не станет исключением.',
      'Пока оба текущих элемента не sentinel: выдавайте меньший и подтягивайте следующий из соответствующего итератора.',
      'Когда один поток кончился, доливайте остаток второго тем же способом — двумя короткими циклами `while x is not sentinel`.',
    ],
    solution: `def merge_sorted(a, b):
    sentinel = object()
    it_a, it_b = iter(a), iter(b)
    x, y = next(it_a, sentinel), next(it_b, sentinel)
    while x is not sentinel and y is not sentinel:
        if x <= y:
            yield x
            x = next(it_a, sentinel)
        else:
            yield y
            y = next(it_b, sentinel)
    while x is not sentinel:
        yield x
        x = next(it_a, sentinel)
    while y is not sentinel:
        yield y
        y = next(it_b, sentinel)


print(list(merge_sorted([1, 3, 5], [2, 3, 6])))
# [1, 2, 3, 3, 5, 6]

print(list(merge_sorted(iter([]), iter([1, 2]))))
# [1, 2]`,
  },
  {
    type: 'quiz',
    id: 'b30',
    difficulty: 'hard',
    question:
      'Внутри тела генератора вызывается `next(inner)` без обработки ошибок, и вложенный итератор `inner` исчерпан. Что произойдёт в современном Python (3.7+)?',
    options: [
      'Генератор корректно завершится: `StopIteration` — штатный сигнал конца для любого генератора',
      'Поднимется `RuntimeError`: после PEP 479 `StopIteration`, всплывающее внутри генератора, не завершает его тихо, а превращается в ошибку',
      '`yield` вернёт `None`, и генератор продолжит работу',
      'Ничего: `next()` без второго аргумента возвращает пустой кортеж на исчерпанном итераторе',
    ],
    correctIndex: 1,
    explanation:
      'До PEP 479 «протёкшее» `StopIteration` молча обрывало внешний генератор, маскируя баги; теперь оно превращается в `RuntimeError`. Правильные варианты — `next(inner, default)` со значением по умолчанию или явные `try/except StopIteration` + `return`.',
  },
]
