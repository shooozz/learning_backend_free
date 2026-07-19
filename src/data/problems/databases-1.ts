import type { Problem } from '@/types/course'

// Сборник задач: Базы данных, часть 1
export const problems: Problem[] = [
  {
    type: 'quiz',
    id: 'a1',
    difficulty: 'easy',
    question:
      'В таблице `users` 100 строк, в колонке `city` — 8 разных городов. Что вернёт запрос `SELECT DISTINCT city FROM users`?',
    options: [
      '100 строк — DISTINCT влияет только на порядок вывода',
      '8 строк — по одной на каждый уникальный город',
      'Ошибку — DISTINCT работает только вместе с GROUP BY',
      '8 строк, но только если добавить ORDER BY city',
    ],
    correctIndex: 1,
    explanation:
      'DISTINCT убирает дубликаты из результата, поэтому останется по одной строке на каждый город. GROUP BY для этого не нужен — DISTINCT самостоятельная конструкция, а ORDER BY влияет только на порядок, не на состав строк.',
  },
  {
    type: 'quiz',
    id: 'a2',
    difficulty: 'easy',
    question: 'Что вернёт запрос `SELECT name FROM products ORDER BY price DESC LIMIT 3`?',
    options: [
      'Три случайных товара — без индекса порядок не гарантирован',
      'Три самых дешёвых товара',
      'Три самых дорогих товара',
      'Все товары, кроме трёх последних',
    ],
    correctIndex: 2,
    explanation:
      '`DESC` сортирует по убыванию цены, а `LIMIT 3` берёт первые три строки уже отсортированного результата — то есть самые дорогие. Самые дешёвые вернула бы сортировка по возрастанию (`ASC`).',
  },
  {
    type: 'code',
    id: 'a3',
    difficulty: 'easy',
    title: 'Товары в наличии до 1000 рублей',
    description:
      'Для страницы «Бюджетные товары» выберите из таблицы `products` колонки `name` и `price`: только товары в наличии (`in_stock = true`) с ценой **строго меньше** 1000, отсортированные от дешёвых к дорогим.',
    language: 'sql',
    starterCode: `-- Таблица: products (id, name, price, in_stock)
-- TODO: выберите name и price товаров в наличии дешевле 1000,
-- отсортируйте по цене по возрастанию
SELECT ...`,
    hints: [
      'Два условия объединяются в WHERE через AND.',
      'Сортировка — ORDER BY price; по возрастанию сортируется по умолчанию (ASC).',
      'SELECT name, price FROM products WHERE ... AND ... ORDER BY price',
    ],
    solution: `SELECT name, price
FROM products
WHERE in_stock = true
  AND price < 1000
ORDER BY price;`,
  },
  {
    type: 'quiz',
    id: 'a4',
    difficulty: 'easy',
    question:
      'В таблице `users` 50 строк, у 10 из них `email IS NULL`. Что вернут `COUNT(*)` и `COUNT(email)` соответственно?',
    options: [
      '50 и 40 — COUNT(email) не считает строки, где email равен NULL',
      '50 и 50 — обе формы просто считают строки таблицы',
      '40 и 40 — строки с NULL не учитываются никогда',
      '50 и 10 — COUNT(email) считает только NULL-значения',
    ],
    correctIndex: 0,
    explanation:
      '`COUNT(*)` считает все строки, а `COUNT(колонка)` — только те, где значение не NULL, поэтому получится 50 и 40. Вариант «50 и 50» — типичная ошибка: разница между формами COUNT проявляется именно на NULL.',
  },
  {
    type: 'quiz',
    id: 'a5',
    difficulty: 'easy',
    question:
      'Найдите ошибку в запросе: `SELECT name, price * quantity AS total FROM order_items WHERE total > 1000`.',
    options: [
      'Нельзя умножать колонки прямо в списке SELECT',
      'Псевдоним через AS разрешён только вместе с GROUP BY',
      'Ошибки нет — запрос корректен',
      'В WHERE нельзя обращаться к псевдониму total: нужно повторить выражение price * quantity',
    ],
    correctIndex: 3,
    explanation:
      'WHERE логически выполняется до вычисления списка SELECT, поэтому псевдоним `total` в нём ещё не существует — придётся написать `WHERE price * quantity > 1000`. Вычисляемые выражения в SELECT при этом совершенно законны.',
  },
  {
    type: 'code',
    id: 'a6',
    difficulty: 'easy',
    title: 'Скидка 10% на книги',
    description:
      'Магазин запускает акцию: все товары категории `\'books\'` дешевеют на 10%. Напишите UPDATE, который уменьшает `price` только у этих товаров. Помните: **UPDATE без WHERE изменит всю таблицу** — это классическая производственная авария.',
    language: 'sql',
    starterCode: `-- Таблица: products (id, name, price, category)
-- TODO: уменьшите цену товаров категории 'books' на 10%
UPDATE products
SET ...`,
    hints: [
      'Новая цена — это 90% старой: price * 0.9.',
      'Обязательно ограничьте затрагиваемые строки условием WHERE category = ...',
      'UPDATE products SET price = price * 0.9 WHERE category = \'books\';',
    ],
    solution: `UPDATE products
SET price = price * 0.9
WHERE category = 'books';`,
  },
  {
    type: 'quiz',
    id: 'a7',
    difficulty: 'easy',
    question:
      'Товар стоит ровно 200. Попадёт ли он под условие `WHERE price BETWEEN 100 AND 200`?',
    options: [
      'Нет — BETWEEN не включает границы диапазона',
      'Да — BETWEEN включает обе границы, это эквивалент price >= 100 AND price <= 200',
      'Результат будет NULL, потому что граничное значение неопределено',
      'Да, но только в PostgreSQL — по стандарту SQL правая граница исключается',
    ],
    correctIndex: 1,
    explanation:
      'BETWEEN по стандарту SQL включает обе границы, поэтому 200 подходит. Заблуждение «границы исключаются» приходит из привычки к полуинтервалам в программировании (например, срезы в Python), но в SQL это не так.',
  },
  {
    type: 'quiz',
    id: 'a8',
    difficulty: 'easy',
    question:
      'В `users` 10 пользователей, заказы в `orders` есть только у 4 из них. Сколько разных пользователей вернёт запрос `SELECT DISTINCT u.id FROM users u JOIN orders o ON o.user_id = u.id`?',
    options: [
      '4 — INNER JOIN оставляет только пользователей, у которых нашлась пара в orders',
      '10 — JOIN всегда возвращает все строки левой таблицы',
      '6 — вернутся только пользователи без заказов',
      '10 — но у шести из них вместо данных заказа будут NULL',
    ],
    correctIndex: 0,
    explanation:
      'Просто `JOIN` — это INNER JOIN: строки без совпадения отбрасываются, останутся 4 пользователя. Все 10 строк с NULL справа вернул бы LEFT JOIN — именно с ним путают INNER.',
  },
  {
    type: 'code',
    id: 'a9',
    difficulty: 'easy',
    title: 'Лента заказов с именами клиентов',
    description:
      'Для админки нужен список заказов: имя клиента, сумма и дата. Соедините таблицы `orders` и `users` и выведите `u.name`, `o.total`, `o.created_at` — сначала самые свежие заказы.',
    language: 'sql',
    starterCode: `-- Таблицы: users (id, name), orders (id, user_id, total, created_at)
-- TODO: выведите имя клиента, сумму и дату заказа,
-- свежие заказы — первыми
SELECT ...`,
    hints: [
      'Таблицы соединяются через JOIN ... ON o.user_id = u.id.',
      'Свежие первыми — это сортировка по created_at по убыванию.',
      'SELECT u.name, o.total, o.created_at FROM orders o JOIN users u ON ... ORDER BY o.created_at DESC',
    ],
    solution: `SELECT u.name, o.total, o.created_at
FROM orders o
JOIN users u ON u.id = o.user_id
ORDER BY o.created_at DESC;`,
  },
  {
    type: 'quiz',
    id: 'a10',
    difficulty: 'easy',
    question: 'Что выведет запрос `SELECT COALESCE(NULL, 0, 10)`?',
    options: [
      'NULL — если первый аргумент NULL, результат тоже NULL',
      '10 — COALESCE возвращает последний аргумент',
      '0 — COALESCE возвращает первый аргумент, который не NULL',
      'Ошибку — все аргументы COALESCE должны быть не NULL',
    ],
    correctIndex: 2,
    explanation:
      'COALESCE просматривает аргументы слева направо и возвращает первый не-NULL — здесь это 0. Вариант с «результат NULL» описывает поведение обычных выражений вроде `NULL + 5`, но COALESCE придуман как раз чтобы его обойти.',
  },
  {
    type: 'quiz',
    id: 'a11',
    difficulty: 'easy',
    question: 'Какое утверждение о первичном ключе (PRIMARY KEY) верно?',
    options: [
      'Таблица может иметь несколько первичных ключей',
      'Первичный ключ может содержать NULL, если такая строка одна',
      'Первичный ключ обязан быть целым числом',
      'Значения первичного ключа уникальны и не могут быть NULL',
    ],
    correctIndex: 3,
    explanation:
      'PRIMARY KEY — это по сути UNIQUE + NOT NULL: он однозначно идентифицирует строку. Первичный ключ у таблицы один (хотя может состоять из нескольких колонок) и не обязан быть числом — например, бывает UUID или составной ключ.',
  },
  {
    type: 'code',
    id: 'a12',
    difficulty: 'easy',
    title: 'Таблица сотрудников с ограничениями',
    description:
      'Создайте таблицу `employees`: автоинкрементный первичный ключ `id`, обязательное имя `name`, уникальный и обязательный `email`, дата найма `hired_at` со значением по умолчанию — текущая дата.',
    language: 'sql',
    starterCode: `-- TODO: создайте таблицу employees
-- id       — автоинкрементный первичный ключ (identity)
-- name     — text, обязательное
-- email    — text, обязательное и уникальное
-- hired_at — date, по умолчанию текущая дата
CREATE TABLE employees (
  ...
);`,
    hints: [
      'Современный способ объявить автоинкремент в PostgreSQL — GENERATED ALWAYS AS IDENTITY.',
      'Обязательность — NOT NULL, уникальность — UNIQUE, значение по умолчанию — DEFAULT CURRENT_DATE.',
      'id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE, ...',
    ],
    solution: `CREATE TABLE employees (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  hired_at date NOT NULL DEFAULT CURRENT_DATE
);`,
  },
  {
    type: 'quiz',
    id: 'a13',
    difficulty: 'easy',
    question:
      'Нужно быстро удалить **все** строки из огромной таблицы `logs`, сохранив саму таблицу и её структуру. Какой вариант лучший?',
    options: [
      'DROP TABLE logs — а потом создать таблицу заново',
      'TRUNCATE logs — мгновенно очищает таблицу без построчного удаления',
      'DELETE FROM logs — он быстрее, потому что не пишет журнал изменений',
      'ALTER TABLE logs CLEAR — специальная команда очистки',
    ],
    correctIndex: 1,
    explanation:
      'TRUNCATE освобождает данные целиком, не сканируя строки, поэтому на больших таблицах он на порядки быстрее. DELETE без WHERE тоже очистит таблицу, но будет обрабатывать каждую строку (и это он, а не TRUNCATE, самый медленный вариант); команды ALTER TABLE ... CLEAR не существует.',
  },
  {
    type: 'quiz',
    id: 'a14',
    difficulty: 'easy',
    question: 'Чем `VARCHAR(255)` отличается от `TEXT` в PostgreSQL с точки зрения производительности?',
    options: [
      'Практически ничем — хранятся они одинаково, VARCHAR(n) лишь добавляет проверку максимальной длины',
      'TEXT заметно медленнее, потому что всегда хранится вне основной таблицы',
      'VARCHAR быстрее, потому что имеет фиксированную длину',
      'TEXT нельзя индексировать, поэтому поиск по нему медленный',
    ],
    correctIndex: 0,
    explanation:
      'В PostgreSQL VARCHAR и TEXT — один и тот же тип хранения; VARCHAR(n) только валидирует длину при записи. Миф «VARCHAR быстрее» унаследован из других СУБД: цифра 255 в PostgreSQL никакой магии не несёт.',
  },
  {
    type: 'code',
    id: 'a15',
    difficulty: 'easy',
    title: 'Сводка по статусам заказов',
    description:
      'Для дашборда поддержки посчитайте по таблице `orders` для каждого `status` число заказов и суммарную выручку. Выведите `status`, количество (`orders_count`) и сумму (`revenue`), отсортировав по количеству по убыванию.',
    language: 'sql',
    starterCode: `-- Таблица: orders (id, status, total)
-- TODO: для каждого статуса посчитайте число заказов и сумму total,
-- отсортируйте по числу заказов по убыванию
SELECT ...`,
    hints: [
      'Группировка по статусу — GROUP BY status; агрегаты — COUNT(*) и SUM(total).',
      'Дайте агрегатам имена через AS, тогда на них можно сослаться в ORDER BY.',
      'SELECT status, COUNT(*) AS orders_count, SUM(total) AS revenue FROM orders GROUP BY status ORDER BY orders_count DESC',
    ],
    solution: `SELECT
  status,
  COUNT(*) AS orders_count,
  SUM(total) AS revenue
FROM orders
GROUP BY status
ORDER BY orders_count DESC;`,
  },
  {
    type: 'quiz',
    id: 'a16',
    difficulty: 'easy',
    question:
      'Что на самом деле гарантирует внешний ключ `orders.user_id REFERENCES users(id)`?',
    options: [
      'Что при удалении пользователя его заказы удалятся автоматически',
      'Что JOIN по этой колонке будет выполняться быстрее',
      'Что в orders.user_id нельзя записать id несуществующего пользователя',
      'Что значение user_id будет уникальным в таблице orders',
    ],
    correctIndex: 2,
    explanation:
      'Внешний ключ обеспечивает ссылочную целостность: ссылка всегда указывает на существующую строку. Автоудаление заказов требует явного `ON DELETE CASCADE`, а индекс на FK-колонке PostgreSQL автоматически не создаёт — ускорения JOIN «из коробки» не будет.',
  },
  {
    type: 'quiz',
    id: 'a17',
    difficulty: 'easy',
    question:
      'Вы подключились к базе через `psql`. Какая команда покажет структуру таблицы `users`: колонки, типы, индексы и ограничения?',
    options: [
      'SHOW TABLE users',
      'DESCRIBE users',
      '\\l users',
      '\\d users',
    ],
    correctIndex: 3,
    explanation:
      '`\\d users` — стандартная метакоманда psql для описания таблицы. `DESCRIBE` — синтаксис MySQL, в PostgreSQL он не работает, а `\\l` показывает список баз данных, а не таблиц.',
  },
  {
    type: 'code',
    id: 'a18',
    difficulty: 'easy',
    title: 'Найдите ошибку: поиск пользователя по email',
    description:
      'Функция ищет пользователя по email, но написана опасно: значение подставляется в SQL через f-строку. Если в `email` придёт `\' OR 1=1 --`, запрос вернёт чужие данные. Перепишите запрос на **параметризованный** — с плейсхолдером `%s`.',
    language: 'python',
    starterCode: `import psycopg

def find_user(conn, email: str):
    # НАЙДИТЕ ОШИБКУ: значение email попадает прямо в текст SQL.
    # TODO: перепишите на параметризованный запрос
    with conn.cursor() as cur:
        cur.execute(f"SELECT id, name FROM users WHERE email = '{email}'")
        return cur.fetchone()`,
    hints: [
      'Никогда не собирайте SQL строковыми операциями с пользовательским вводом — это SQL-инъекция.',
      'У cursor.execute есть второй аргумент — кортеж параметров; в тексте запроса вместо значения ставится %s.',
      'cur.execute("SELECT id, name FROM users WHERE email = %s", (email,)) — драйвер сам безопасно экранирует значение.',
    ],
    solution: `import psycopg

def find_user(conn, email: str):
    with conn.cursor() as cur:
        # Параметр передаётся отдельно от SQL — драйвер экранирует его сам,
        # инъекция через email невозможна
        cur.execute("SELECT id, name FROM users WHERE email = %s", (email,))
        return cur.fetchone()`,
  },
  {
    type: 'quiz',
    id: 'a19',
    difficulty: 'medium',
    question:
      'Нужно показать **всех** пользователей и сумму их крупных заказов. Найдите ошибку: `SELECT u.name, SUM(o.total) FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.total > 100 GROUP BY u.name`.',
    options: [
      'Условие o.total > 100 в WHERE отбрасывает строки с NULL и превращает LEFT JOIN в INNER — его нужно перенести в ON',
      'SUM нельзя использовать вместе с LEFT JOIN',
      'GROUP BY обязан идти перед WHERE',
      'Нужно просто заменить WHERE на HAVING o.total > 100',
    ],
    correctIndex: 0,
    explanation:
      'У пользователей без заказов `o.total` равен NULL, а `NULL > 100` — не TRUE, поэтому WHERE выкидывает их из результата. Перенос условия в ON фильтрует заказы до соединения и сохраняет всех пользователей; HAVING не спасёт — он фильтрует уже сгруппированные строки и потерянных пользователей не вернёт.',
  },
  {
    type: 'code',
    id: 'a20',
    difficulty: 'medium',
    title: 'Пользователи без единого заказа',
    description:
      'Маркетинг просит список «спящих» клиентов: выведите `id` и `name` пользователей, у которых нет **ни одного** заказа в таблице `orders`. Напишите запрос через `NOT EXISTS`.',
    language: 'sql',
    starterCode: `-- Таблицы: users (id, name), orders (id, user_id, total)
-- TODO: пользователи, у которых нет ни одного заказа
SELECT u.id, u.name
FROM users u
WHERE ...`,
    hints: [
      'NOT EXISTS проверяет, что коррелированный подзапрос не вернул ни одной строки.',
      'Подзапрос: SELECT 1 FROM orders o WHERE o.user_id = u.id. Альтернатива — LEFT JOIN с проверкой o.id IS NULL.',
      'Осторожно с NOT IN: если в подзапросе встретится NULL, условие не вернёт ни одной строки — поэтому NOT EXISTS надёжнее.',
    ],
    solution: `SELECT u.id, u.name
FROM users u
WHERE NOT EXISTS (
  SELECT 1
  FROM orders o
  WHERE o.user_id = u.id
);`,
  },
  {
    type: 'code',
    id: 'a21',
    difficulty: 'medium',
    title: 'Бронирование места без гонок',
    description:
      'Сервис продажи билетов: два человека одновременно бронируют место `42`. Обычный `SELECT` + `UPDATE` даёт гонку — оба увидят место свободным. Напишите транзакцию, которая читает строку места с блокировкой `FOR UPDATE`, и только затем помечает его занятым.',
    language: 'sql',
    starterCode: `-- Таблица: seats (id, is_booked boolean, booked_by)
-- TODO: внутри транзакции заблокируйте строку места 42,
-- затем пометьте его занятым пользователем 7
BEGIN;

-- шаг 1: прочитать место с блокировкой строки

-- шаг 2: занять место

COMMIT;`,
    hints: [
      'SELECT ... FOR UPDATE блокирует прочитанные строки до конца транзакции — вторая транзакция будет ждать.',
      'После блокировки приложение проверяет is_booked: если место уже занято, транзакцию откатывают.',
      'BEGIN; SELECT is_booked FROM seats WHERE id = 42 FOR UPDATE; UPDATE seats SET is_booked = true, booked_by = 7 WHERE id = 42; COMMIT;',
    ],
    solution: `BEGIN;

-- Блокируем строку: параллельная транзакция зависнет на этом же
-- SELECT ... FOR UPDATE, пока мы не сделаем COMMIT или ROLLBACK
SELECT is_booked
FROM seats
WHERE id = 42
FOR UPDATE;

-- Приложение проверяет: если is_booked = true — ROLLBACK и ответ «занято».
-- Если свободно — занимаем:
UPDATE seats
SET is_booked = true,
    booked_by = 7
WHERE id = 42;

COMMIT;`,
  },
  {
    type: 'quiz',
    id: 'a22',
    difficulty: 'medium',
    question:
      'Коллега предлагает «на всякий случай» создать индекс на каждую колонку таблицы `orders`. Почему это плохая идея?',
    options: [
      'PostgreSQL разрешает не больше 5 индексов на таблицу',
      'Индексы работают только с числовыми колонками',
      'Каждый индекс замедляет INSERT/UPDATE/DELETE и занимает место, а индексы без подходящих запросов ничего не дают взамен',
      'Планировщик умеет использовать только один индекс на запрос, остальные будут проигнорированы всегда',
    ],
    correctIndex: 2,
    explanation:
      'При каждой записи СУБД обновляет все индексы таблицы, поэтому лишние индексы — это чистый налог на запись и диск. Индексы стоит строить под реальные запросы; лимита в 5 штук нет, а планировщик, кстати, умеет комбинировать несколько индексов через Bitmap Scan.',
  },
  {
    type: 'code',
    id: 'a23',
    difficulty: 'medium',
    title: 'Email уникален без учёта регистра',
    description:
      'В базе появились дубли: `Ivan@mail.ru` и `ivan@mail.ru` — два разных пользователя. Обычный `UNIQUE (email)` такое пропускает. Создайте **уникальный функциональный индекс**, который запретит дубликаты email без учёта регистра, и напишите запрос поиска, который сможет этим индексом воспользоваться.',
    language: 'sql',
    starterCode: `-- Таблица: users (id, email text NOT NULL)
-- TODO 1: уникальный индекс по email без учёта регистра

-- TODO 2: поиск пользователя по email так,
-- чтобы запрос использовал этот индекс
SELECT id FROM users WHERE ...`,
    hints: [
      'Индекс можно строить не только по колонке, но и по выражению от неё — например, lower(email).',
      'Чтобы индекс по выражению сработал, в WHERE должно стоять то же самое выражение.',
      'CREATE UNIQUE INDEX ... ON users (lower(email)); поиск: WHERE lower(email) = lower(...)',
    ],
    solution: `-- Уникальность по нормализованному значению:
-- 'Ivan@mail.ru' и 'ivan@mail.ru' теперь конфликтуют
CREATE UNIQUE INDEX users_email_lower_uniq
ON users (lower(email));

-- В WHERE используем то же выражение, что и в индексе, —
-- иначе планировщик его не применит
SELECT id
FROM users
WHERE lower(email) = lower('Ivan@mail.ru');`,
  },
  {
    type: 'quiz',
    id: 'a24',
    difficulty: 'medium',
    question:
      'По колонке `created_at` есть B-tree индекс, но запрос `SELECT * FROM orders WHERE created_at::date = \'2024-05-01\'` всё равно выполняется через Seq Scan. Почему?',
    options: [
      'B-tree индексы не поддерживают типы даты и времени',
      'Приведение created_at::date — это выражение над колонкой, обычный индекс по created_at к нему неприменим; нужен диапазон >= и < или индекс по выражению',
      'Seq Scan на таблицах с датами всегда быстрее индекса',
      'Дату нужно записывать в формате DD.MM.YYYY, иначе индекс не распознаёт значение',
    ],
    correctIndex: 1,
    explanation:
      'Индекс построен по «сырым» значениям `created_at`, а запрос фильтрует по результату приведения типа — планировщику такой индекс не подходит. Правильно переписать условие диапазоном: `created_at >= \'2024-05-01\' AND created_at < \'2024-05-02\'`; формат записи даты здесь ни при чём.',
  },
  {
    type: 'code',
    id: 'a25',
    difficulty: 'medium',
    title: 'N+1 в SQLAlchemy',
    description:
      'Функция строит отчёт по пользователям, но на 100 пользователей делает 101 запрос: обращение к `u.orders` лениво загружает заказы каждого пользователя отдельно. Перепишите запрос так, чтобы заказы загрузились заранее одним дополнительным IN-запросом (итого **2 запроса**).',
    language: 'python',
    starterCode: `from sqlalchemy import select

def users_report(session):
    # TODO: сейчас каждое обращение к u.orders — отдельный SQL-запрос (N+1).
    # Загрузите связанные заказы заранее.
    users = session.scalars(select(User)).all()
    return [
        {'name': u.name, 'orders_count': len(u.orders)}
        for u in users
    ]`,
    hints: [
      'В SQLAlchemy стратегию загрузки связи задают через .options(...) у запроса.',
      'Для коллекций («один-ко-многим») подходит selectinload — она грузит все связанные объекты одним запросом с IN.',
      'select(User).options(selectinload(User.orders)) — и цикл больше не ходит в базу.',
    ],
    solution: `from sqlalchemy import select
from sqlalchemy.orm import selectinload

def users_report(session):
    # selectinload загрузит заказы всех пользователей вторым запросом:
    # SELECT ... FROM orders WHERE user_id IN (...)
    stmt = select(User).options(selectinload(User.orders))
    users = session.scalars(stmt).all()
    return [
        {'name': u.name, 'orders_count': len(u.orders)}
        for u in users
    ]`,
  },
  {
    type: 'quiz',
    id: 'a26',
    difficulty: 'medium',
    question:
      'Вам нужно удалить неиспользуемую колонку `legacy_code` из таблицы на проде без даунтайма. Приложение задеплоено на нескольких серверах. Какой порядок действий правильный?',
    options: [
      'Сначала выполнить миграцию с DROP COLUMN, потом деплоить код — схема базы важнее',
      'Удалить колонку и код одним деплоем — изменения применятся одновременно',
      'DROP COLUMN на проде выполнять нельзя, колонку можно только переименовать',
      'Сначала задеплоить код, который больше не обращается к колонке, и только затем выполнить миграцию с DROP COLUMN',
    ],
    correctIndex: 3,
    explanation:
      'Во время раскатки старый и новый код работают одновременно: если удалить колонку раньше, старые инстансы начнут падать на каждом SELECT. «Одновременного» применения не существует — миграция и деплой всегда разнесены во времени, поэтому сначала избавляемся от обращений к колонке в коде, потом удаляем её.',
  },
  {
    type: 'quiz',
    id: 'a27',
    difficulty: 'medium',
    question:
      'В списке из 50 постов нужно показывать число комментариев каждого. Комментариев миллионы, список открывают тысячи раз в минуту. Какой вариант лучший и почему?',
    options: [
      'Выполнять SELECT COUNT(*) для каждого поста в цикле приложения — просто и понятно',
      'Хранить денормализованный счётчик comments_count в таблице постов и обновлять его при добавлении и удалении комментария',
      'Загружать все комментарии в память приложения и считать их в Python',
      'Пересчитывать все счётчики раз в сутки полным сканом и мириться с ошибкой в данных за день',
    ],
    correctIndex: 1,
    explanation:
      'Денормализованный счётчик — осознанный размен: немного усложняем запись, зато чтение списка становится одним дешёвым запросом. COUNT в цикле — это классический N+1 (50 лишних запросов на каждое открытие страницы), а суточный пересчёт даёт заметно устаревшие цифры без необходимости.',
  },
  {
    type: 'code',
    id: 'a28',
    difficulty: 'medium',
    title: 'Счётчик посещений через UPSERT',
    description:
      'Нужно считать посещения страниц в таблице `page_visits (page text PRIMARY KEY, visits int)`. При первом заходе на страницу строки ещё нет — её надо создать со счётчиком 1, при повторных — увеличивать счётчик. Решите это **одним запросом** через `INSERT ... ON CONFLICT`.',
    language: 'sql',
    starterCode: `-- Таблица: page_visits (page text PRIMARY KEY, visits int NOT NULL)
-- TODO: одним запросом создайте строку для '/pricing' со счётчиком 1
-- или увеличьте существующий счётчик на 1
INSERT INTO page_visits (page, visits)
VALUES ('/pricing', 1)
...`,
    hints: [
      'ON CONFLICT (page) срабатывает, когда вставка нарушает уникальность первичного ключа.',
      'В ветке DO UPDATE текущая строка доступна по имени таблицы, а вставляемая — через EXCLUDED.',
      'ON CONFLICT (page) DO UPDATE SET visits = page_visits.visits + 1',
    ],
    solution: `INSERT INTO page_visits (page, visits)
VALUES ('/pricing', 1)
ON CONFLICT (page)
DO UPDATE SET visits = page_visits.visits + 1;`,
  },
  {
    type: 'quiz',
    id: 'a29',
    difficulty: 'medium',
    question:
      'Транзакция A на уровне READ COMMITTED дважды выполняет `SELECT balance FROM accounts WHERE id = 1`. Между её запросами транзакция B изменила баланс со 100 на 50 и сделала COMMIT. Что увидит A во втором SELECT?',
    options: [
      '100 — внутри транзакции данные «заморожены» на момент её начала',
      'Ошибку сериализации — PostgreSQL прервёт транзакцию A',
      '50 — READ COMMITTED видит чужие закоммиченные изменения между своими запросами',
      'NULL — строка заблокирована транзакцией B до конца транзакции A',
    ],
    correctIndex: 2,
    explanation:
      'На READ COMMITTED каждый запрос видит свежий снимок закоммиченных данных, поэтому второй SELECT вернёт 50 — это аномалия «неповторяющееся чтение». Снимок, «замороженный» на всю транзакцию, даёт уровень REPEATABLE READ, и путают обычно именно эти два уровня.',
  },
  {
    type: 'code',
    id: 'a30',
    difficulty: 'medium',
    title: 'Миграция Alembic: телефон пользователя',
    description:
      'Проект на SQLAlchemy + Alembic. Напишите тело миграции: `upgrade()` добавляет в таблицу `users` nullable-колонку `phone` (строка до 20 символов) и индекс `ix_users_phone` по ней; `downgrade()` **полностью откатывает** изменения в обратном порядке.',
    language: 'python',
    starterCode: `from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    # TODO: добавьте колонку phone (String(20), nullable=True)
    # и индекс ix_users_phone по ней
    pass


def downgrade() -> None:
    # TODO: откатите изменения в обратном порядке
    pass`,
    hints: [
      'Колонка добавляется через op.add_column(\'users\', sa.Column(...)), индекс — через op.create_index.',
      'Новую колонку на проде делают nullable: добавление NOT NULL без значения по умолчанию упадёт на существующих строках.',
      'downgrade зеркален upgrade, но в обратном порядке: сначала op.drop_index, потом op.drop_column.',
    ],
    solution: `from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    # nullable=True: на существующих строках NOT NULL без default упал бы
    op.add_column('users', sa.Column('phone', sa.String(20), nullable=True))
    op.create_index('ix_users_phone', 'users', ['phone'])


def downgrade() -> None:
    # Откат строго в обратном порядке: сначала индекс, потом колонка
    op.drop_index('ix_users_phone', table_name='users')
    op.drop_column('users', 'phone')`,
  },
]
