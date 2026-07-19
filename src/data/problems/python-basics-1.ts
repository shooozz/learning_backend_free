import type { Problem } from '@/types/course'

// Сборник задач: Основы Python, часть 1
export const problems: Problem[] = [
  {
    type: 'quiz',
    id: 'a1',
    difficulty: 'easy',
    question: 'Что выведет `print(10 / 5)`?',
    options: ['`2`', '`2.0`', '`2.5`', 'Ошибка `TypeError`'],
    correctIndex: 1,
    explanation:
      'Оператор `/` в Python 3 всегда возвращает `float`, даже если деление нацело. Целочисленный результат `2` дал бы оператор `//`.',
  },
  {
    type: 'code',
    id: 'a2',
    difficulty: 'easy',
    title: 'Флаг из переменной окружения',
    description:
      'Настройки сервиса приходят из переменных окружения строками: `1`, `true`, `YES`, `off` и так далее. Напишите функцию `is_enabled(value)`, которая возвращает `True` для значений `1`, `true`, `yes` (без учёта регистра и пробелов по краям) и `False` для всего остального.',
    language: 'python',
    starterCode: `def is_enabled(value):
    # TODO: верните True для '1', 'true', 'yes'
    # (регистр и пробелы по краям не важны)
    pass


print(is_enabled(' True '))  # True
print(is_enabled('off'))     # False`,
    hints: [
      'Сначала приведите строку к единому виду: `value.strip()` уберёт пробелы по краям, `.lower()` — регистр.',
      'Проверить принадлежность к трём допустимым значениям удобно оператором `in` по множеству.',
      'Всё вместе одной строкой: `return value.strip().lower() in {\'1\', \'true\', \'yes\'}`.',
    ],
    solution: `def is_enabled(value):
    return value.strip().lower() in {'1', 'true', 'yes'}


print(is_enabled(' True '))  # True
print(is_enabled('off'))     # False`,
  },
  {
    type: 'quiz',
    id: 'a3',
    difficulty: 'easy',
    question: 'Что вернёт выражение `bool(\'False\')`?',
    options: [
      '`False` — Python распознаёт текст `\'False\'` как ложь',
      'Ошибка `ValueError`: строку нельзя привести к bool',
      '`True` — любая непустая строка истинна',
      '`None`',
    ],
    correctIndex: 2,
    explanation:
      '`bool()` не разбирает содержимое строки: истинность определяется только тем, пуста она или нет, поэтому даже строка `\'False\'` — истина. Распознавание текста вроде `\'false\'`/`\'no\'` приходится писать самостоятельно.',
  },
  {
    type: 'quiz',
    id: 'a4',
    difficulty: 'easy',
    question:
      'Есть список `a = [1, 2]`. После вызова `a.append([3, 4])` чему будет равен `len(a)`?',
    options: [
      '`3` — вложенный список добавится одним элементом',
      '`4` — элементы 3 и 4 добавятся по отдельности',
      '`2` — append вернёт новый список, а `a` не изменится',
      'Произойдёт ошибка `TypeError`',
    ],
    correctIndex: 0,
    explanation:
      '`append` кладёт аргумент в список целиком, одним элементом: получится `[1, 2, [3, 4]]`. Чтобы добавить элементы по одному и получить длину 4, нужен `extend`.',
  },
  {
    type: 'code',
    id: 'a5',
    difficulty: 'easy',
    title: 'Сумма корзины',
    description:
      'Корзина интернет-магазина — список словарей вида `{\'price\': 250, \'qty\': 2}`. Напишите функцию `cart_total(items)`, которая возвращает общую стоимость: сумму `price * qty` по всем позициям. Для пустой корзины результат — `0`.',
    language: 'python',
    starterCode: `def cart_total(items):
    # TODO: просуммируйте price * qty по всем позициям
    pass


cart = [
    {'price': 250, 'qty': 2},
    {'price': 90, 'qty': 3},
]
print(cart_total(cart))  # 770`,
    hints: [
      'Обойдите список циклом `for item in items` и накапливайте сумму в переменной.',
      'Стоимость одной позиции — `item[\'price\'] * item[\'qty\']`.',
      'Короткий вариант: `sum(item[\'price\'] * item[\'qty\'] for item in items)` — сумма пустого генератора как раз равна 0.',
    ],
    solution: `def cart_total(items):
    return sum(item['price'] * item['qty'] for item in items)


cart = [
    {'price': 250, 'qty': 2},
    {'price': 90, 'qty': 3},
]
print(cart_total(cart))  # 770`,
  },
  {
    type: 'quiz',
    id: 'a6',
    difficulty: 'easy',
    question:
      'В словаре `settings` нет ключа `\'debug\'`. Что вернёт вызов `settings.get(\'debug\', False)`?',
    options: ['Ошибка `KeyError`', '`None`', '`True`', '`False`'],
    correctIndex: 3,
    explanation:
      'Метод `get` при отсутствии ключа возвращает второй аргумент (или `None`, если он не задан) и никогда не бросает исключение. `KeyError` возникает только при обращении через квадратные скобки: `settings[\'debug\']`.',
  },
  {
    type: 'quiz',
    id: 'a7',
    difficulty: 'easy',
    question: 'Что выведет `print(list(range(2, 10, 3)))`?',
    options: ['`[3, 6, 9]`', '`[2, 5, 8, 11]`', '`[2, 5, 8]`', '`[2, 4, 6, 8, 10]`'],
    correctIndex: 2,
    explanation:
      'Отсчёт идёт от 2 с шагом 3: получаем 2, 5, 8. Следующее значение 11 выходит за правую границу 10, а сама граница в диапазон не включается.',
  },
  {
    type: 'code',
    id: 'a8',
    difficulty: 'easy',
    title: 'Слаг для URL',
    description:
      'Для адреса статьи нужен слаг. Напишите функцию `make_slug(title)`: уберите пробелы по краям, приведите текст к нижнему регистру и замените пробелы между словами на дефисы. Например, `\' Основы Python \'` должно превратиться в `\'основы-python\'`.',
    language: 'python',
    starterCode: `def make_slug(title):
    # TODO: пробелы по краям убрать, регистр — нижний,
    # пробелы между словами заменить на дефисы
    pass


print(make_slug(' Основы Python '))  # основы-python`,
    hints: [
      'Методы строк возвращают новую строку, поэтому их можно вызывать цепочкой одну за другой.',
      'Понадобятся `strip()`, `lower()` и `replace(\' \', \'-\')`.',
      'Итог: `return title.strip().lower().replace(\' \', \'-\')` — именно `strip` первым, иначе дефисы появятся по краям.',
    ],
    solution: `def make_slug(title):
    return title.strip().lower().replace(' ', '-')


print(make_slug(' Основы Python '))  # основы-python`,
  },
  {
    type: 'quiz',
    id: 'a9',
    difficulty: 'easy',
    question:
      'Разработчик хочет исправить первую букву имени: `name = \'иван\'`, затем `name[0] = \'И\'`. Что произойдёт?',
    options: [
      'Строка станет `\'Иван\'`',
      'Ошибка `TypeError` — строки в Python неизменяемы',
      'Ошибка `IndexError`',
      'Python создаст новую строку, а старая останется без изменений',
    ],
    correctIndex: 1,
    explanation:
      'Строки неизменяемы, присваивание по индексу невозможно — интерпретатор бросит `TypeError`. Чтобы получить `\'Иван\'`, создают новую строку: `name.capitalize()` или `\'И\' + name[1:]`.',
  },
  {
    type: 'quiz',
    id: 'a10',
    difficulty: 'easy',
    question:
      'Функция пишет данные в лог, но в её теле нет оператора `return`. Что получит вызвавший её код?',
    options: [
      'Пустую строку `\'\'`',
      'Ноль',
      'Ошибку `SyntaxError` — функция обязана что-то возвращать',
      '`None` — его Python возвращает неявно',
    ],
    correctIndex: 3,
    explanation:
      'Функция без `return` (или с `return` без значения) неявно возвращает `None` — это валидный и частый случай для функций с побочными эффектами. Никакой синтаксической ошибки здесь нет.',
  },
  {
    type: 'code',
    id: 'a11',
    difficulty: 'easy',
    title: 'Очистка пользовательских тегов',
    description:
      'Пользователи вводят теги как попало: с лишними пробелами, в разном регистре, попадаются и пустые строки. Напишите функцию `clean_tags(tags)`, которая возвращает новый список: каждый тег без пробелов по краям и в нижнем регистре, а пустые теги (в том числе состоящие из одних пробелов) отброшены.',
    language: 'python',
    starterCode: `def clean_tags(tags):
    # TODO: уберите пробелы и приведите к нижнему регистру,
    # пустые теги отбросьте
    pass


print(clean_tags(['  Python', 'BACKEND ', '', '   ']))
# ['python', 'backend']`,
    hints: [
      'Подойдёт списковое включение с условием: `[... for tag in tags if ...]`.',
      'Пустая строка ложна, поэтому условие фильтрации — просто `if tag.strip()`.',
      'Итог: `[tag.strip().lower() for tag in tags if tag.strip()]`.',
    ],
    solution: `def clean_tags(tags):
    return [tag.strip().lower() for tag in tags if tag.strip()]


print(clean_tags(['  Python', 'BACKEND ', '', '   ']))
# ['python', 'backend']`,
  },
  {
    type: 'quiz',
    id: 'a12',
    difficulty: 'easy',
    question:
      'Вам нужно написать функцию-обёртку, которая принимает любое количество именованных аргументов и передаёт их дальше. Какая сигнатура для этого подходит?',
    options: [
      '`def wrapper(**kwargs)`',
      '`def wrapper(*args)`',
      '`def wrapper(kwargs)`',
      '`def wrapper(dict)`',
    ],
    correctIndex: 0,
    explanation:
      '`**kwargs` собирает все именованные аргументы в словарь, а дальше их можно передать как `func(**kwargs)`. `*args` собирает только позиционные аргументы — именованные через него не пройдут.',
  },
  {
    type: 'quiz',
    id: 'a13',
    difficulty: 'easy',
    question: 'Когда выполняется метод `__init__` класса?',
    options: [
      'Один раз — при объявлении класса',
      'При импорте модуля, в котором объявлен класс',
      'Автоматически при создании каждого нового экземпляра',
      'Только если вызвать его явно: `obj.__init__()`',
    ],
    correctIndex: 2,
    explanation:
      '`__init__` — инициализатор: Python вызывает его сам при каждом создании объекта, например `User(...)`. При объявлении класса выполняется только тело класса, но не `__init__`.',
  },
  {
    type: 'code',
    id: 'a14',
    difficulty: 'easy',
    title: 'Счётчик запросов',
    description:
      'Напишите класс `RequestCounter` для подсчёта запросов к сервису. При создании счётчик равен нулю и хранится в атрибуте `count`. Метод `hit()` увеличивает счётчик на 1 и возвращает новое значение, метод `reset()` сбрасывает его в 0.',
    language: 'python',
    starterCode: `class RequestCounter:
    # TODO: __init__ с атрибутом count,
    # методы hit() и reset()
    pass


counter = RequestCounter()
counter.hit()
print(counter.hit())  # 2
counter.reset()
print(counter.count)  # 0`,
    hints: [
      'В `__init__` создайте атрибут экземпляра: `self.count = 0`.',
      'Не забудьте параметр `self` у всех методов — без него вызов через точку упадёт с `TypeError`.',
      '`hit` делает `self.count += 1` и возвращает `self.count`; `reset` присваивает `self.count = 0`.',
    ],
    solution: `class RequestCounter:
    def __init__(self):
        self.count = 0

    def hit(self):
        self.count += 1
        return self.count

    def reset(self):
        self.count = 0


counter = RequestCounter()
counter.hit()
print(counter.hit())  # 2
counter.reset()
print(counter.count)  # 0`,
  },
  {
    type: 'quiz',
    id: 'a15',
    difficulty: 'easy',
    question:
      'В блоке `try` выполняется `number = int(\'12a\')`, в блоке `except ValueError` — `number = -1`. Что выведет `print(number)` после этой конструкции?',
    options: ['`12`', '`-1`', 'Программа упадёт с `ValueError`', '`12a`'],
    correctIndex: 1,
    explanation:
      'Строка `\'12a\'` — не число, поэтому `int()` бросает `ValueError`, управление переходит в `except`, и `number` получает значение -1. Программа не упадёт: исключение перехвачено.',
  },
  {
    type: 'code',
    id: 'a16',
    difficulty: 'easy',
    title: 'Подсчёт ошибок в большом логе',
    description:
      'Лог-файл может весить гигабайты, поэтому загружать его в память целиком нельзя. Напишите функцию `count_errors(path)`, которая построчно читает текстовый файл и возвращает количество строк, содержащих подстроку `ERROR`.',
    language: 'python',
    starterCode: `def count_errors(path):
    # TODO: откройте файл через with и читайте построчно,
    # не загружая его в память целиком
    pass`,
    hints: [
      'Открывайте файл через `with open(path, encoding=\'utf-8\') as f` — он закроется автоматически.',
      'Файловый объект — итератор по строкам: `for line in f` держит в памяти только одну строку.',
      'Внутри цикла проверяйте `if \'ERROR\' in line` и увеличивайте счётчик.',
    ],
    solution: `def count_errors(path):
    count = 0
    with open(path, encoding='utf-8') as f:
        for line in f:
            if 'ERROR' in line:
                count += 1
    return count`,
  },
  {
    type: 'quiz',
    id: 'a17',
    difficulty: 'easy',
    question: 'Чем `json.load` отличается от `json.loads`?',
    options: [
      'Ничем — это синонимы, оставленные для совместимости',
      '`json.load` работает быстрее за счёт кеширования',
      '`json.loads` дополнительно валидирует данные по схеме',
      '`json.load` читает из файлового объекта, а `json.loads` — из строки',
    ],
    correctIndex: 3,
    explanation:
      'Суффикс `s` означает string: `loads` разбирает строку, `load` — открытый файл (любой объект с методом `read`). Никакой валидации по схеме стандартный модуль `json` не выполняет.',
  },
  {
    type: 'code',
    id: 'a18',
    difficulty: 'easy',
    title: 'Надёжный разбор JSON',
    description:
      'API присылает профиль пользователя строкой JSON, но иногда данные приходят битыми. Напишите функцию `load_user(text)`: верните словарь, разобранный из JSON, а если строка не является корректным JSON — пустой словарь `{}`, не роняя программу.',
    language: 'python',
    starterCode: `import json


def load_user(text):
    # TODO: верните разобранный словарь,
    # при битом JSON — пустой словарь
    pass


print(load_user('{"name": "Аня"}'))  # {'name': 'Аня'}
print(load_user('{oops'))            # {}`,
    hints: [
      'Разбор строки — `json.loads(text)`; не путайте с `json.load`, который читает из файла.',
      'Ошибка разбора — исключение `json.JSONDecodeError`; перехватывайте именно его, а не голый `except`.',
      'Схема решения: в `try` вернуть `json.loads(text)`, в `except json.JSONDecodeError` — `{}`.',
    ],
    solution: `import json


def load_user(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


print(load_user('{"name": "Аня"}'))  # {'name': 'Аня'}
print(load_user('{oops'))            # {}`,
  },
  {
    type: 'quiz',
    id: 'a19',
    difficulty: 'medium',
    question:
      'Выполняется код: `funcs = [lambda: i for i in range(3)]`, затем `print(funcs[0]())`. Что будет выведено?',
    options: [
      '`0`',
      'Ошибка `NameError`: переменная `i` недоступна вне включения',
      '`2`',
      '`[0, 1, 2]`',
    ],
    correctIndex: 2,
    explanation:
      'Замыкание хранит ссылку на переменную `i`, а не её значение в момент создания лямбды: к моменту вызова цикл уже завершён и `i` равна 2. Значение фиксируют аргументом по умолчанию: `lambda i=i: i`.',
  },
  {
    type: 'code',
    id: 'a20',
    difficulty: 'medium',
    title: 'Декоратор логирования вызовов',
    description:
      'Для отладки нужно видеть, какие функции вызываются и с чем. Напишите декоратор `log_calls`: перед вызовом он печатает имя функции и аргументы в формате `-> имя(args, kwargs)`, затем вызывает функцию и возвращает её результат. Сохраните имя и докстринг оригинала через `functools.wraps`.',
    language: 'python',
    starterCode: `import functools


def log_calls(func):
    # TODO: верните обёртку, которая печатает имя и аргументы,
    # затем вызывает func и возвращает результат
    pass


@log_calls
def add(a, b):
    return a + b


print(add(2, b=3))
# -> add((2,), {'b': 3})
# 5`,
    hints: [
      'Декоратор принимает `func` и возвращает новую функцию `wrapper(*args, **kwargs)`.',
      'Имя функции доступно как `func.__name__`; напечатайте его до вызова и не забудьте `return func(*args, **kwargs)`.',
      'Оберните `wrapper` в `@functools.wraps(func)`, чтобы у задекорированной функции остались родные `__name__` и докстринг.',
    ],
    solution: `import functools


def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f'-> {func.__name__}({args}, {kwargs})')
        return func(*args, **kwargs)
    return wrapper


@log_calls
def add(a, b):
    return a + b


print(add(2, b=3))
# -> add((2,), {'b': 3})
# 5`,
  },
  {
    type: 'quiz',
    id: 'a21',
    difficulty: 'medium',
    question:
      'Выполняется код: `a = [[1], [2]]`, затем `b = a.copy()` и `b[0].append(9)`. Что теперь лежит в `a[0]`?',
    options: [
      '`[1]` — `copy()` создаёт независимую копию',
      '`[1, 9]` — копия поверхностная, вложенные списки остались общими',
      '`[9]`',
      'Ошибка `AttributeError`: у списка нет метода `copy`',
    ],
    correctIndex: 1,
    explanation:
      '`copy()` копирует только внешний список: элементы обеих копий — ссылки на одни и те же вложенные списки, поэтому изменение видно через `a`. Для полностью независимой копии нужен `copy.deepcopy(a)`.',
  },
  {
    type: 'code',
    id: 'a22',
    difficulty: 'medium',
    title: 'Пользователь из строки базы данных',
    description:
      'Драйвер базы данных возвращает строку таблицы кортежем: `(1, \'ann@mail.ru\', 1)` — id, email и флаг активности числом 0/1. Напишите класс `User` с атрибутами `user_id`, `email`, `is_active` и классметодом `from_row(row)`, который создаёт объект из такого кортежа, превращая флаг в настоящий `bool`. Добавьте `__repr__` вида `User(id=1, email=\'ann@mail.ru\')`.',
    language: 'python',
    starterCode: `class User:
    def __init__(self, user_id, email, is_active):
        self.user_id = user_id
        self.email = email
        self.is_active = is_active

    # TODO: классметод from_row(row) и метод __repr__


user = User.from_row((1, 'ann@mail.ru', 1))
print(user)            # User(id=1, email='ann@mail.ru')
print(user.is_active)  # True`,
    hints: [
      'Альтернативный конструктор помечают `@classmethod`: первым аргументом придёт `cls`, и объект создаётся через `cls(...)`, а не через имя класса — так конструктор корректно работает и в наследниках.',
      'Распакуйте кортеж: `user_id, email, active_flag = row`, а флаг преобразуйте через `bool(active_flag)`.',
      'В `__repr__` верните f-строку: `f\'User(id={self.user_id}, email={self.email!r})\'`.',
    ],
    solution: `class User:
    def __init__(self, user_id, email, is_active):
        self.user_id = user_id
        self.email = email
        self.is_active = is_active

    @classmethod
    def from_row(cls, row):
        user_id, email, active_flag = row
        return cls(user_id, email, bool(active_flag))

    def __repr__(self):
        return f'User(id={self.user_id}, email={self.email!r})'


user = User.from_row((1, 'ann@mail.ru', 1))
print(user)            # User(id=1, email='ann@mail.ru')
print(user.is_active)  # True`,
  },
  {
    type: 'quiz',
    id: 'a23',
    difficulty: 'medium',
    question:
      'В функции внутри `try` стоит `return \'try\'`, а внутри `finally` — `return \'finally\'`. Что вернёт вызов этой функции?',
    options: [
      '`\'try\'` — return в try выполняется раньше',
      'Ошибка `SyntaxError`: два return в одной функции недопустимы',
      'Кортеж `(\'try\', \'finally\')`',
      '`\'finally\'` — return в finally перекрывает результат try',
    ],
    correctIndex: 3,
    explanation:
      'Блок `finally` выполняется в любом случае, и его `return` затирает значение из `try` (а заодно проглотил бы и любое исключение). Именно поэтому `return` внутри `finally` считается антипаттерном.',
  },
  {
    type: 'quiz',
    id: 'a24',
    difficulty: 'medium',
    question:
      'Проверка `if user_status is \'active\':` иногда не срабатывает, хотя в `user_status` лежит строка `\'active\'`. Найдите ошибку.',
    options: [
      '`is` сравнивает идентичность объектов в памяти, а не значения — нужен оператор `==`',
      'Условие надо записать наоборот: `\'active\' is user_status`',
      'Строки в Python можно сравнивать только методом `.equals()`',
      'Не хватает скобок вокруг условия',
    ],
    correctIndex: 0,
    explanation:
      '`is` проверяет, что слева и справа один и тот же объект. Из-за интернирования коротких строк такой код может «случайно работать», но гарантий нет — значения сравнивают через `==`, а `is` оставляют для `None`.',
  },
  {
    type: 'code',
    id: 'a25',
    difficulty: 'medium',
    title: 'Контекстный менеджер-секундомер',
    description:
      'Нужно замерять время медленных участков кода. Напишите контекстный менеджер `timer(label)` на основе декоратора `@contextmanager` из модуля `contextlib`: он засекает время при входе в блок `with`, а на выходе печатает строку вида `label: 0.503 c`. Время должно печататься даже если внутри блока произошло исключение.',
    language: 'python',
    starterCode: `import time
from contextlib import contextmanager


@contextmanager
def timer(label):
    # TODO: засеките время, отдайте управление блоку,
    # после выхода напечатайте '<label>: X.XXX c'
    pass


with timer('запрос к базе'):
    time.sleep(0.5)
# запрос к базе: 0.503 c`,
    hints: [
      'В функции с `@contextmanager` код до `yield` выполняется при входе в блок `with`, код после — при выходе.',
      'Засеките `start = time.perf_counter()` до `yield`, а после него посчитайте разницу.',
      'Чтобы печать сработала и при исключении, оберните `yield` в `try/finally` и печатайте в `finally`.',
    ],
    solution: `import time
from contextlib import contextmanager


@contextmanager
def timer(label):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f'{label}: {elapsed:.3f} c')


with timer('запрос к базе'):
    time.sleep(0.5)
# запрос к базе: 0.503 c`,
  },
  {
    type: 'quiz',
    id: 'a26',
    difficulty: 'medium',
    question:
      'Генераторная функция `gen` начинается с `print(\'старт\')`, затем идёт `yield`. Что выведет программа после единственной строки `g = gen()`?',
    options: [
      '`старт`',
      'Ничего — тело генератора начнёт выполняться только при первом `next(g)`',
      '`старт` и значение первого `yield`',
      'Ошибка: результат генераторной функции нельзя сохранять в переменную',
    ],
    correctIndex: 1,
    explanation:
      'Вызов генераторной функции лишь создаёт объект-генератор, не выполняя ни строчки тела. Код до первого `yield` выполнится при первом `next(g)` или на первой итерации цикла `for`.',
  },
  {
    type: 'code',
    id: 'a27',
    difficulty: 'medium',
    title: 'Ленивая дедупликация потока строк',
    description:
      'В поток логов попадают дубли. Напишите генератор `unique_lines(lines)`, который лениво выдаёт только первые вхождения строк, пропуская повторы. Генератор должен работать с любым итерируемым источником — файлом, списком, другим генератором — и не накапливать результат в список.',
    language: 'python',
    starterCode: `def unique_lines(lines):
    # TODO: выдавайте строку через yield только при первом
    # её появлении; уже встреченные храните в множестве
    pass


log = ['GET /', 'GET /health', 'GET /', 'POST /login']
print(list(unique_lines(log)))
# ['GET /', 'GET /health', 'POST /login']`,
    hints: [
      'Заведите множество `seen` для уже встреченных строк — проверка `in` по множеству работает за O(1).',
      'Вместо накопления в список используйте `yield line` — тогда обработка останется ленивой и подойдёт для гигабайтных файлов.',
      'Выдавайте строку только если её нет в `seen`, и сразу добавляйте её туда через `seen.add(line)`.',
    ],
    solution: `def unique_lines(lines):
    seen = set()
    for line in lines:
        if line not in seen:
            seen.add(line)
            yield line


log = ['GET /', 'GET /health', 'GET /', 'POST /login']
print(list(unique_lines(log)))
# ['GET /', 'GET /health', 'POST /login']`,
  },
  {
    type: 'quiz',
    id: 'a28',
    difficulty: 'medium',
    question:
      'Сервису нужно около 100 000 раз в секунду проверять, входит ли `user_id` в набор из 50 000 разрешённых id. Какой вариант лучший и почему?',
    options: [
      'Список: `user_id in allowed_list` — списки самые быстрые для чтения',
      'Отсортированный список и поиск циклом `for` вручную',
      'Множество: `user_id in allowed_set` — поиск по хеш-таблице за O(1) в среднем',
      'Одна большая строка с id через запятую и поиск подстроки в ней',
    ],
    correctIndex: 2,
    explanation:
      'Оператор `in` для списка перебирает элементы — O(n) на каждую проверку, при таких объёмах это миллиарды сравнений в секунду. `set` ищет по хешу за O(1) в среднем; вариант со строкой вдобавок даёт ложные срабатывания на частичных совпадениях.',
  },
  {
    type: 'code',
    id: 'a29',
    difficulty: 'medium',
    title: 'Поиск логов по всем подпапкам',
    description:
      'В каталоге проекта лог-файлы разбросаны по вложенным подпапкам. Напишите функцию `find_logs(root)`, которая средствами `pathlib` рекурсивно находит все файлы с расширением `.log` и возвращает отсортированный список их путей строками.',
    language: 'python',
    starterCode: `from pathlib import Path


def find_logs(root):
    # TODO: рекурсивно найдите все *.log
    # и верните отсортированный список строк
    pass


print(find_logs('var'))
# ['var/app/app.log', 'var/nginx/access.log', ...]`,
    hints: [
      'Создайте объект пути: `Path(root)`.',
      'Метод `rglob(\'*.log\')` ищет по шаблону рекурсивно во всех подпапках — в отличие от `glob`, которому нужен префикс `**/`.',
      'Преобразуйте каждый путь через `str(...)` и отсортируйте: `sorted(str(p) for p in ...)`.',
    ],
    solution: `from pathlib import Path


def find_logs(root):
    return sorted(str(path) for path in Path(root).rglob('*.log'))


print(find_logs('var'))
# ['var/app/app.log', 'var/nginx/access.log', ...]`,
  },
  {
    type: 'quiz',
    id: 'a30',
    difficulty: 'medium',
    question:
      'Код чистит кеш: в цикле `for key in cache:` для устаревших ключей выполняется `del cache[key]`. Чем закончится выполнение?',
    options: [
      'Ошибкой `RuntimeError`: размер словаря нельзя менять во время итерации по нему',
      'Всё отработает корректно — Python учитывает удаления на лету',
      'Удалится только первый подходящий ключ, остальные останутся',
      'Ошибкой `KeyError` на последнем ключе',
    ],
    correctIndex: 0,
    explanation:
      'Удаление ключей меняет размер словаря прямо во время итерации, и Python прерывает цикл ошибкой `RuntimeError: dictionary changed size during iteration`. Правильный подход — итерироваться по снимку ключей `for key in list(cache):` или собрать ключи на удаление в отдельный список.',
  },
]
