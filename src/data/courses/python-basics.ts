import type { Course } from '@/types/course'

export const pythonBasicsCourse: Course = {
  slug: 'python-basics',
  order: 1,
  title: 'Основы Python',
  description: 'Фундамент программирования на Python — от синтаксиса и коллекций до итераторов и генераторов.',
  level: 'Начальный',
  image: '/img-1.jpg',
  tags: ['Python', 'ООП', 'Стандартная библиотека'],
  lessons: [
    {
      slug: 'syntax-and-types',
      title: 'Синтаксис и типы данных',
      description: 'Переменные, базовые типы и коллекции Python: что выбирать в реальных задачах и как не попасть в ловушку изменяемости.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Почти любой backend-код — это преобразование данных: пришёл JSON от клиента, вы его проверили, положили в базу, собрали ответ. Каждый шаг — работа со строками, числами, списками и словарями. Разработчик, который твёрдо понимает, чем `list` отличается от `tuple` и почему словарь ищет ключ за микросекунды, пишет код быстрее и допускает меньше багов. В этом уроке разберём типы данных Python не по учебнику, а с прицелом на реальные серверные задачи.',
        },
        { type: 'heading', text: 'Переменные и динамическая типизация' },
        {
          type: 'text',
          text: 'В Python переменная — это имя, привязанное к объекту, а не ячейка памяти с типом. Тип принадлежит объекту, поэтому одно имя может указывать сначала на число, потом на строку. Это удобно для скорости разработки, но требует дисциплины: в командном коде типы фиксируют аннотациями и проверяют инструментами вроде `mypy`. Для форматирования строк современный стандарт — f-строки: они быстрее `str.format()` и читаются как обычный текст.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'types_demo.py',
          code: `age = 25                # int
price = 1999.90         # float
name = "Алина"          # str
is_admin = False        # bool

print(type(age))        # <class 'int'>

# f-строки: подстановка выражений и форматирование
user_id = 42
balance = 1234.5678
print(f"Пользователь #{user_id}, баланс: {balance:.2f}")
# Пользователь #42, баланс: 1234.57

# Отладочный синтаксис (Python 3.8+): имя и значение сразу
print(f"{age=}")        # age=25

# Тип у объекта, а не у имени — имя можно перепривязать
age = "двадцать пять"   # работает, но так делать не стоит`,
        },
        { type: 'heading', text: 'Коллекции: list, tuple, dict, set' },
        {
          type: 'text',
          text: 'Четыре встроенные коллекции закрывают 95% задач. Правило выбора простое: **list** — когда важен порядок и данные меняются; **tuple** — когда набор фиксирован (координаты, запись из БД, ключ составного словаря); **dict** — когда нужен доступ по ключу (любой JSON превращается именно в dict); **set** — когда нужны уникальность и быстрые проверки на вхождение.',
        },
        {
          type: 'table',
          headers: ['Коллекция', 'Изменяемая', 'Упорядоченная', 'Когда выбирать'],
          rows: [
            ['list', 'да', 'да', 'Последовательность однотипных элементов: заказы, строки отчёта'],
            ['tuple', 'нет', 'да', 'Фиксированный набор: координаты, пара (host, port), ключ словаря'],
            ['dict', 'да', 'да (порядок вставки)', 'Доступ по ключу: JSON, настройки, кеш'],
            ['set', 'да', 'нет', 'Уникальные значения и проверки вхождения: id просмотренных, теги'],
          ],
        },
        {
          type: 'code',
          language: 'python',
          filename: 'collections_demo.py',
          code: `# list — упорядоченная изменяемая последовательность
statuses = ["new", "paid", "shipped"]
statuses.append("delivered")

# tuple — неизменяемый набор, отлично подходит для записей
point = (55.75, 37.61)
host_port = ("localhost", 5432)

# dict — основа работы с JSON и настройками
user = {"id": 42, "email": "a@example.com", "roles": ["admin"]}
print(user["email"])                   # KeyError, если ключа нет
print(user.get("phone", "не указан"))  # безопасный доступ с default

# set — уникальность и быстрый поиск
seen_ids = {1, 2, 3}
seen_ids.add(2)          # дубликат просто игнорируется
print(2 in seen_ids)     # True
print(len(seen_ids))     # 3`,
        },
        {
          type: 'note',
          variant: 'tip',
          text: 'Проверка `x in my_set` и `key in my_dict` выполняется за O(1) — почти мгновенно даже на миллионе элементов. Та же проверка по списку — O(n), полный перебор. Если в коде есть `if item in big_list` внутри цикла — это кандидат на замену списка на set.',
        },
        { type: 'heading', text: 'Срезы и изменяемость' },
        {
          type: 'code',
          language: 'python',
          filename: 'slices_and_mutability.py',
          code: `nums = [0, 1, 2, 3, 4, 5]
print(nums[1:4])     # [1, 2, 3] — start включается, stop нет
print(nums[-2:])     # [4, 5] — последние два
print(nums[::2])     # [0, 2, 4] — каждый второй
print(nums[::-1])    # [5, 4, 3, 2, 1, 0] — разворот
copy = nums[:]       # поверхностная копия списка

# Классическая ловушка: изменяемое значение по умолчанию
def add_item(item, items=[]):        # ТАК ДЕЛАТЬ НЕЛЬЗЯ
    items.append(item)
    return items

print(add_item("a"))  # ['a']
print(add_item("b"))  # ['a', 'b'] — список общий между вызовами!

# Правильный вариант: None как маркер
def add_item_ok(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

print(add_item_ok("a"))  # ['a']
print(add_item_ok("b"))  # ['b'] — каждый вызов со своим списком`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Значение по умолчанию вычисляется **один раз** — в момент выполнения `def`, а не при каждом вызове. Поэтому изменяемые объекты (`[]`, `{}`, `set()`) в default-аргументах накапливают состояние между вызовами. Это один из самых частых вопросов на собеседованиях и реальный источник багов в продакшене.',
        },
        { type: 'heading', text: 'Условия, циклы и comprehensions' },
        {
          type: 'code',
          language: 'python',
          filename: 'flow_demo.py',
          code: `orders = [
    {"id": 1, "total": 500, "paid": True},
    {"id": 2, "total": 1200, "paid": False},
    {"id": 3, "total": 300, "paid": True},
]

# Условия: чисто и без скобок
for order in orders:
    if order["total"] > 1000:
        tier = "large"
    elif order["total"] > 400:
        tier = "medium"
    else:
        tier = "small"

# enumerate вместо ручного счётчика
for i, order in enumerate(orders, start=1):
    print(f"{i}. заказ #{order['id']}")

# Comprehensions — идиоматичный Python
paid_totals = [o["total"] for o in orders if o["paid"]]   # list: [500, 300]
by_id = {o["id"]: o for o in orders}                      # dict: индекс по id
payment_flags = {o["paid"] for o in orders}               # set: {True, False}

revenue = sum(paid_totals)
print(f"Оплачено на сумму: {revenue}")  # 800`,
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Тип принадлежит объекту, а не переменной; в командном коде типы фиксируют аннотациями.',
            'f-строки — стандарт форматирования: `f"{value:.2f}"`, для отладки — `f"{value=}"`.',
            'Выбор коллекции: list — порядок и изменения, tuple — фиксированная запись, dict — доступ по ключу, set — уникальность и `in` за O(1).',
            'Срез `a[start:stop]` включает start и исключает stop; `a[:]` делает поверхностную копию.',
            'Никогда не используйте изменяемые значения по умолчанию — применяйте паттерн `items=None` плюс проверку `is None`.',
            'Comprehensions заменяют шаблонные циклы построения list/dict/set и читаются как одна мысль.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Функция объявлена как `def add(item, items=[])` и внутри выполняет `items.append(item)` и `return items`. Что вернёт второй вызов `add("b")` после первого вызова `add("a")`?',
          options: ['["b"]', '["a", "b"]', '["a"]', 'Будет выброшен TypeError'],
          correctIndex: 1,
          explanation: 'Значение по умолчанию создаётся один раз при выполнении инструкции def, и все вызовы без второго аргумента работают с одним и тем же списком. Первый вызов добавил "a", второй добавил "b" в тот же объект, поэтому вернётся ["a", "b"]. Именно поэтому для изменяемых default-значений используют None.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Какую из этих коллекций можно использовать как ключ словаря?',
          options: ['list', 'dict', 'tuple из неизменяемых элементов', 'set'],
          correctIndex: 2,
          explanation: 'Ключ словаря обязан быть hashable, то есть неизменяемым: его hash не должен меняться со временем. list, dict и set изменяемы и потому unhashable. tuple неизменяем, и если все его элементы тоже hashable, он отлично подходит как составной ключ, например `(user_id, date)`.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Что вернёт выражение `nums[1:4]` для списка `nums = [0, 1, 2, 3, 4, 5]`?',
          options: ['[1, 2, 3, 4]', '[0, 1, 2, 3]', '[1, 2, 3]', '[2, 3, 4]'],
          correctIndex: 2,
          explanation: 'Срез работает по правилу: start включается, stop исключается. Берутся элементы с индексами 1, 2 и 3 — это значения 1, 2 и 3, а элемент с индексом 4 в результат не попадает. Такое правило удобно тем, что `len(a[i:j])` всегда равно `j - i`.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Частотный словарь слов',
          description: 'Напишите функцию `count_words(text)`, которая приводит строку к нижнему регистру, разбивает её по пробельным символам и возвращает словарь вида `{слово: количество}`. Затем напишите `top_words(counts, n)`, возвращающую список из `n` самых частых слов, отсортированных по убыванию частоты.',
          language: 'python',
          starterCode: `def count_words(text):
    # ваш код
    ...


def top_words(counts, n):
    # ваш код
    ...


text = "код ревью код тесты код деплой тесты"
print(count_words(text))
# {'код': 3, 'ревью': 1, 'тесты': 2, 'деплой': 1}
print(top_words(count_words(text), 2))
# ['код', 'тесты']`,
          solution: `def count_words(text):
    counts = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts


def top_words(counts, n):
    ordered = sorted(counts, key=counts.get, reverse=True)
    return ordered[:n]


text = "код ревью код тесты код деплой тесты"
print(count_words(text))
# {'код': 3, 'ревью': 1, 'тесты': 2, 'деплой': 1}
print(top_words(count_words(text), 2))
# ['код', 'тесты']`,
          hints: [
            'Метод `text.lower().split()` без аргументов разбивает строку по любым пробельным символам и сразу решает проблему регистра.',
            'Для подсчёта удобен `counts.get(word, 0)`: он вернёт 0, если слова ещё нет в словаре, и вам останется прибавить единицу.',
            'Для топа отсортируйте ключи словаря: `sorted(counts, key=counts.get, reverse=True)`, а затем возьмите срез `[:n]`.',
          ],
        },
      ],
    },
    {
      slug: 'functions-and-modules',
      title: 'Функции и модули',
      description: 'Аргументы всех видов, области видимости и замыкания, организация кода в модули и изоляция зависимостей через venv.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Открыв любой боевой проект, вы увидите десятки модулей и сотни функций с сигнатурами вроде `def create_user(email, *, is_active=True, **extra)`. Чтобы уверенно читать и писать такой код, нужно понимать все виды аргументов, знать, где Python ищет переменные, и уметь собирать проект из модулей с изолированными зависимостями. Без этого даже простая задача добавить параметр в функцию превращается в минное поле.',
        },
        { type: 'heading', text: 'def и аргументы: позиционные, именованные, по умолчанию' },
        {
          type: 'code',
          language: 'python',
          filename: 'args_basic.py',
          code: `def send_email(to, subject, body="", retries=3):
    print(f"-> {to}: {subject} (попыток: {retries})")

# Позиционные аргументы — по порядку
send_email("a@example.com", "Добро пожаловать")

# Именованные — порядок не важен, вызов читается как документация
send_email(subject="Отчёт за июль", to="boss@example.com", retries=5)

# Смешивать можно: сначала позиционные, потом именованные
send_email("a@example.com", "Сброс пароля", retries=1)

# А вот так нельзя — позиционный после именованного:
# send_email(to="a@example.com", "Привет")  # SyntaxError`,
        },
        { type: 'heading', text: '*args, **kwargs и keyword-only аргументы' },
        {
          type: 'text',
          text: '`*args` собирает лишние позиционные аргументы в tuple, `**kwargs` — лишние именованные в dict. А одиночная звёздочка `*` в сигнатуре делает все параметры после неё **keyword-only**: их можно передать только по имени. Это спасает от багов вида перепутанного порядка аргументов — сравните `transfer(100, acc1, acc2)` и явное `transfer(100, from_account=acc1, to_account=acc2)`. Стандартная библиотека активно использует этот приём, например в `sorted(iterable, *, key=None, reverse=False)`.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'args_advanced.py',
          code: `def log_event(event, *tags, level="info", **context):
    print(f"[{level}] {event} | теги: {tags} | контекст: {context}")

log_event("user_login", "auth", "web", level="warning", user_id=42, ip="10.0.0.1")
# [warning] user_login | теги: ('auth', 'web') | контекст: {'user_id': 42, 'ip': '10.0.0.1'}

# Keyword-only: всё после * передаётся только по имени
def transfer(amount, *, from_account, to_account):
    print(f"{amount} с {from_account} на {to_account}")

transfer(100, from_account="acc-1", to_account="acc-2")  # ок
# transfer(100, "acc-1", "acc-2")  # TypeError: takes 1 positional argument

# Распаковка при вызове — зеркальная операция
params = {"from_account": "acc-1", "to_account": "acc-2"}
transfer(100, **params)`,
        },
        { type: 'heading', text: 'Области видимости LEGB и замыкания' },
        {
          type: 'table',
          headers: ['Уровень', 'Где Python ищет имя', 'Пример'],
          rows: [
            ['L — Local', 'В текущей функции', 'переменная, созданная в теле функции'],
            ['E — Enclosing', 'В объемлющих функциях', 'переменная внешней функции внутри вложенной'],
            ['G — Global', 'На уровне модуля', 'константы, импортированные имена'],
            ['B — Built-in', 'Встроенные имена Python', '`len`, `print`, `range`'],
          ],
        },
        {
          type: 'code',
          language: 'python',
          filename: 'closures.py',
          code: `# Замыкание: вложенная функция запоминает переменные внешней
def make_rate_limiter(limit):
    calls = 0

    def check():
        nonlocal calls          # без nonlocal присваивание создало бы
        calls += 1              # новую локальную переменную
        return calls <= limit

    return check

api_limiter = make_rate_limiter(3)
print([api_limiter() for _ in range(5)])
# [True, True, True, False, False]

# lambda — однострочная анонимная функция, чаще всего как key
users = [{"name": "Борис", "age": 31}, {"name": "Алина", "age": 27}]
youngest_first = sorted(users, key=lambda u: u["age"])
print(youngest_first[0]["name"])  # Алина`,
        },
        { type: 'heading', text: 'Модули, пакеты и import' },
        {
          type: 'code',
          language: 'python',
          filename: 'app/services/billing.py',
          code: `# Каждый .py-файл — модуль; каталог с модулями — пакет.
# Типичная структура backend-проекта:
#   app/
#     __init__.py
#     services/
#       __init__.py
#       billing.py    <- этот файл
#     main.py

TAX_RATE = 0.2

def calculate_total(amount: float) -> float:
    return round(amount * (1 + TAX_RATE), 2)

# В app/main.py импортируем явно:
#   from app.services.billing import calculate_total
#   import json
#   from pathlib import Path

if __name__ == "__main__":
    # Этот блок выполнится только при прямом запуске файла,
    # при импорте из другого модуля — нет. Удобно для быстрой проверки.
    print(calculate_total(100))  # 120.0`,
        },
        { type: 'heading', text: 'Виртуальные окружения и зависимости' },
        {
          type: 'code',
          language: 'bash',
          filename: 'terminal',
          code: `# Создаём изолированное окружение в каталоге проекта
python -m venv .venv

# Активируем: Linux / macOS
source .venv/bin/activate
# Активируем: Windows (PowerShell)
.venv\\Scripts\\Activate.ps1

# Ставим зависимости — они попадут только в .venv
pip install httpx pydantic

# Фиксируем точные версии для коллег и CI
pip freeze > requirements.txt

# На другой машине окружение восстанавливается одной командой
pip install -r requirements.txt`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Никогда не ставьте пакеты в системный Python: разные проекты требуют разные версии библиотек, и глобальная установка рано или поздно сломает один из них. Каталог `.venv` добавляйте в `.gitignore` — в репозиторий попадает только `requirements.txt`.',
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Порядок параметров в сигнатуре: позиционные, с default, `*args`, keyword-only, `**kwargs`.',
            'Одиночная `*` делает последующие параметры keyword-only — используйте её для аргументов, которые опасно путать местами.',
            'Имена ищутся по правилу LEGB: Local, Enclosing, Global, Built-in; `nonlocal` разрешает менять переменную объемлющей функции.',
            'Замыкание хранит состояние без классов и глобальных переменных — на этом построены декораторы.',
            'Блок `if __name__ == "__main__"` отделяет код запуска от кода, доступного при импорте.',
            'Один проект — одно виртуальное окружение; зависимости фиксируются в `requirements.txt`.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Какая сигнатура функции синтаксически корректна?',
          options: [
            'def f(a=1, b, *args)',
            'def f(a, b=1, *args, timeout, **kwargs)',
            'def f(**kwargs, *args)',
            'def f(a, *args, **kwargs, b=1)',
          ],
          correctIndex: 1,
          explanation: 'Правильный порядок: позиционные параметры, параметры с default, *args, keyword-only параметры (timeout здесь именно такой), **kwargs. В первом варианте параметр без default идёт после параметра с default, в третьем **kwargs стоит не последним, в четвёртом после **kwargs вообще ничего быть не может.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Что делает объявление `nonlocal counter` внутри вложенной функции?',
          options: [
            'Создаёт новую локальную переменную counter',
            'Разрешает изменять переменную counter из объемлющей функции',
            'Делает counter глобальной переменной модуля',
            'Запрещает любые изменения counter',
          ],
          correctIndex: 1,
          explanation: 'Без nonlocal присваивание внутри функции всегда создаёт локальную переменную, и внешняя counter осталась бы нетронутой. nonlocal говорит интерпретатору: это имя из Enclosing-области, работай с ним. Для переменных уровня модуля аналогичную роль играет global.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Зачем в модуле пишут проверку `if __name__ == "__main__"`?',
          options: [
            'Она ускоряет импорт модуля',
            'Код внутри блока выполняется только при прямом запуске файла, а не при импорте',
            'Она объявляет обязательную точку входа, как функция main в C',
            'Без неё модуль невозможно импортировать',
          ],
          correctIndex: 1,
          explanation: 'При прямом запуске файла интерпретатор присваивает переменной __name__ значение "__main__", а при импорте — имя модуля. Поэтому код внутри блока выполняется только при запуске как скрипта. Это позволяет импортировать функции модуля без побочных эффектов.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Кеширующая обёртка через замыкание',
          description: 'Напишите функцию `memoize(func)`, возвращающую функцию-обёртку. Обёртка принимает произвольные позиционные аргументы через `*args`, хранит результаты в словаре-кеше внутри замыкания и при повторном вызове с теми же аргументами возвращает сохранённое значение, не вызывая `func` второй раз. Проверьте на счётчике вызовов: после двух вызовов `fast_square(4)` счётчик должен остаться равным 1.',
          language: 'python',
          starterCode: `call_count = 0


def slow_square(x):
    global call_count
    call_count += 1
    return x * x


def memoize(func):
    # ваш код
    ...


fast_square = memoize(slow_square)
print(fast_square(4))   # 16
print(fast_square(4))   # 16 — должно взяться из кеша
print(call_count)       # 1`,
          solution: `call_count = 0


def slow_square(x):
    global call_count
    call_count += 1
    return x * x


def memoize(func):
    cache = {}

    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]

    return wrapper


fast_square = memoize(slow_square)
print(fast_square(4))   # 16
print(fast_square(4))   # 16 — из кеша, slow_square не вызывалась
print(call_count)       # 1`,
          hints: [
            'Создайте словарь `cache = {}` в теле `memoize` — вложенная обёртка сохранит доступ к нему через замыкание.',
            'Параметр `*args` собирает аргументы в tuple, а tuple неизменяем — значит, его можно использовать как ключ словаря напрямую.',
            'Логика обёртки: если `args not in cache`, вычислить `func(*args)` и сохранить; в конце всегда вернуть `cache[args]`.',
          ],
        },
      ],
    },
    {
      slug: 'oop-classes',
      title: 'ООП и классы',
      description: 'Классы, три вида методов, property, наследование с super() и dunder-методы; dataclasses и выбор между композицией и наследованием.',
      duration: 35,
      blocks: [
        {
          type: 'text',
          text: 'Модели Django, схемы Pydantic, репозитории и сервисы — весь backend на Python держится на классах. Даже если вы предпочитаете функциональный стиль, фреймворки заставят вас наследоваться, переопределять методы и понимать, откуда берётся `self`. Разберём ООП так, как оно используется в реальных проектах: без академической теории ради теории, но с деталями, которые спрашивают на собеседованиях.',
        },
        { type: 'heading', text: 'Классы, экземпляры и __init__' },
        {
          type: 'code',
          language: 'python',
          filename: 'order.py',
          code: `class Order:
    # Атрибут КЛАССА — один на все экземпляры
    allowed_statuses = ("new", "paid", "shipped")

    def __init__(self, order_id: int, total: float):
        # Атрибуты ЭКЗЕМПЛЯРА — свои у каждого объекта
        self.order_id = order_id
        self.total = total
        self.status = "new"

    def mark_paid(self) -> None:
        self.status = "paid"


order = Order(1, 500.0)
other = Order(2, 1200.0)
order.mark_paid()

print(order.status)   # paid
print(other.status)   # new — экземпляры независимы
print(Order.allowed_statuses)  # общий атрибут класса`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Изменяемый атрибут класса — та же ловушка, что и мутабельный default-аргумент: `items = []` на уровне класса будет **общим списком для всех экземпляров**. Изменяемое состояние всегда инициализируйте в `__init__` через `self.items = []`.',
        },
        { type: 'heading', text: 'Методы: instance, classmethod, staticmethod' },
        {
          type: 'table',
          headers: ['Вид метода', 'Декоратор', 'Первый аргумент', 'Типичное применение'],
          rows: [
            ['Обычный метод', 'не нужен', '`self` — экземпляр', 'Бизнес-логика над данными объекта'],
            ['Метод класса', '`@classmethod`', '`cls` — сам класс', 'Альтернативные конструкторы: `from_dict`, `from_env`'],
            ['Статический метод', '`@staticmethod`', 'нет', 'Утилита, логически связанная с классом'],
          ],
        },
        {
          type: 'code',
          language: 'python',
          filename: 'user.py',
          code: `class User:
    def __init__(self, email: str, is_active: bool = True):
        self.email = email
        self.is_active = is_active

    # Обычный метод: работает с конкретным экземпляром
    def deactivate(self) -> None:
        self.is_active = False

    # Альтернативный конструктор: cls, а не User —
    # при наследовании вернёт экземпляр подкласса
    @classmethod
    def from_dict(cls, data: dict) -> "User":
        return cls(data["email"], data.get("is_active", True))

    # Утилита без доступа к self и cls
    @staticmethod
    def is_valid_email(email: str) -> bool:
        return "@" in email and "." in email.split("@")[-1]


payload = {"email": "a@example.com"}
user = User.from_dict(payload)
print(User.is_valid_email("нет-собаки"))  # False`,
        },
        { type: 'heading', text: 'property: вычисляемые атрибуты с валидацией' },
        {
          type: 'code',
          language: 'python',
          filename: 'product.py',
          code: `class Product:
    def __init__(self, name: str, price: float):
        self.name = name
        self.price = price   # присваивание идёт через setter — валидация с рождения

    @property
    def price(self) -> float:
        return self._price

    @price.setter
    def price(self, value: float) -> None:
        if value < 0:
            raise ValueError("Цена не может быть отрицательной")
        self._price = value


p = Product("Клавиатура", 4990)
p.price = 3990          # выглядит как атрибут, работает как метод
# p.price = -1          # ValueError — некорректное состояние невозможно
print(p.price)          # 3990`,
        },
        { type: 'heading', text: 'Наследование, super() и MRO' },
        {
          type: 'code',
          language: 'python',
          filename: 'repository.py',
          code: `class BaseRepository:
    def __init__(self, db):
        self.db = db

    def get(self, pk: int):
        print(f"SELECT ... WHERE id = {pk}")


class CachedUserRepository(BaseRepository):
    def __init__(self, db, cache):
        super().__init__(db)   # родитель настраивает свою часть состояния
        self.cache = cache

    def get(self, pk: int):
        if pk in self.cache:
            return self.cache[pk]
        return super().get(pk)  # расширяем, а не копируем логику родителя


# MRO — порядок, в котором Python ищет методы по иерархии.
# super() идёт по этой цепочке, что критично при множественном наследовании.
print(CachedUserRepository.__mro__)
# (CachedUserRepository, BaseRepository, object)`,
        },
        { type: 'heading', text: 'Dunder-методы и dataclasses' },
        {
          type: 'code',
          language: 'python',
          filename: 'money.py',
          code: `from dataclasses import dataclass, field


# Вручную: __repr__ для отладки, __eq__ для сравнения по значению
class ManualMoney:
    def __init__(self, amount: int, currency: str = "RUB"):
        self.amount = amount
        self.currency = currency

    def __repr__(self) -> str:
        return f"ManualMoney({self.amount!r}, {self.currency!r})"

    def __eq__(self, other) -> bool:
        if not isinstance(other, ManualMoney):
            return NotImplemented
        return (self.amount, self.currency) == (other.amount, other.currency)


# dataclass генерирует __init__, __repr__ и __eq__ автоматически
@dataclass(slots=True)
class Money:
    amount: int
    currency: str = "RUB"


@dataclass
class Cart:
    items: list[Money] = field(default_factory=list)  # безопасный изменяемый default

    def __len__(self) -> int:
        return len(self.items)


cart = Cart()
cart.items.append(Money(500))
print(Money(500) == Money(500))  # True — сравнение по значению
print(len(cart))                 # 1 — работает благодаря __len__`,
        },
        {
          type: 'text',
          text: 'Наследование — не единственный способ повторно использовать код, и часто не лучший. **Композиция** — когда объект получает зависимости извне и делегирует им работу — даёт более гибкий дизайн: `OrderService` не наследуется от `EmailSender`, а принимает notifier в конструктор. Тогда в тестах его легко подменить заглушкой, а в проде — заменить email на Telegram без переписывания иерархии. Практическое правило: наследование — для отношения **является** (`AdminUser` является `User`), композиция — для отношения **использует**.',
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Атрибуты экземпляра создаются в `__init__` через `self`; атрибуты класса общие для всех — изменяемые туда класть нельзя.',
            '`@classmethod` получает `cls` и идеален для альтернативных конструкторов; `@staticmethod` — утилита в пространстве имён класса.',
            '`property` превращает метод в атрибут: снаружи простое присваивание, внутри валидация.',
            '`super()` вызывает следующий класс по MRO — всегда используйте его вместо явного имени родителя.',
            '`__repr__` обязателен для отладки, `__eq__` включает сравнение по значению, `__len__` подключает объект к `len()`.',
            '`@dataclass` избавляет от шаблонного кода; для полей-коллекций — `field(default_factory=list)`.',
            'Наследование — для отношения является, композиция — для отношения использует; по умолчанию предпочитайте композицию.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Каким декоратором стоит пометить альтернативный конструктор `from_dict`, создающий объект из словаря?',
          options: ['@staticmethod', '@property', '@classmethod', '@dataclass'],
          correctIndex: 2,
          explanation: 'classmethod получает первым аргументом cls — сам класс, поэтому внутри можно писать cls(...) вместо жёстко зашитого имени. При наследовании AdminUser.from_dict(...) автоматически вернёт AdminUser, а не базовый User. staticmethod так не умеет: ему пришлось бы захардкодить имя класса.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'В классе объявлен атрибут `items = []` на уровне класса, и два разных экземпляра делают `self.items.append(...)`. Что произойдёт?',
          options: [
            'У каждого экземпляра будет собственный список',
            'Оба экземпляра будут изменять один общий список',
            'Python выбросит AttributeError при первом append',
            'Второй экземпляр автоматически получит копию списка',
          ],
          correctIndex: 1,
          explanation: 'Атрибут класса существует в единственном экземпляре и разделяется всеми объектами. Вызов self.items.append не создаёт новый атрибут экземпляра (в отличие от присваивания self.items = ...), а мутирует общий список класса. Поэтому изменяемое состояние инициализируют в __init__.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Какие методы декоратор `@dataclass` генерирует по умолчанию?',
          options: [
            '__init__, __repr__ и __eq__',
            'Только __init__',
            '__init__ и __hash__',
            '__new__ и __del__',
          ],
          correctIndex: 0,
          explanation: 'По умолчанию dataclass создаёт __init__ по аннотированным полям, информативный __repr__ и __eq__, сравнивающий объекты по значениям полей. __hash__ для изменяемых dataclass по умолчанию не генерируется; его можно получить, например, через frozen=True.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Класс BankAccount с валидацией',
          description: 'Реализуйте класс `BankAccount`: конструктор принимает `owner` и необязательный начальный `balance` (по умолчанию 0). Метод `deposit(amount)` пополняет счёт, `withdraw(amount)` снимает; оба выбрасывают `ValueError` при `amount <= 0`, а `withdraw` — ещё и при нехватке средств. Свойство `balance` должно быть доступно только для чтения. Определите `__repr__`, чтобы `print(account)` выводил владельца и баланс.',
          language: 'python',
          starterCode: `class BankAccount:
    # ваш код
    ...


acc = BankAccount("alina", 100)
acc.deposit(50)
acc.withdraw(30)
print(acc.balance)  # 120
print(acc)          # BankAccount(owner='alina', balance=120)

try:
    acc.withdraw(10_000)
except ValueError as exc:
    print(exc)      # Недостаточно средств`,
          solution: `class BankAccount:
    def __init__(self, owner: str, balance: float = 0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self) -> float:
        return self._balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Сумма должна быть положительной")
        self._balance += amount

    def withdraw(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Сумма должна быть положительной")
        if amount > self._balance:
            raise ValueError("Недостаточно средств")
        self._balance -= amount

    def __repr__(self) -> str:
        return f"BankAccount(owner={self.owner!r}, balance={self._balance})"


acc = BankAccount("alina", 100)
acc.deposit(50)
acc.withdraw(30)
print(acc.balance)  # 120
print(acc)          # BankAccount(owner='alina', balance=120)

try:
    acc.withdraw(10_000)
except ValueError as exc:
    print(exc)      # Недостаточно средств`,
          hints: [
            'Храните значение в защищённом атрибуте `self._balance`, а наружу отдавайте его через `@property` без setter — тогда прямое присваивание извне вызовет AttributeError.',
            'Проверки в deposit и withdraw делайте в самом начале метода и выбрасывайте `raise ValueError(...)` с понятным сообщением.',
            'В `__repr__` удобно использовать f-строку с `!r` для owner: `f"BankAccount(owner={self.owner!r}, balance={self._balance})"`.',
          ],
        },
      ],
    },
    {
      slug: 'exceptions',
      title: 'Исключения',
      description: 'Осмысленная обработка ошибок: иерархия исключений, raise from, собственные классы ошибок и контекстные менеджеры.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'В backend ошибки — не редкость, а норма: база недоступна, внешний API вернул 500, клиент прислал мусор вместо JSON. Разница между стажёром и уверенным разработчиком — в том, как код на это реагирует. Плохой сценарий: `except: pass`, и сервис молча теряет платежи. Хороший: конкретное исключение поймано на нужном уровне, залогировано с контекстом, клиент получил осмысленный ответ. В этом уроке строим культуру работы с ошибками.',
        },
        { type: 'heading', text: 'Иерархия исключений' },
        {
          type: 'code',
          language: 'python',
          filename: 'hierarchy.py',
          code: `# Упрощённая иерархия встроенных исключений:
# BaseException
#  |- SystemExit, KeyboardInterrupt   <- служебные, их НЕ перехватывают
#  |- Exception                       <- корень обычных ошибок
#      |- ValueError                  <- верный тип, неверное значение
#      |- TypeError                   <- неверный тип
#      |- KeyError, IndexError        <- наследники LookupError
#      |- OSError                     <- ошибки ОС: файлы, сеть
#          |- FileNotFoundError

def parse_age(raw: str) -> int:
    age = int(raw)              # ValueError, если raw = "abc"
    if not 0 < age < 130:
        raise ValueError(f"Возраст вне диапазона: {age}")
    return age

# Перехват конкретного типа — обрабатываем только то, что умеем чинить
try:
    age = parse_age("abc")
except ValueError as exc:
    print(f"Некорректный ввод: {exc}")

# Несколько типов одной веткой — кортеж
try:
    config = {"port": "8080"}
    port = int(config["prot"])          # опечатка -> KeyError
except (KeyError, ValueError) as exc:
    print(f"Ошибка конфигурации: {exc!r}")`,
        },
        { type: 'heading', text: 'try / except / else / finally' },
        {
          type: 'code',
          language: 'python',
          filename: 'four_blocks.py',
          code: `import json

def load_settings(path: str) -> dict:
    try:
        f = open(path, encoding="utf-8")
    except FileNotFoundError:
        print("Файл не найден, используем настройки по умолчанию")
        return {}
    else:
        # else выполняется, только если try прошёл БЕЗ исключений.
        # Держим в try минимум кода: json.load здесь не попадёт
        # под except FileNotFoundError по ошибке.
        with f:
            return json.load(f)
    finally:
        # finally выполняется ВСЕГДА: и при ошибке, и при return.
        # Место для освобождения ресурсов и метрик.
        print("Попытка загрузки настроек завершена")


settings = load_settings("settings.json")
print(settings)`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Голый `except:` перехватывает вообще всё, включая `KeyboardInterrupt` (Ctrl+C) и `SystemExit` — программа перестаёт корректно останавливаться. А `except Exception: pass` молча проглатывает баги. Минимум: перехватывайте конкретные типы; если ловите широко — логируйте и пробрасывайте дальше.',
        },
        { type: 'heading', text: 'raise и raise from' },
        {
          type: 'code',
          language: 'python',
          filename: 'raise_from.py',
          code: `from decimal import Decimal, InvalidOperation


class PriceParseError(Exception):
    pass


def parse_price(raw: str) -> Decimal:
    try:
        return Decimal(raw)
    except InvalidOperation as exc:
        # raise from сохраняет исходную ошибку в __cause__:
        # в traceback видны ОБЕ — и доменная, и техническая причина
        raise PriceParseError(f"Некорректная цена: {raw!r}") from exc


try:
    parse_price("12,50")   # запятая вместо точки
except PriceParseError as exc:
    print(exc)             # Некорректная цена: '12,50'
    print(exc.__cause__)   # исходная InvalidOperation

# Перелогировать и пробросить ту же ошибку выше:
# except PriceParseError:
#     logger.exception("не смогли распарсить прайс")
#     raise                # без аргументов — то же исключение`,
        },
        { type: 'heading', text: 'Собственные классы исключений' },
        {
          type: 'code',
          language: 'python',
          filename: 'app_errors.py',
          code: `# Своя иерархия позволяет ловить все ошибки нашего приложения
# одной веткой, не задевая чужие ValueError и KeyError.

class AppError(Exception):
    """Базовая ошибка приложения."""


class NotFoundError(AppError):
    """Сущность не найдена — на уровне API станет ответом 404."""


class PaymentError(AppError):
    def __init__(self, message: str, order_id: int):
        super().__init__(message)
        self.order_id = order_id   # контекст для логов и поддержки


def charge(order_id: int, amount: float) -> None:
    if amount > 100_000:
        raise PaymentError("Превышен лимит платежа", order_id=order_id)


try:
    charge(order_id=77, amount=150_000)
except PaymentError as exc:
    print(f"Платёж не прошёл (заказ {exc.order_id}): {exc}")
except AppError:
    print("Прочая ошибка приложения")`,
        },
        { type: 'heading', text: 'EAFP vs LBYL' },
        {
          type: 'table',
          headers: ['Подход', 'Суть', 'Пример', 'Когда уместен'],
          rows: [
            ['EAFP', 'Сделай и обработай исключение', '`try: user = users[uid]` / `except KeyError`', 'Идиоматичный Python; нет гонок: проверка и действие атомарны'],
            ['LBYL', 'Сначала проверь, потом делай', '`if uid in users: user = users[uid]`', 'Когда проверка дешёвая, а исключение было бы частым и дорогим'],
          ],
        },
        { type: 'heading', text: 'Контекстные менеджеры и contextlib' },
        {
          type: 'code',
          language: 'python',
          filename: 'context_managers.py',
          code: `import time
from contextlib import contextmanager

# with гарантирует освобождение ресурса даже при исключении.
# Протокол: __enter__ при входе, __exit__ при любом выходе из блока.

@contextmanager
def timer(label: str):
    start = time.perf_counter()
    try:
        yield                      # здесь выполняется тело with
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f} c")


with timer("подготовка отчёта"):
    total = sum(i * i for i in range(100_000))

# Тот же протокол — у файлов, локов и соединений с БД:
with timer("чтение файла"), open(__file__, encoding="utf-8") as f:
    lines = f.readlines()`,
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Перехватывайте максимально конкретные исключения; голый `except:` ловит даже Ctrl+C.',
            '`else` выполняется только без исключений в try, `finally` — всегда; в try держите минимум кода.',
            '`raise NewError(...) from exc` сохраняет причину в `__cause__` и даёт полную цепочку в traceback.',
            'Своя иерархия от базового `AppError` отделяет ошибки приложения от чужих и упрощает перехват на верхних уровнях.',
            'EAFP — идиоматичный стиль Python: действие в try вместо предварительных проверок с гонками.',
            '`with` гарантирует освобождение ресурсов; `@contextmanager` из contextlib создаёт менеджер из генератора в пять строк.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Почему `except Exception:` лучше, чем голый `except:`?',
          options: [
            'Голый except работает заметно медленнее',
            'Голый except перехватывает даже SystemExit и KeyboardInterrupt, мешая корректно завершить программу',
            'except Exception перехватывает больше типов ошибок, чем голый except',
            'Разницы нет, это чисто вопрос стиля',
          ],
          correctIndex: 1,
          explanation: 'Голый except ловит всех наследников BaseException, включая KeyboardInterrupt (Ctrl+C) и SystemExit — программа перестаёт нормально останавливаться. except Exception пропускает эти служебные исключения наружу, ограничиваясь обычными ошибками. Но и его стоит применять только на границах приложения и с логированием.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Когда выполняется блок `else` в конструкции try/except/else/finally?',
          options: [
            'Всегда, сразу после finally',
            'Только если в try возникло исключение',
            'Только если в try не возникло ни одного исключения',
            'Только если исключение возникло, но не было перехвачено',
          ],
          correctIndex: 2,
          explanation: 'else — это ветка успеха: она выполняется, только если try завершился без исключений. Это позволяет держать в try минимум кода, а продолжение успешного сценария выносить в else, чтобы его собственные ошибки случайно не попадали под тот же except.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Что даёт конструкция `raise AppError(...) from exc` по сравнению с простым `raise AppError(...)`?',
          options: [
            'Полностью подавляет исходное исключение',
            'Сохраняет исходное исключение в __cause__ и показывает цепочку причин в traceback',
            'Повторно запускает блок try с начала',
            'Превращает исключение в предупреждение',
          ],
          correctIndex: 1,
          explanation: 'raise from связывает новое исключение с исходным через атрибут __cause__, и traceback печатает оба с пометкой о прямой причине. Без from исходная ошибка тоже видна (через __context__), но помечается как случайно возникшая во время обработки, а не как осознанная трансляция ошибки в доменную.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Иерархия исключений для API-клиента',
          description: 'Создайте базовое исключение `ApiError` и наследников: `NotFoundError` и `RateLimitError` (последний хранит атрибут `retry_after`). Напишите функцию `handle_response(status, retry_after=None)`: при статусе 404 она выбрасывает `NotFoundError`, при 429 — `RateLimitError` с переданным `retry_after` (или 60 по умолчанию), при статусе >= 500 — `ApiError`, иначе возвращает строку `ok`. Продемонстрируйте перехват: `RateLimitError` обработайте отдельной веткой, остальные `ApiError` — общей.',
          language: 'python',
          starterCode: `class ApiError(Exception):
    pass


# добавьте NotFoundError и RateLimitError


def handle_response(status, retry_after=None):
    # ваш код
    ...


for status in (200, 429, 502):
    try:
        print(handle_response(status, retry_after=30))
    except RateLimitError as exc:
        print(f"Лимит запросов, повтор через {exc.retry_after} c")
    except ApiError as exc:
        print(f"Ошибка API: {exc}")`,
          solution: `class ApiError(Exception):
    pass


class NotFoundError(ApiError):
    pass


class RateLimitError(ApiError):
    def __init__(self, message, retry_after):
        super().__init__(message)
        self.retry_after = retry_after


def handle_response(status, retry_after=None):
    if status == 404:
        raise NotFoundError("Ресурс не найден")
    if status == 429:
        raise RateLimitError("Слишком много запросов", retry_after or 60)
    if status >= 500:
        raise ApiError(f"Ошибка сервера: {status}")
    return "ok"


for status in (200, 429, 502):
    try:
        print(handle_response(status, retry_after=30))
    except RateLimitError as exc:
        print(f"Лимит запросов, повтор через {exc.retry_after} c")
    except ApiError as exc:
        print(f"Ошибка API: {exc}")
# ok
# Лимит запросов, повтор через 30 c
# Ошибка API: Ошибка сервера: 502`,
          hints: [
            'Наследники без дополнительной логики объявляются одной строкой: `class NotFoundError(ApiError): pass`.',
            'В `RateLimitError.__init__` вызовите `super().__init__(message)` и сохраните `self.retry_after = retry_after`.',
            'Порядок веток except важен: сначала более конкретный `RateLimitError`, затем общий `ApiError` — иначе конкретная ветка никогда не сработает.',
          ],
        },
      ],
    },
    {
      slug: 'files',
      title: 'Работа с файлами',
      description: 'Файлы без сюрпризов: режимы open, кодировки, pathlib, построчное чтение больших файлов, JSON, CSV и временные файлы.',
      duration: 25,
      blocks: [
        {
          type: 'text',
          text: 'Backend постоянно работает с диском: конфиги, логи, выгрузки для бухгалтерии, загруженные пользователями файлы. И именно здесь всплывают самые обидные баги: сервис падает на проде из-за кодировки, которую никто не указал, или съедает всю память, пытаясь прочитать пятигигабайтный лог целиком. В этом уроке — приёмы, которые делают работу с файлами предсказуемой.',
        },
        { type: 'heading', text: 'open: режимы и кодировки' },
        {
          type: 'table',
          headers: ['Режим', 'Что делает', 'Если файла нет'],
          rows: [
            ['`r`', 'Чтение (по умолчанию)', 'FileNotFoundError'],
            ['`w`', 'Запись, содержимое стирается', 'Файл создаётся'],
            ['`a`', 'Дозапись в конец', 'Файл создаётся'],
            ['`x`', 'Создание нового файла', 'Файл создаётся; если уже есть — FileExistsError'],
            ['`rb` / `wb`', 'Байтовые чтение и запись: картинки, архивы', 'Как у `r` / `w`'],
          ],
        },
        {
          type: 'code',
          language: 'python',
          filename: 'open_basics.py',
          code: `# with гарантирует закрытие файла даже при исключении внутри блока.
# Без него незакрытый дескриптор может потерять буферизованные данные
# и упереться в лимит открытых файлов ОС.

with open("report.txt", "w", encoding="utf-8") as f:
    f.write("Отчёт за июль\\n")
    f.write("Выручка: 1 250 000\\n")

with open("report.txt", encoding="utf-8") as f:
    content = f.read()

print(content)

# Байтовый режим — без encoding: кодировки применимы только к тексту
with open("report.txt", "rb") as f:
    raw = f.read()
print(raw[:20])`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Всегда указывайте `encoding="utf-8"` явно. Без него Python берёт системную кодировку: на Linux-сервере это utf-8, а на Windows-машине коллеги — часто cp1251. Код, который работает у вас, молча портит кириллицу у других. Явная кодировка убирает целый класс багов.',
        },
        { type: 'heading', text: 'pathlib.Path — современный стандарт' },
        {
          type: 'code',
          language: 'python',
          filename: 'paths_demo.py',
          code: `from pathlib import Path

# Пути — объекты, а не строки; оператор / собирает их кроссплатформенно
base = Path("data")
config_path = base / "config" / "app.json"

print(config_path.name)     # app.json
print(config_path.suffix)   # .json
print(config_path.parent)   # data/config
print(config_path.exists()) # False

# Создание каталогов без ошибки, если уже существуют
config_path.parent.mkdir(parents=True, exist_ok=True)

# Быстрые чтение и запись без ручного open
config_path.write_text('{"debug": false}', encoding="utf-8")
print(config_path.read_text(encoding="utf-8"))

# Поиск файлов по маске, рекурсивно
for json_file in Path("data").rglob("*.json"):
    print(json_file, json_file.stat().st_size, "байт")`,
        },
        { type: 'heading', text: 'Большие файлы: читаем построчно' },
        {
          type: 'code',
          language: 'python',
          filename: 'big_file.py',
          code: `# f.read() загружает ВЕСЬ файл в память — на логе в 5 ГБ
# процесс просто упадёт. Файловый объект итерируем:
# цикл по нему читает по одной строке, память O(1).

def count_errors(path: str) -> int:
    count = 0
    with open(path, encoding="utf-8") as f:
        for line in f:               # лениво, строка за строкой
            if "ERROR" in line:
                count += 1
    return count


# Подготовим демо-лог и проверим
from pathlib import Path

Path("app.log").write_text(
    "INFO старт\\nERROR база недоступна\\nINFO повтор\\nERROR таймаут\\n",
    encoding="utf-8",
)
print(count_errors("app.log"))  # 2`,
        },
        { type: 'heading', text: 'JSON и CSV' },
        {
          type: 'code',
          language: 'python',
          filename: 'json_csv.py',
          code: `import csv
import json

# JSON: dump/load для файлов, dumps/loads для строк
user = {"id": 42, "email": "a@example.com", "name": "Алина"}

with open("user.json", "w", encoding="utf-8") as f:
    # ensure_ascii=False сохраняет кириллицу читаемой, а не \\u0410...
    json.dump(user, f, ensure_ascii=False, indent=2)

with open("user.json", encoding="utf-8") as f:
    loaded = json.load(f)
print(loaded["name"])  # Алина

# CSV: DictReader отдаёт каждую строку словарём по заголовкам.
# newline="" обязателен по документации модуля csv.
with open("orders.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["customer", "total"])
    writer.writeheader()
    writer.writerows([
        {"customer": "alina", "total": 500},
        {"customer": "boris", "total": 300},
    ])

with open("orders.csv", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        print(row["customer"], row["total"])`,
        },
        { type: 'heading', text: 'tempfile: временные файлы в тестах и обработке' },
        {
          type: 'code',
          language: 'python',
          filename: 'temp_demo.py',
          code: `import tempfile
from pathlib import Path

# Типичный сценарий: принять загрузку, обработать во временном
# каталоге и не оставить мусора — каталог удалится сам.

with tempfile.TemporaryDirectory() as tmp_dir:
    upload = Path(tmp_dir) / "upload.csv"
    upload.write_text("customer,total\\nalina,500\\n", encoding="utf-8")
    print(upload.exists())     # True — работаем с файлом как обычно

print(Path(tmp_dir).exists())  # False — всё вычищено автоматически`,
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Режимы: `r` — чтение, `w` — перезапись с нуля, `a` — дозапись, `b` — байты; `w` молча стирает существующий файл.',
            'Всегда открывайте файлы через `with` — закрытие гарантировано даже при исключении.',
            'Всегда указывайте `encoding="utf-8"` явно — системная кодировка различается между ОС.',
            '`pathlib.Path` — стандарт для путей: оператор `/`, `mkdir(parents=True, exist_ok=True)`, `read_text`, `rglob`.',
            'Большие файлы читайте построчно циклом по файловому объекту — память O(1) вместо загрузки целиком.',
            'Для JSON — `json.dump(..., ensure_ascii=False)`; для CSV — `DictReader`/`DictWriter` и `newline=""`.',
            '`tempfile.TemporaryDirectory` даёт рабочее пространство, которое удаляется автоматически.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Что произойдёт при открытии существующего файла в режиме `"w"`?',
          options: [
            'Python выбросит FileExistsError',
            'Новые данные допишутся в конец файла',
            'Содержимое файла будет стёрто ещё до первой записи',
            'Файл откроется в режиме только для чтения',
          ],
          correctIndex: 2,
          explanation: 'Режим w усекает файл до нулевой длины сразу при открытии — старое содержимое теряется, даже если вы ничего не запишете. Для дозаписи существует режим a, а для защиты от случайной перезаписи — режим x, который выбрасывает FileExistsError, если файл уже есть.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'В чём главная причина открывать файлы через `with open(...) as f`?',
          options: [
            'with читает файл быстрее обычного open',
            'Файл гарантированно закроется, даже если внутри блока возникнет исключение',
            'Без with невозможно прочитать файл целиком',
            'with автоматически определяет правильную кодировку файла',
          ],
          correctIndex: 1,
          explanation: 'with реализует протокол контекстного менеджера: метод __exit__ файлового объекта вызывается при любом выходе из блока — нормальном, через return или из-за исключения. Без with при ошибке между open и close файл останется открытым: буферы могут не записаться, а процесс — упереться в лимит дескрипторов.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Как правильно собрать путь `data/logs/app.log` средствами pathlib?',
          options: [
            'Path("data") + "logs" + "app.log"',
            'Path("data") / "logs" / "app.log"',
            'Path.join("data", "logs", "app.log")',
            'Path("data").append("logs/app.log")',
          ],
          correctIndex: 1,
          explanation: 'Path перегружает оператор деления: каждый / присоединяет следующий сегмент, а разделитель подставляется правильный для текущей ОС. Оператор + для Path не определён, метода join у класса Path нет (это метод строк и os.path), метода append — тоже.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Отчёт по заказам: из CSV в JSON',
          description: 'Дан файл `orders.csv` с колонками `customer` и `total` (создаётся в заготовке). Прочитайте его через `csv.DictReader`, просуммируйте `total` по каждому покупателю и сохраните результат в `report.json` как словарь `{customer: сумма}` — с `ensure_ascii=False` и отступом 2. В конце выведите содержимое `report.json` на экран через `pathlib.Path`. Везде используйте `encoding="utf-8"`. Ожидаемые суммы: alina — 700, boris — 300.',
          language: 'python',
          starterCode: `import csv
import json
from pathlib import Path

# Подготовка тестовых данных
Path("orders.csv").write_text(
    "customer,total\\nalina,500\\nboris,300\\nalina,200\\n",
    encoding="utf-8",
)

# ваш код: прочитать orders.csv, посчитать суммы по покупателям,
# записать report.json и вывести его содержимое`,
          solution: `import csv
import json
from pathlib import Path

# Подготовка тестовых данных
Path("orders.csv").write_text(
    "customer,total\\nalina,500\\nboris,300\\nalina,200\\n",
    encoding="utf-8",
)

totals = {}
with open("orders.csv", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        customer = row["customer"]
        totals[customer] = totals.get(customer, 0) + int(row["total"])

with open("report.json", "w", encoding="utf-8") as f:
    json.dump(totals, f, ensure_ascii=False, indent=2)

print(Path("report.json").read_text(encoding="utf-8"))
# {
#   "alina": 700,
#   "boris": 300
# }`,
          hints: [
            '`csv.DictReader(f)` сам прочитает первую строку как заголовки и будет отдавать каждую строку словарём: `row["customer"]`, `row["total"]`.',
            'Значения из CSV приходят строками — не забудьте `int(row["total"])` перед сложением. Для накопления сумм подойдёт `totals.get(customer, 0)`.',
            'Запись: `json.dump(totals, f, ensure_ascii=False, indent=2)` внутри `with open("report.json", "w", encoding="utf-8")`. Прочитать обратно проще всего через `Path("report.json").read_text(encoding="utf-8")`.',
          ],
        },
      ],
    },
    {
      slug: 'iterators-generators',
      title: 'Итераторы и генераторы',
      description: 'Протокол итерации, генераторы и ленивые вычисления: как обрабатывать гигабайтные файлы в константной памяти.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Представьте задачу: найти все ошибки в логе на 8 ГБ на сервере с 2 ГБ RAM. Решение прочитать файл в список и отфильтровать умрёт мгновенно. Решение на генераторах обработает лог в константной памяти и начнёт выдавать результаты сразу. Итераторы — механизм, на котором в Python работает вообще всё: цикл `for`, comprehensions, `zip`, чтение файлов, курсоры БД. Понимание этого протокола отделяет того, кто пишет на Python, от того, кто понимает Python.',
        },
        { type: 'heading', text: 'Протокол итерации: __iter__ и __next__' },
        {
          type: 'code',
          language: 'python',
          filename: 'protocol.py',
          code: `# Итерируемый объект отдаёт итератор через __iter__,
# итератор выдаёт элементы через __next__ и бросает StopIteration в конце.
# Цикл for делает ровно это под капотом.

numbers = [10, 20, 30]
it = iter(numbers)        # вызывает numbers.__iter__()
print(next(it))           # 10  (вызывает it.__next__())
print(next(it))           # 20
print(next(it))           # 30
# next(it)                # StopIteration — элементы кончились


class Countdown:
    """Итератор обратного отсчёта, реализованный вручную."""

    def __init__(self, start: int):
        self.current = start

    def __iter__(self):
        return self             # итератор возвращает сам себя

    def __next__(self) -> int:
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value


print(list(Countdown(3)))  # [3, 2, 1]`,
        },
        { type: 'heading', text: 'Генераторные функции и yield' },
        {
          type: 'code',
          language: 'python',
          filename: 'generators.py',
          code: `# Функция с yield при вызове НЕ выполняется, а возвращает генератор.
# Код бежит до ближайшего yield и замирает, сохраняя все локальные
# переменные, — до следующего next(). Класс Countdown в 3 строки:

def countdown(start: int):
    while start > 0:
        yield start
        start -= 1


gen = countdown(3)
print(next(gen))          # 3 — выполнение дошло до yield и замерло
print(next(gen))          # 2 — продолжили с того же места

for rest in gen:          # for сам обработает StopIteration
    print(rest)           # 1

print(list(countdown(3)))  # [3, 2, 1]`,
        },
        {
          type: 'note',
          variant: 'info',
          text: 'Генератор — одноразовый: после исчерпания повторная итерация не даст ни одного элемента (и ошибки тоже не будет — просто пустота). Если данные нужны дважды, либо создайте генератор заново, либо материализуйте его в список, осознанно заплатив памятью.',
        },
        { type: 'heading', text: 'Ленивые вычисления: большой лог без гигабайт RAM' },
        {
          type: 'text',
          text: 'Генераторное выражение выглядит как списковое включение, но в круглых скобках: `(x * x for x in data)`. Разница принципиальна: списковое включение сразу строит весь список в памяти, а генераторное выражение хранит только текущее состояние и вычисляет элементы по запросу. Из таких ленивых шагов собирают конвейеры: каждый этап тянет данные из предыдущего по одному элементу, и весь pipeline работает в константной памяти — как труба, а не как склад.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'log_pipeline.py',
          code: `from pathlib import Path

# Демо-лог; в реальности здесь файл на гигабайты
Path("app.log").write_text(
    "INFO старт\\nERROR db: таймаут\\nINFO ok\\nERROR api: 502\\nWARN диск\\n",
    encoding="utf-8",
)


def read_lines(path: str):
    with open(path, encoding="utf-8") as f:
        for line in f:                  # файл читается лениво
            yield line.rstrip("\\n")


# Каждый шаг конвейера ленивый; память O(1) на любом размере файла
lines = read_lines("app.log")
errors = (line for line in lines if line.startswith("ERROR"))
messages = (line.removeprefix("ERROR ") for line in errors)

for msg in messages:
    print(msg)
# db: таймаут
# api: 502

# Агрегация без промежуточных списков:
error_count = sum(1 for line in read_lines("app.log") if "ERROR" in line)
print(error_count)  # 2`,
        },
        { type: 'heading', text: 'itertools: islice, chain, groupby' },
        {
          type: 'table',
          headers: ['Функция', 'Что делает', 'Типичный сценарий'],
          rows: [
            ['`islice(it, n)`', 'Ленивый срез итератора', 'Первые 100 строк гигабайтного лога без чтения остального'],
            ['`chain(a, b)`', 'Склеивает итераторы в один поток', 'Обойти логи за несколько дней как один'],
            ['`groupby(it, key)`', 'Группирует **соседние** элементы с одинаковым ключом', 'Свернуть отсортированный поток событий по типу'],
          ],
        },
        {
          type: 'code',
          language: 'python',
          filename: 'itertools_demo.py',
          code: `from itertools import islice, chain, groupby

# islice: у генераторов нет срезов [0:5] — вместо них ленивый islice
first_two = list(islice((n * n for n in range(1_000_000)), 2))
print(first_two)  # [0, 1] — миллион квадратов никто не считал

# chain: несколько источников — один поток
day1 = ["ERROR a", "INFO b"]
day2 = ["ERROR c"]
all_errors = [ln for ln in chain(day1, day2) if ln.startswith("ERROR")]
print(all_errors)  # ['ERROR a', 'ERROR c']

# groupby группирует только СОСЕДНИЕ элементы —
# перед использованием данные сортируют по тому же ключу
events = [("payment", 100), ("refund", 30), ("payment", 50)]
events.sort(key=lambda e: e[0])
for kind, group in groupby(events, key=lambda e: e[0]):
    print(kind, sum(amount for _, amount in group))
# payment 150
# refund 30`,
        },
        { type: 'heading', text: 'yield from: делегирование вложенным генераторам' },
        {
          type: 'code',
          language: 'python',
          filename: 'yield_from.py',
          code: `# yield from item эквивалентен циклу for x in item: yield x,
# но короче и прозрачно пробрасывает значения из подгенератора.

def flatten(tree):
    for node in tree:
        if isinstance(node, list):
            yield from flatten(node)   # делегируем рекурсивному вызову
        else:
            yield node


nested = [1, [2, [3, 4]], 5]
print(list(flatten(nested)))  # [1, 2, 3, 4, 5]`,
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Протокол итерации: `__iter__` возвращает итератор, `__next__` выдаёт элементы и бросает `StopIteration` в конце; `for` делает это за вас.',
            'Функция с `yield` возвращает генератор; выполнение замирает на каждом yield и сохраняет всё локальное состояние.',
            'Генератор одноразовый: после исчерпания он молча пуст.',
            'Генераторные выражения `(x for x in ...)` ленивы — из них собирают конвейеры с памятью O(1) для файлов любого размера.',
            '`islice` — ленивый срез, `chain` — склейка потоков, `groupby` — группировка соседних элементов (данные предварительно сортируют).',
            '`yield from` делегирует выдачу вложенному генератору — незаменим в рекурсивных обходах.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Генератор уже полностью исчерпан. Что произойдёт при повторном проходе по нему циклом `for`?',
          options: [
            'Генератор перезапустится и выдаст те же значения заново',
            'Цикл не выполнит ни одной итерации — генератор останется пустым',
            'Исключение StopIteration вылетит наружу и уронит программу',
            'Будет выброшен RuntimeError',
          ],
          correctIndex: 1,
          explanation: 'Генератор хранит позицию выполнения и после завершения навсегда остаётся в исчерпанном состоянии: его __next__ сразу бросает StopIteration. Цикл for воспринимает это как штатный конец итерации и просто не входит в тело. Это частый источник тихих багов, когда один генератор пытаются обойти дважды.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Чем генераторное выражение `(x * x for x in range(10**6))` отличается от спискового включения `[x * x for x in range(10**6)]`?',
          options: [
            'Генераторное выражение сразу вычисляет все значения, но хранит их в сжатом виде',
            'Генераторное выражение хранит только текущее состояние и вычисляет элементы по запросу, почти не занимая память',
            'Списковое включение ленивое, а генераторное выражение — нет',
            'Отличий нет, это два синтаксиса одной операции',
          ],
          correctIndex: 1,
          explanation: 'Списковое включение немедленно строит список из миллиона элементов в памяти. Генераторное выражение создаёт лёгкий объект-генератор, который вычисляет очередной квадрат только когда его запросят — потребление памяти константное. Поэтому для однократного прохода, например внутрь sum, всегда выбирают генераторное выражение.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Как итератор сообщает, что элементы закончились?',
          options: [
            'Метод __next__ возвращает None',
            'Метод __next__ выбрасывает исключение StopIteration',
            'Метод __iter__ начинает возвращать False',
            'Метод __next__ возвращает пустой кортеж',
          ],
          correctIndex: 1,
          explanation: 'Конец итерации в Python сигнализируется исключением StopIteration из __next__ — это часть протокола, а не аварийная ситуация. Возврат None не подошёл бы: None может быть легальным элементом последовательности. Цикл for перехватывает StopIteration автоматически и завершает обход.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Генератор chunked: разбивка потока на пачки',
          description: 'Напишите генераторную функцию `chunked(iterable, size)`, которая разбивает любой итерируемый объект на списки длиной не более `size`. Функция должна работать лениво и не загружать всю последовательность в память: получите итератор через `iter()` и отрезайте от него пачки с помощью `itertools.islice`. Пример: `list(chunked(range(7), 3))` даёт `[[0, 1, 2], [3, 4, 5], [6]]`. Такой генератор — стандартный приём для батчевых вставок в БД.',
          language: 'python',
          starterCode: `from itertools import islice


def chunked(iterable, size):
    # ваш код
    ...


print(list(chunked(range(7), 3)))
# [[0, 1, 2], [3, 4, 5], [6]]

print(list(chunked([], 3)))
# []`,
          solution: `from itertools import islice


def chunked(iterable, size):
    it = iter(iterable)
    while True:
        chunk = list(islice(it, size))
        if not chunk:
            return
        yield chunk


print(list(chunked(range(7), 3)))
# [[0, 1, 2], [3, 4, 5], [6]]

print(list(chunked([], 3)))
# []`,
          hints: [
            'Сначала получите один общий итератор: `it = iter(iterable)`. Важно вызывать islice именно от него, а не от исходного iterable — иначе каждая пачка будет начинаться с начала.',
            'В бесконечном цикле берите очередную пачку: `chunk = list(islice(it, size))` — islice продвинет общий итератор ровно на size элементов.',
            'Пустая пачка означает конец данных: `if not chunk: return` завершит генератор, иначе — `yield chunk`.',
          ],
        },
      ],
    },
  ],
}
