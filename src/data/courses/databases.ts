import type { Course } from '@/types/course'

export const databasesCourse: Course = {
  slug: 'databases',
  order: 2,
  title: 'Базы данных',
  description: 'Проектирование БД, SQL-запросы, индексы, миграции и работа с ORM.',
  level: 'Начальный',
  image: '/img-2.jpg',
  tags: ['SQL', 'PostgreSQL', 'ORM'],
  lessons: [
    {
      slug: 'sql-basics',
      title: 'SQL и реляционные БД',
      description: 'Реляционная модель, выборки с фильтрацией и сортировкой, агрегаты, JOIN, подзапросы и CTE, изменение данных и трёхзначная логика NULL.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Представьте: PM пишет в чат «выгрузи топ-10 клиентов за июнь по сумме заказов». Без SQL вы идёте просить коллегу или пишете скрипт на полдня. Со SQL — открываете консоль и решаете задачу за две минуты. SQL — язык **декларативный**: вы описываете, ЧТО хотите получить, а база сама решает, КАК это сделать. Это фундаментальный навык backend-разработчика: ORM, миграции, оптимизация — всё стоит на понимании SQL.',
        },
        {
          type: 'heading',
          text: 'Реляционная модель: таблицы, строки, ключи',
        },
        {
          type: 'text',
          text: 'Реляционная БД хранит данные в **таблицах**. Таблица — набор **строк** (записей) с одинаковыми **колонками**, у каждой колонки строгий тип. **Первичный ключ** (primary key, PK) уникально идентифицирует строку. **Внешний ключ** (foreign key, FK) — колонка, которая ссылается на PK другой таблицы и связывает данные: так заказ «знает» своего покупателя. База сама следит, чтобы FK не указывал на несуществующую строку — это называется **ссылочная целостность**.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'schema.sql',
          code: `CREATE TABLE users (
    id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name  text NOT NULL,
    email text NOT NULL UNIQUE,
    city  text                -- допускает NULL: город может быть неизвестен
);

CREATE TABLE orders (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    bigint NOT NULL REFERENCES users (id),  -- внешний ключ
    amount     numeric(10, 2) NOT NULL,
    status     text NOT NULL DEFAULT 'new',
    created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO users (name, email, city) VALUES
    ('Аня',   'anya@example.com',  'Москва'),
    ('Борис', 'boris@example.com', 'Казань'),
    ('Вера',  'vera@example.com',  NULL);

INSERT INTO orders (user_id, amount, status) VALUES
    (1, 1500.00, 'paid'),
    (1,  700.50, 'paid'),
    (2,  300.00, 'new');`,
        },
        {
          type: 'heading',
          text: 'SELECT: фильтрация, сортировка, ограничение',
        },
        {
          type: 'code',
          language: 'sql',
          code: `-- Оплаченные заказы дороже 500, свежие сверху, первые 10
SELECT id, amount, created_at
FROM orders
WHERE status = 'paid' AND amount > 500
ORDER BY created_at DESC
LIMIT 10;

-- Логический порядок выполнения:
-- FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
-- Поэтому алиас из SELECT нельзя использовать в WHERE

-- IN, BETWEEN, LIKE — частые операторы фильтрации
SELECT name, city
FROM users
WHERE city IN ('Москва', 'Казань')
  AND name LIKE 'А%'          -- имена на «А»
ORDER BY name;

-- Пагинация: третья страница по 20 записей
SELECT id, amount FROM orders
ORDER BY id
LIMIT 20 OFFSET 40;`,
        },
        {
          type: 'heading',
          text: 'Агрегаты, GROUP BY и HAVING',
        },
        {
          type: 'code',
          language: 'sql',
          code: `-- Сколько заказов и на какую сумму у каждого пользователя
SELECT user_id,
       count(*)    AS orders_count,
       sum(amount) AS total,
       round(avg(amount), 2) AS avg_amount
FROM orders
WHERE status = 'paid'        -- фильтр СТРОК до группировки
GROUP BY user_id
HAVING sum(amount) > 1000    -- фильтр ГРУПП после агрегации
ORDER BY total DESC;

-- Агрегаты без GROUP BY схлопывают всё в одну строку
SELECT count(*) AS total_orders, max(amount) AS biggest
FROM orders;`,
        },
        {
          type: 'heading',
          text: 'JOIN: данные из нескольких таблиц',
        },
        {
          type: 'code',
          language: 'sql',
          code: `-- INNER JOIN: только пользователи, у которых ЕСТЬ заказы
SELECT u.name, o.amount, o.status
FROM users u
JOIN orders o ON o.user_id = u.id;

-- LEFT JOIN: ВСЕ пользователи; у кого заказов нет —
-- в колонках orders будет NULL
SELECT u.name, o.id AS order_id, o.amount
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;

-- Классический приём: найти пользователей БЕЗ заказов
SELECT u.name
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;   -- Вера попадёт сюда`,
        },
        {
          type: 'table',
          headers: ['Тип JOIN', 'Что возвращает', 'Типичный сценарий'],
          rows: [
            ['INNER JOIN', 'Только строки, у которых нашлась пара в обеих таблицах', 'Заказы вместе с данными покупателя'],
            ['LEFT JOIN', 'Все строки левой таблицы + пара из правой или NULL', 'Все пользователи, включая тех, у кого нет заказов'],
            ['RIGHT JOIN', 'Зеркальный LEFT JOIN; на практике переписывают в LEFT', 'Почти не используется — LEFT читается легче'],
            ['FULL JOIN', 'Все строки обеих таблиц, без пары — NULL', 'Сверка двух источников данных, поиск расхождений'],
          ],
        },
        {
          type: 'heading',
          text: 'Подзапросы, CTE и изменение данных',
        },
        {
          type: 'code',
          language: 'sql',
          code: `-- Подзапрос: заказы дороже среднего чека
SELECT id, amount
FROM orders
WHERE amount > (SELECT avg(amount) FROM orders);

-- CTE (WITH): то же самое, но читается сверху вниз, как рецепт.
-- Каждому шагу — имя; сложный запрос перестаёт быть матрёшкой
WITH stats AS (
    SELECT avg(amount) AS avg_amount FROM orders
),
big_orders AS (
    SELECT o.user_id, o.amount
    FROM orders o, stats s
    WHERE o.amount > s.avg_amount
)
SELECT DISTINCT u.name
FROM users u
JOIN big_orders b ON b.user_id = u.id;

-- Изменение данных. RETURNING сразу возвращает результат —
-- не нужен второй запрос
INSERT INTO orders (user_id, amount) VALUES (3, 250.00) RETURNING id;

UPDATE orders SET status = 'paid' WHERE id = 3 RETURNING *;

-- ВСЕГДА пишите WHERE в UPDATE/DELETE: без него
-- команда изменит/удалит ВСЕ строки таблицы
DELETE FROM orders WHERE status = 'cancelled';`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'NULL — это «значение неизвестно», а не ноль и не пустая строка. В SQL действует **трёхзначная логика**: сравнение может дать TRUE, FALSE или NULL. Любое сравнение с NULL (`price = NULL`, `price <> NULL`) возвращает NULL, а WHERE пропускает только TRUE — такие строки просто исчезнут из результата. Проверяйте через `IS NULL` / `IS NOT NULL`, для сравнения «NULL-безопасно» есть `IS DISTINCT FROM`, для подстановки значения — `coalesce(city, \'не указан\')`.',
        },
        {
          type: 'heading',
          text: 'Итоги',
        },
        {
          type: 'list',
          items: [
            'Реляционная БД — таблицы со строгими типами; PK идентифицирует строку, FK связывает таблицы и охраняет целостность.',
            'Порядок выполнения запроса: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.',
            'WHERE фильтрует строки до группировки, HAVING — группы после агрегации.',
            'INNER JOIN — только совпадения, LEFT JOIN — вся левая таблица с NULL для отсутствующих пар.',
            'CTE (`WITH`) делает сложные запросы читаемыми: шаги именуются и идут сверху вниз.',
            'Сравнение с NULL всегда даёт NULL — используйте `IS NULL`, `coalesce`, `IS DISTINCT FROM`.',
            'UPDATE и DELETE без WHERE применяются ко всей таблице — перечитайте запрос перед Enter.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Что вернёт запрос `SELECT * FROM users WHERE city = NULL`?',
          options: [
            'Все строки, где city равен NULL',
            'Ошибку синтаксиса',
            'Ни одной строки',
            'Все строки таблицы',
          ],
          correctIndex: 2,
          explanation: 'Сравнение `city = NULL` по трёхзначной логике возвращает NULL, а не TRUE, для каждой строки — даже для тех, где city действительно NULL. WHERE пропускает только строки с результатом TRUE, поэтому результат будет пустым. Для проверки на NULL существует специальный оператор `IS NULL`.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Чем HAVING отличается от WHERE?',
          options: [
            'Ничем, это взаимозаменяемые синонимы',
            'WHERE фильтрует строки до группировки, HAVING — группы после агрегации',
            'HAVING работает быстрее, потому что использует индексы',
            'WHERE нельзя использовать в запросе с GROUP BY',
          ],
          correctIndex: 1,
          explanation: 'WHERE выполняется до GROUP BY и отбрасывает отдельные строки, поэтому в нём нельзя использовать агрегатные функции. HAVING применяется после группировки к уже посчитанным группам — именно там пишут условия вида `sum(amount) > 1000`. Условия без агрегатов выгоднее ставить в WHERE: база обработает меньше данных.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'В запросе `users LEFT JOIN orders` у пользователя нет ни одного заказа. Что попадёт в результат?',
          options: [
            'Пользователь не попадёт в результат вовсе',
            'Строка с данными пользователя и NULL во всех колонках orders',
            'Запрос завершится ошибкой',
            'Строка с данными пользователя и нулями в колонках orders',
          ],
          correctIndex: 1,
          explanation: 'LEFT JOIN гарантирует, что каждая строка левой таблицы попадёт в результат хотя бы один раз. Если пары в правой таблице не нашлось, её колонки заполняются NULL — не нулями и не пустыми строками. На этом строится классический приём поиска «сирот»: `WHERE o.id IS NULL`.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Топ-3 города по выручке',
          description: 'По схеме из урока (таблицы `users` и `orders`) напишите запрос, который выводит **топ-3 города по выручке** от оплаченных заказов (`status = \'paid\'`). Колонки результата: `city`, `orders_count` (число заказов), `revenue` (сумма). Пользователей с неизвестным городом (NULL) исключите. Сортировка — по выручке по убыванию.',
          language: 'sql',
          starterCode: `SELECT -- ваши колонки
FROM users u
-- соедините с orders
-- отфильтруйте, сгруппируйте, отсортируйте`,
          solution: `SELECT u.city,
       count(o.id)   AS orders_count,
       sum(o.amount) AS revenue
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.status = 'paid'
  AND u.city IS NOT NULL
GROUP BY u.city
ORDER BY revenue DESC
LIMIT 3;`,
          hints: [
            'Соедините таблицы через `JOIN orders o ON o.user_id = u.id` — нужны только пользователи с заказами, так что INNER JOIN подходит.',
            'Оба условия — не агрегатные, значит им место в WHERE: `o.status = \'paid\' AND u.city IS NOT NULL`. Помните: `= NULL` не сработает.',
            'Сгруппируйте по `u.city`, посчитайте `count(o.id)` и `sum(o.amount)`, отсортируйте `ORDER BY revenue DESC` и добавьте `LIMIT 3`.',
          ],
        },
      ],
    },
    {
      slug: 'postgresql',
      title: 'PostgreSQL',
      description: 'Почему PostgreSQL — стандарт backend-разработки: psql, богатые типы данных, транзакции, ACID, уровни изоляции и MVCC.',
      duration: 28,
      blocks: [
        {
          type: 'text',
          text: 'PostgreSQL — де-факто стандарт реляционной БД для backend. Причины прагматичные: открытая лицензия без сюрпризов, строгое следование стандарту SQL, богатые типы (`jsonb`, массивы, диапазоны), транзакционный DDL (миграция откатится целиком, если упала посередине), мощные расширения — от PostGIS для геоданных до pgvector для эмбеддингов. Все крупные облака предлагают managed PostgreSQL (AWS RDS, Cloud SQL, Yandex Managed Service), а Django и SQLAlchemy поддерживают его лучше всех остальных БД. Если нет веской причины брать другое — берите PostgreSQL.',
        },
        {
          type: 'heading',
          text: 'psql: терминал для работы с базой',
        },
        {
          type: 'code',
          language: 'bash',
          code: `# Подключение: хост, пользователь, база
psql -h localhost -U app -d shop

# Команды внутри psql (начинаются с обратного слэша):
\\l              # список баз данных
\\c shop         # переключиться на базу shop
\\dt             # список таблиц
\\d orders       # структура таблицы: колонки, индексы, внешние ключи
\\x              # вертикальный вывод — спасение для широких таблиц
\\timing         # показывать время выполнения каждого запроса
\\q              # выход

# Выполнить SQL-файл и одиночный запрос без входа в psql
psql -h localhost -U app -d shop -f schema.sql
psql -h localhost -U app -d shop -c "SELECT count(*) FROM orders;"`,
        },
        {
          type: 'heading',
          text: 'Богатые типы: jsonb, array, uuid, timestamptz',
        },
        {
          type: 'code',
          language: 'sql',
          code: `CREATE TABLE events (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id  uuid NOT NULL DEFAULT gen_random_uuid(),  -- для внешнего API
    name       text NOT NULL,
    tags       text[] NOT NULL DEFAULT '{}',             -- массив строк
    payload    jsonb NOT NULL DEFAULT '{}',              -- бинарный JSON
    created_at timestamptz NOT NULL DEFAULT now()        -- всегда с таймзоной!
);

INSERT INTO events (name, tags, payload) VALUES
    ('order.paid', ARRAY['billing', 'prod'],
     '{"order_id": 42, "amount": 1500, "currency": "RUB"}');

-- jsonb: ->> достаёт поле как текст, дальше можно привести тип
SELECT payload->>'currency'            AS currency,
       (payload->>'amount')::numeric   AS amount
FROM events
WHERE name = 'order.paid';

-- Оператор @> «содержит» — может использовать GIN-индекс
SELECT count(*) FROM events WHERE payload @> '{"currency": "RUB"}';

-- Массивы: проверка вхождения элемента
SELECT name FROM events WHERE 'billing' = ANY (tags);`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Тип `timestamp` (без таймзоны) хранит «показания настенных часов» без привязки к зоне: смените таймзону сервера или приложения — и все времена «поплывут». Правило без исключений: для моментов времени используйте **timestamptz** — он хранит момент в UTC и конвертирует при вводе-выводе. Голый `timestamp` оправдан редко, например для «локального времени сеанса в кинотеатре».',
        },
        {
          type: 'heading',
          text: 'Первичный ключ: SERIAL vs IDENTITY vs UUID',
        },
        {
          type: 'table',
          headers: ['Подход', 'Как работает', 'Когда выбирать'],
          rows: [
            ['SERIAL', 'Старый нестандартный синтаксис: неявно создаёт sequence и default', 'Только легаси. В новом коде не использовать'],
            ['GENERATED ALWAYS AS IDENTITY', 'Стандарт SQL, sequence управляется самой колонкой, случайный INSERT в id отклоняется', 'Дефолт для внутренних PK в новых таблицах'],
            ['uuid + gen_random_uuid()', 'Случайный 128-битный идентификатор, генерируется без обращения к БД', 'Публичные id в API (не раскрывают количество записей), распределённая генерация'],
          ],
        },
        {
          type: 'heading',
          text: 'Транзакции и ACID',
        },
        {
          type: 'list',
          items: [
            '**Atomicity** — транзакция применяется целиком или не применяется вовсе: не бывает «деньги списали, но не зачислили».',
            '**Consistency** — после коммита все ограничения (FK, UNIQUE, CHECK) соблюдены; нарушающая их транзакция откатится.',
            '**Isolation** — параллельные транзакции не видят незакоммиченные изменения друг друга.',
            '**Durability** — закоммиченное переживёт падение сервера: изменения сначала пишутся в WAL (журнал упреждающей записи).',
          ],
        },
        {
          type: 'code',
          language: 'sql',
          code: `-- Классика: перевод денег. Либо обе операции, либо ни одной
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;   -- фиксируем; если что-то пошло не так — ROLLBACK;

-- Транзакционный DDL — суперсила PostgreSQL:
-- упавшая посередине миграция не оставит схему полуизменённой
BEGIN;
ALTER TABLE accounts ADD COLUMN currency text NOT NULL DEFAULT 'RUB';
CREATE INDEX idx_accounts_currency ON accounts (currency);
COMMIT;`,
        },
        {
          type: 'heading',
          text: 'Уровни изоляции, аномалии и MVCC',
        },
        {
          type: 'text',
          text: 'Изоляция — это компромисс между корректностью и параллелизмом. Стандарт SQL описывает уровни `Read Committed` (дефолт в PostgreSQL), `Repeatable Read` и `Serializable` и аномалии, которые они допускают: **non-repeatable read** (повторное чтение той же строки даёт другой результат), **phantom read** (появились новые строки под то же условие), **lost update** (потерянное обновление). Под капотом PostgreSQL — **MVCC**: каждая транзакция видит согласованный снимок данных, UPDATE не перезаписывает строку, а создаёт новую версию. Поэтому читатели не блокируют писателей и наоборот, а устаревшие версии строк позже вычищает autovacuum.',
        },
        {
          type: 'code',
          language: 'sql',
          code: `-- Аномалия lost update на Read Committed: два параллельных списания
-- Сессия A: SELECT balance WHERE id = 1;  -- видит 1000
-- Сессия B: SELECT balance WHERE id = 1;  -- тоже видит 1000
-- Сессия A: UPDATE accounts SET balance = 900 WHERE id = 1; COMMIT;
-- Сессия B: UPDATE accounts SET balance = 900 WHERE id = 1; COMMIT;
-- Итог: 900 вместо 800 — списание сессии A потеряно!

-- Решение 1: атомарный UPDATE — чтение и запись одним запросом
UPDATE accounts
SET balance = balance - 100
WHERE id = 1 AND balance >= 100;

-- Решение 2: пессимистичная блокировка строки
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
-- строка заблокирована до конца транзакции; вторая сессия ждёт
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- Решение 3: поднять уровень изоляции — конфликт вызовет ошибку
-- сериализации, и приложение повторит транзакцию
BEGIN ISOLATION LEVEL REPEATABLE READ;
-- ...
COMMIT;`,
        },
        {
          type: 'heading',
          text: 'Итоги',
        },
        {
          type: 'list',
          items: [
            'PostgreSQL — дефолтный выбор для backend: стандарт SQL, богатые типы, транзакционный DDL, расширения, managed-сервисы во всех облаках.',
            'psql — основной инструмент: `\\d таблица` покажет колонки, индексы и FK; `\\x` спасает при широких строках.',
            'Для моментов времени — только `timestamptz`; `jsonb` — для полуструктурированных данных с операторами `->>` и `@>`.',
            'Для новых PK — `GENERATED ALWAYS AS IDENTITY`; uuid — для публичных идентификаторов в API.',
            'ACID гарантирует атомарность, целостность, изоляцию и сохранность закоммиченных данных.',
            'Дефолтный уровень изоляции — Read Committed; от lost update защищает атомарный UPDATE или `SELECT ... FOR UPDATE`.',
            'MVCC: транзакции работают со снимками, читатели и писатели не блокируют друг друга.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Нужно хранить момент оплаты заказа. Какой тип колонки выбрать?',
          options: [
            'timestamp — он короче и проще',
            'timestamptz — момент хранится в UTC и не зависит от таймзоны сервера',
            'date — дата оплаты важнее времени',
            'text с ISO-строкой — универсальнее всего',
          ],
          correctIndex: 1,
          explanation: '`timestamptz` хранит абсолютный момент времени в UTC и корректно конвертирует его при вводе и выводе, поэтому смена таймзоны сервера или клиента ничего не сломает. Голый `timestamp` хранит «настенные часы» без зоны, и одно и то же значение в Москве и Новосибирске означает разные моменты. Текстовое хранение лишает вас сравнений, арифметики дат и индексов по времени.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Какой уровень изоляции транзакций используется в PostgreSQL по умолчанию?',
          options: [
            'Read Uncommitted',
            'Read Committed',
            'Repeatable Read',
            'Serializable',
          ],
          correctIndex: 1,
          explanation: 'По умолчанию PostgreSQL работает на Read Committed: каждый запрос внутри транзакции видит данные, закоммиченные к моменту его старта. Этого достаточно для большинства CRUD-операций, но не защищает от lost update при схеме «прочитал — посчитал — записал». Read Uncommitted в PostgreSQL формально существует, но ведёт себя как Read Committed — грязное чтение невозможно в принципе благодаря MVCC.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Как рекомендуется объявлять автоинкрементный первичный ключ в новых таблицах PostgreSQL 16?',
          options: [
            'id serial PRIMARY KEY',
            'id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY',
            'id bigserial PRIMARY KEY',
            'id int с триггером, который берёт значение из sequence',
          ],
          correctIndex: 1,
          explanation: 'IDENTITY — это стандарт SQL: sequence принадлежит колонке, а вариант ALWAYS ещё и защищает от случайной ручной вставки id. SERIAL и BIGSERIAL — старый нестандартный синтаксис PostgreSQL с неявно создаваемым sequence, который сложнее сопровождать; официальная документация рекомендует IDENTITY. Триггеры для автоинкремента — архаика из мира Oracle до 12c.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Безопасный перевод денег',
          description: 'Напишите транзакцию перевода **500 рублей** со счёта `id = 1` на счёт `id = 2` в таблице `accounts (id, balance)`. Требования: обе строки должны быть заблокированы до изменения (защита от lost update), блокировать строки нужно в порядке возрастания id (защита от deadlock), списание не должно уводить баланс в минус.',
          language: 'sql',
          starterCode: `BEGIN;

-- 1. Заблокируйте обе строки счетов
-- 2. Спишите 500 со счёта 1 (не допуская минуса)
-- 3. Зачислите 500 на счёт 2

COMMIT;`,
          solution: `BEGIN;

-- Блокируем обе строки в стабильном порядке (по id),
-- чтобы две встречные транзакции не устроили deadlock
SELECT id, balance
FROM accounts
WHERE id IN (1, 2)
ORDER BY id
FOR UPDATE;

-- Списание с защитой от ухода в минус:
-- если средств не хватает, UPDATE затронет 0 строк —
-- приложение проверяет это и делает ROLLBACK
UPDATE accounts
SET balance = balance - 500
WHERE id = 1 AND balance >= 500;

UPDATE accounts
SET balance = balance + 500
WHERE id = 2;

COMMIT;`,
          hints: [
            'Блокировка строк — это `SELECT ... FOR UPDATE`. Обе строки можно заблокировать одним запросом с `WHERE id IN (1, 2)`.',
            'Deadlock случается, когда транзакция X заблокировала счёт 1 и ждёт счёт 2, а встречная Y — наоборот. Лекарство: все транзакции блокируют строки в одном порядке — добавьте `ORDER BY id`.',
            'Защита от минуса — условие прямо в UPDATE: `WHERE id = 1 AND balance >= 500`. Если обновилось 0 строк, приложение должно выполнить ROLLBACK вместо COMMIT.',
          ],
        },
      ],
    },
    {
      slug: 'data-modeling',
      title: 'Моделирование данных',
      description: 'Сущности и связи, ключи и политики ON DELETE, нормализация до 3НФ на примере интернет-магазина, типы связей, денормализация и soft delete.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Ошибка в коде правится за минуты, ошибка в схеме данных живёт годами: на неё завязаны миграции, запросы и работающий прод. Будем проектировать базу интернет-магазина. Сначала выделяем **сущности** — объекты предметной области: покупатель, товар, категория, заказ. Потом **связи** между ними: покупатель делает заказы, заказ содержит товары. Это удобно рисовать в виде **ER-диаграммы** (entity-relationship): прямоугольники-сущности, линии-связи с кардинальностью (один-ко-многим, многие-ко-многим). Инструменты — dbdiagram.io, draw.io или Mermaid прямо в README. Правило: сначала диаграмма, потом `CREATE TABLE` — стирать линию дешевле, чем мигрировать таблицу.',
        },
        {
          type: 'heading',
          text: 'Первичные, внешние ключи и ON DELETE',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'shop.sql',
          code: `CREATE TABLE categories (
    id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE products (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- нельзя удалить категорию, пока в ней есть товары
    category_id bigint NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
    name        text NOT NULL,
    price       numeric(10, 2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE customers (
    id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name  text NOT NULL,
    email text NOT NULL UNIQUE
);

CREATE TABLE orders (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- заказы — финансовые документы, удалять покупателя с заказами нельзя
    customer_id bigint NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- FK обеспечивают ссылочную целостность, но индекс на FK-колонку
-- PostgreSQL сам НЕ создаёт — добавляем вручную
CREATE INDEX idx_orders_customer ON orders (customer_id);`,
        },
        {
          type: 'table',
          headers: ['Политика', 'Что происходит при удалении родителя', 'Типичный случай'],
          rows: [
            ['RESTRICT / NO ACTION', 'Удаление запрещено, пока есть дочерние строки', 'Покупатель с заказами, категория с товарами'],
            ['CASCADE', 'Дочерние строки удаляются автоматически', 'Позиции заказа при удалении заказа'],
            ['SET NULL', 'FK в дочерних строках обнуляется (колонка должна допускать NULL)', 'Уволили менеджера — заказы остаются без менеджера'],
            ['SET DEFAULT', 'FK получает значение по умолчанию', 'Перенос записей в категорию «Без категории»'],
          ],
        },
        {
          type: 'heading',
          text: 'Нормализация: от хаоса к 3НФ',
        },
        {
          type: 'text',
          text: 'Типичный старт проекта — «одна большая таблица»: заказ, имя покупателя, email, список товаров через запятую. Работает ровно до первых аномалий. **Аномалия обновления**: покупатель сменил email — надо править 50 строк его заказов, забыли одну — данные противоречивы. **Аномалия вставки**: нельзя завести товар, пока его никто не купил. **Аномалия удаления**: удалили единственный заказ — потеряли и данные покупателя. Нормализация устраняет дублирование по шагам: **1НФ** — значения атомарны, никаких списков в одной ячейке; **2НФ** — неключевые колонки зависят от всего составного ключа, а не от его части; **3НФ** — нет транзитивных зависимостей: email покупателя зависит от покупателя, а не от заказа, значит ему место в таблице покупателей. На практике 3НФ достаточно почти всегда: если каждый факт хранится ровно в одном месте — вы у цели.',
        },
        {
          type: 'code',
          language: 'sql',
          code: `-- ДО: всё в одной таблице (антипример)
CREATE TABLE orders_flat (
    order_id       int,
    customer_name  text,
    customer_email text,          -- дублируется в каждом заказе (3НФ)
    products       text,          -- 'Ноутбук, Мышь' — список в ячейке (1НФ!)
    total          numeric
);

-- ПОСЛЕ: та же информация в 3НФ.
-- 1НФ: товары — отдельные строки order_items, а не текст через запятую.
-- 2НФ: название товара зависит только от товара -> уехало в products.
-- 3НФ: email зависит от покупателя, а не от заказа -> уехал в customers.
--
-- customers(id, name, email)
-- products(id, category_id, name, price)
-- orders(id, customer_id, created_at)
-- order_items(order_id, product_id, quantity, unit_price)
--
-- Смена email — теперь UPDATE ровно одной строки:
UPDATE customers SET email = 'new@example.com' WHERE id = 1;`,
        },
        {
          type: 'heading',
          text: 'Связи 1:1, 1:N и M:N',
        },
        {
          type: 'text',
          text: '**1:N** — самая частая связь: у покупателя много заказов; FK всегда живёт на стороне «многих» (`orders.customer_id`). **1:1** — выделение части колонок в отдельную таблицу: `customer_profiles` с тяжёлыми или редко используемыми полями, FK с ограничением UNIQUE. **M:N** — заказ содержит много товаров, товар входит во много заказов; в реляционной модели такая связь выражается только через **промежуточную таблицу** с двумя FK. Бонус: в неё можно класть атрибуты самой связи — количество, цену на момент покупки.',
        },
        {
          type: 'code',
          language: 'sql',
          code: `-- M:N между orders и products — промежуточная таблица
CREATE TABLE order_items (
    order_id   bigint NOT NULL REFERENCES orders (id)   ON DELETE CASCADE,
    product_id bigint NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
    quantity   int NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price numeric(10, 2) NOT NULL,  -- цена НА МОМЕНТ покупки
    PRIMARY KEY (order_id, product_id)   -- товар в заказе встречается один раз
);

-- Состав заказа №1
SELECT p.name, oi.quantity, oi.unit_price
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = 1;

-- Сколько раз покупали каждый товар
SELECT p.name, sum(oi.quantity) AS sold
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name
ORDER BY sold DESC NULLS LAST;`,
        },
        {
          type: 'heading',
          text: 'Денормализация и soft delete',
        },
        {
          type: 'text',
          text: 'Денормализация — **сознательное** дублирование данных ради скорости чтения. `unit_price` в `order_items` — уже она: цена товара меняется, а в заказе должна остаться историческая. Другой пример — счётчик `orders_count` в таблице покупателей вместо `count(*)` по заказам на каждый показ профиля. Денормализация оправдана, когда чтений на порядки больше, чем записей, а агрегация дорога; цена — риск рассинхронизации, поэтому дубли обновляют в той же транзакции или триггером. Правило: сначала нормализованная схема, денормализация — потом, по результатам измерений, а не «на всякий случай».',
        },
        {
          type: 'code',
          language: 'sql',
          code: `-- Soft delete: строка не удаляется, а помечается
ALTER TABLE products ADD COLUMN deleted_at timestamptz;  -- NULL = «жив»

-- «Удаление» товара
UPDATE products SET deleted_at = now() WHERE id = 10;

-- Этот фильтр теперь нужен В КАЖДОМ запросе к товарам
SELECT * FROM products WHERE deleted_at IS NULL;

-- Подвох: UNIQUE (name) держит имя занятым даже у «удалённой» строки.
-- Решение — частичный уникальный индекс только по живым записям:
CREATE UNIQUE INDEX products_name_alive_uq
    ON products (name)
    WHERE deleted_at IS NULL;

-- Hard delete: строка исчезает физически, вернуть можно только из бэкапа
DELETE FROM products WHERE id = 10;`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Soft delete выбирают для данных с ценностью: заказы, платежи, аккаунты — всё, что нужно аудиту или «восстановите мне удалённое». Плата: фильтр `deleted_at IS NULL` во всех запросах (в ORM его прячут в базовый менеджер или дефолтный scope), растущая таблица и обход UNIQUE-ограничений. Для мусорных данных вроде черновиков и старых сессий честный hard delete проще и чище. И помните: soft delete — не замена бэкапам.',
        },
        {
          type: 'heading',
          text: 'Итоги',
        },
        {
          type: 'list',
          items: [
            'Проектирование начинается с сущностей и связей на ER-диаграмме, а не с `CREATE TABLE`.',
            'FK охраняет целостность; политику ON DELETE выбирают по смыслу: RESTRICT для ценного, CASCADE для зависимого, SET NULL для необязательного.',
            'PostgreSQL не индексирует FK-колонки автоматически — создавайте индексы вручную.',
            'Нормализация до 3НФ убирает дублирование и аномалии: каждый факт хранится ровно в одном месте.',
            'FK живёт на стороне «многих»; M:N реализуется только промежуточной таблицей, куда можно класть атрибуты связи.',
            'Денормализация — осознанный компромисс ради чтения; вводится по измерениям и обновляется транзакционно.',
            'Soft delete (`deleted_at`) — для ценных данных; следите за фильтрами и уникальностью через partial unique index.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'В таблице заказов есть колонка `phones` со значением `\'89001112233, 89004445566\'`. Какая нормальная форма нарушена?',
          options: [
            '1НФ — значение в ячейке не атомарно',
            '2НФ — есть зависимость от части ключа',
            '3НФ — есть транзитивная зависимость',
            'Нормализация не нарушена, это допустимый приём',
          ],
          correctIndex: 0,
          explanation: 'Первая нормальная форма требует атомарности: одна ячейка — одно значение. Список телефонов через запятую нельзя нормально фильтровать, индексировать и валидировать — поиск по номеру превращается в LIKE по подстроке. Правильное решение — отдельная таблица `phones` со связью 1:N к владельцу.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Какую политику ON DELETE выбрать для FK `order_items.order_id`, чтобы позиции заказа удалялись вместе с заказом?',
          options: [
            'RESTRICT',
            'CASCADE',
            'SET NULL',
            'SET DEFAULT',
          ],
          correctIndex: 1,
          explanation: 'Позиция заказа — зависимая сущность: без родительского заказа она не имеет смысла, поэтому CASCADE корректно удалит позиции вместе с заказом. RESTRICT заставил бы вручную удалять позиции перед заказом, а SET NULL невозможен — `order_id` входит в первичный ключ и не может быть NULL. Обратите внимание: для `product_id` в той же таблице CASCADE был бы ошибкой — удаление товара стёрло бы строки из истории продаж.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Как правильно смоделировать связь «многие-ко-многим» между студентами и курсами?',
          options: [
            'Массив id курсов в таблице студентов',
            'FK `student_id` в таблице курсов',
            'Промежуточная таблица с FK на студента и на курс',
            'jsonb-колонка со списком курсов у каждого студента',
          ],
          correctIndex: 2,
          explanation: 'M:N в реляционной модели выражается только промежуточной таблицей с двумя внешними ключами — так работают ссылочная целостность, JOIN и индексы. Бонус: в промежуточную таблицу можно класть атрибуты самой связи — дату записи, оценку. Массив или jsonb со списком id лишают вас FK-контроля: база не заметит удаление курса, на который ссылаются студенты.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Схема «Студенты и курсы»',
          description: 'Спроектируйте схему для учебной платформы: таблицы `students` (имя, уникальный email), `courses` (уникальное название) и связь M:N через `enrollments` с атрибутами `enrolled_at` (момент записи, по умолчанию сейчас) и `grade` (оценка 1-5, NULL пока курс не сдан). Студент не может записаться на один курс дважды. При удалении студента его записи удаляются, удаление курса с записями запрещено.',
          language: 'sql',
          starterCode: `CREATE TABLE students (
    -- id, name, email
);

CREATE TABLE courses (
    -- id, title
);

CREATE TABLE enrollments (
    -- связь M:N + enrolled_at, grade
);`,
          solution: `CREATE TABLE students (
    id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name  text NOT NULL,
    email text NOT NULL UNIQUE
);

CREATE TABLE courses (
    id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL UNIQUE
);

CREATE TABLE enrollments (
    student_id  bigint NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    course_id   bigint NOT NULL REFERENCES courses (id)  ON DELETE RESTRICT,
    enrolled_at timestamptz NOT NULL DEFAULT now(),
    grade       int CHECK (grade BETWEEN 1 AND 5),   -- NULL = курс не сдан
    PRIMARY KEY (student_id, course_id)              -- нет повторных записей
);

CREATE INDEX idx_enrollments_course ON enrollments (course_id);`,
          hints: [
            'M:N — это промежуточная таблица `enrollments` с двумя FK: `student_id REFERENCES students (id)` и `course_id REFERENCES courses (id)`.',
            'Запрет повторной записи — составной первичный ключ `PRIMARY KEY (student_id, course_id)`. Оценку ограничьте через `CHECK (grade BETWEEN 1 AND 5)` и оставьте nullable.',
            'Политики удаления по условию: `ON DELETE CASCADE` для student_id, `ON DELETE RESTRICT` для course_id. Не забудьте индекс на второй FK — составной PK покрывает поиск только по student_id.',
          ],
        },
      ],
    },
    {
      slug: 'indexes-optimization',
      title: 'Индексы и оптимизация',
      description: 'B-tree изнутри, когда индекс не работает, составные и partial индексы, чтение планов EXPLAIN ANALYZE и борьба с N+1.',
      duration: 32,
      blocks: [
        {
          type: 'text',
          text: 'Реальная история с любого прода: эндпоинт списка заказов отвечал 30 мс, через год — 4 секунды, и дежурный получает алерты ночью. Таблица выросла до 10 миллионов строк, а запрос всё ещё читает её целиком. Одна команда `CREATE INDEX` — и снова 2 мс. Индекс — это отдельная структура данных, «алфавитный указатель» к таблице: вместо перелистывания всей книги вы смотрите в указатель и открываете нужную страницу. Понимание, как индексы устроены и когда планировщик их использует, — то, что отличает Middle от Junior.',
        },
        {
          type: 'heading',
          text: 'Как устроен B-tree',
        },
        {
          type: 'text',
          text: 'Дефолтный индекс PostgreSQL — **B-tree**, сбалансированное дерево. В листьях — отсортированные значения колонки со ссылками на строки таблицы, над ними — страницы-указатели «значения меньше X — налево, больше — направо». Дерево широкое и низкое: даже для 10 миллионов строк глубина 3-4 уровня, то есть поиск — считанные обращения к страницам вместо чтения всей таблицы, O(log N). Так как значения **отсортированы**, B-tree ускоряет не только `=`, но и `<`, `>`, `BETWEEN`, `ORDER BY` и `LIKE \'абв%\'` — поиск по префиксу. Всё, что ломает порядок сортировки, ломает и применимость индекса.',
        },
        {
          type: 'heading',
          text: 'Когда индекс используется, а когда нет',
        },
        {
          type: 'code',
          language: 'sql',
          code: `CREATE INDEX idx_users_email   ON users (email);
CREATE INDEX idx_users_created ON users (created_at);

-- Индекс РАБОТАЕТ:
SELECT * FROM users WHERE email = 'anna@example.com';
SELECT * FROM users WHERE created_at >= now() - interval '7 days';
SELECT * FROM users WHERE email LIKE 'anna%';    -- префикс сохраняет порядок

-- Индекс НЕ работает:
SELECT * FROM users WHERE lower(email) = 'anna@example.com';
-- ^ функция над колонкой: в индексе лежит email, а не lower(email)

SELECT * FROM users WHERE email LIKE '%@gmail.com';
-- ^ ведущий %: искомое может быть где угодно, порядок не помогает

SELECT * FROM users WHERE is_active = true;
-- ^ низкая селективность: если активны 95% строк, дешевле Seq Scan,
--   чем миллионы прыжков индекс -> таблица

-- Лекарство от функций — функциональный индекс:
CREATE INDEX idx_users_email_lower ON users (lower(email));
-- теперь WHERE lower(email) = '...' использует индекс`,
        },
        {
          type: 'heading',
          text: 'Составные индексы и порядок колонок',
        },
        {
          type: 'code',
          language: 'sql',
          code: `CREATE INDEX idx_orders_user_created ON orders (user_id, created_at);

-- Использует индекс ПОЛНОСТЬЮ:
-- равенство по первой колонке + диапазон по второй
SELECT * FROM orders
WHERE user_id = 42 AND created_at >= '2026-06-01';

-- Использует (правило крайнего левого префикса):
SELECT * FROM orders WHERE user_id = 42;

-- НЕ использует: первой колонки нет в условии.
-- Записи внутри индекса отсортированы сначала по user_id,
-- поэтому все created_at «перемешаны» между пользователями
SELECT * FROM orders WHERE created_at >= '2026-06-01';

-- Практическое правило порядка колонок:
-- сначала колонки с равенством (=), затем колонка с диапазоном
-- или сортировкой. Бонус: индекс выше отдаёт заказы пользователя
-- уже отсортированными — ORDER BY created_at бесплатен:
SELECT * FROM orders
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 20;`,
        },
        {
          type: 'heading',
          text: 'EXPLAIN ANALYZE: читаем план запроса',
        },
        {
          type: 'code',
          language: 'sql',
          code: `EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42;

--  Index Scan using idx_orders_user_created on orders
--      (cost=0.43..8.45 rows=12 width=64)
--      (actual time=0.031..0.048 rows=11 loops=1)
--  Planning Time: 0.110 ms
--  Execution Time: 0.071 ms

-- Как читать план:
-- 1. Тип узла: Index Scan — хорошо; Seq Scan на большой таблице
--    в горячем запросе — сигнал разбираться.
-- 2. rows=12 (прогноз) vs actual rows=11 (факт): близко — статистика
--    свежая. Расхождение в разы -> выполните ANALYZE orders;
-- 3. loops: узел с loops=1000 выполнился 1000 раз — умножайте
--    его actual time на 1000.
-- 4. Execution Time — итоговое время выполнения запроса.

-- EXPLAIN без ANALYZE только строит план и НЕ выполняет запрос:
-- безопасно даже для UPDATE/DELETE
EXPLAIN UPDATE orders SET status = 'done' WHERE user_id = 42;`,
        },
        {
          type: 'table',
          headers: ['Узел плана', 'Что делает', 'Когда это нормально'],
          rows: [
            ['Seq Scan', 'Читает таблицу целиком, строка за строкой', 'Маленькие таблицы; выборка большой доли строк; аналитика'],
            ['Index Scan', 'Идёт по индексу и прыгает в таблицу за каждой строкой', 'Селективные условия: небольшая доля строк по ключу'],
            ['Index Only Scan', 'Отвечает прямо из индекса, в таблицу не ходит', 'Покрывающий индекс: все нужные колонки лежат в нём'],
            ['Bitmap Heap Scan', 'Собирает битовую карту нужных страниц, читает их одним проходом', 'Средняя селективность; объединение условий по нескольким индексам'],
          ],
        },
        {
          type: 'heading',
          text: 'N+1, partial и покрывающие индексы',
        },
        {
          type: 'code',
          language: 'python',
          code: `# Проблема N+1 — главный убийца производительности в ORM:
# 1 запрос за заказами + 100 запросов за пользователями
orders = Order.objects.all()[:100]
for order in orders:
    print(order.user.name)   # каждый order.user — отдельный SELECT!

# Решение: JOIN одним запросом
orders = Order.objects.select_related("user")[:100]
for order in orders:
    print(order.user.name)   # 1 запрос вместо 101

# Индексы тут не спасут: 100 быстрых запросов всё равно
# медленнее одного из-за сетевых round-trip до базы.
# Ловить N+1 помогает логирование SQL и django-debug-toolbar`,
        },
        {
          type: 'code',
          language: 'sql',
          code: `-- Partial-индекс: индексируем только нужное подмножество строк.
-- 95% заказов давно в статусе 'done', а запросы ищут активные:
CREATE INDEX idx_orders_active ON orders (created_at)
    WHERE status IN ('new', 'processing');
-- В разы меньше обычного и дешевле в обслуживании;
-- работает для запросов, чьё условие включает этот WHERE

-- Покрывающий индекс: нужные колонки лежат прямо в индексе
CREATE INDEX idx_orders_user_cover ON orders (user_id)
    INCLUDE (amount, status);

-- Все колонки запроса есть в индексе -> Index Only Scan,
-- обращений к таблице нет вообще
SELECT amount, status FROM orders WHERE user_id = 42;`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Индексы не бесплатны: каждый INSERT, UPDATE и DELETE обновляет **все** индексы таблицы, поэтому десяток «на всякий случай» ощутимо замедляет запись и раздувает диск. Индекс создаётся под конкретные запросы, а не «на будущее». Периодически проверяйте `pg_stat_user_indexes`: индексы с `idx_scan = 0` за месяцы работы — кандидаты на удаление. На проде создавайте индексы через `CREATE INDEX CONCURRENTLY`, чтобы не блокировать запись в таблицу.',
        },
        {
          type: 'heading',
          text: 'Итоги',
        },
        {
          type: 'list',
          items: [
            'B-tree — отсортированное сбалансированное дерево: поиск за O(log N), работает для `=`, диапазонов, `ORDER BY` и префиксного `LIKE`.',
            'Индекс не используется: функция над колонкой, `LIKE` с ведущим `%`, низкая селективность условия.',
            'В составном индексе работает правило крайнего левого префикса; колонки с `=` ставьте раньше диапазонных.',
            'EXPLAIN ANALYZE выполняет запрос и показывает факт: тип скана, прогноз vs реальные строки, время. EXPLAIN без ANALYZE — только план.',
            'Seq Scan — не всегда зло: для маленьких таблиц и больших выборок он дешевле индекса.',
            'N+1 решается на уровне ORM (`select_related`/`prefetch_related`), а не индексами.',
            'Partial-индекс сужает индекс до горячего подмножества, INCLUDE даёт Index Only Scan; каждый индекс — налог на запись.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Почему условие `WHERE name LIKE \'%иван%\'` не может использовать обычный B-tree индекс по name?',
          options: [
            'B-tree хранит значения отсортированными, а поиск по середине строки не может опереться на этот порядок',
            'LIKE в принципе несовместим с индексами PostgreSQL',
            'B-tree не умеет работать со строковыми типами',
            'Мешает регистрозависимость — нужно было писать ILIKE',
          ],
          correctIndex: 0,
          explanation: 'B-tree ускоряет поиск благодаря сортировке значений: чтобы спуститься по дереву, нужно знать, с чего начинается искомое. Шаблон с ведущим `%` означает «вхождение в любом месте строки» — порядок сортировки бесполезен, и остаётся читать всё. При этом `LIKE \'иван%\'` (по префиксу) индекс использовать может, а для поиска по подстроке существует триграммный GIN-индекс из расширения pg_trgm.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Есть индекс `ON users (city, age)`. Какой запрос сможет использовать его эффективно?',
          options: [
            'SELECT * FROM users WHERE age = 25',
            'SELECT * FROM users WHERE city = \'Москва\' AND age > 30',
            'SELECT * FROM users WHERE upper(city) = \'МОСКВА\'',
            'SELECT * FROM users WHERE age BETWEEN 20 AND 30',
          ],
          correctIndex: 1,
          explanation: 'Составной индекс отсортирован сначала по city, затем по age внутри каждого города — работает правило крайнего левого префикса. Запрос с равенством по city и диапазоном по age идеально ложится на такой порядок. Запросы только по age не могут использовать индекс (значения age перемешаны между городами), а `upper(city)` — это функция над колонкой, в индексе хранится исходное значение.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Чем EXPLAIN ANALYZE отличается от простого EXPLAIN?',
          options: [
            'Ничем, ANALYZE — просто более подробный формат вывода',
            'EXPLAIN ANALYZE реально выполняет запрос и показывает фактическое время и число строк',
            'ANALYZE обновляет статистику планировщика для таблицы',
            'EXPLAIN ANALYZE строит план, но гарантированно не трогает данные',
          ],
          correctIndex: 1,
          explanation: 'EXPLAIN только строит предполагаемый план, а EXPLAIN ANALYZE выполняет запрос по-настоящему и дополняет план фактами: actual time, реальное число строк, loops. Именно сравнение прогноза rows с фактом выявляет устаревшую статистику. Поэтому с EXPLAIN ANALYZE для UPDATE/DELETE осторожно — данные реально изменятся; оборачивайте в BEGIN ... ROLLBACK.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Индекс под конкретный запрос',
          description: 'Горячий запрос приложения: `SELECT id, amount FROM orders WHERE status = \'new\' AND city = \'Москва\' ORDER BY created_at DESC LIMIT 20`. Сейчас план показывает Seq Scan по 8 млн строк. Напишите: (1) составной индекс, который позволит выполнить и фильтрацию, и сортировку без чтения всей таблицы; (2) partial-вариант этого индекса, если известно, что запрос всегда ищет только `status = \'new\'`, а таких строк меньше 1%; (3) команду для проверки плана.',
          language: 'sql',
          starterCode: `-- 1. Составной индекс (подумайте про порядок колонок)


-- 2. Partial-индекс под фиксированный status = 'new'


-- 3. Проверка плана`,
          solution: `-- 1. Равенства (status, city) — слева, колонка сортировки — справа.
-- DESC в индексе совпадает с ORDER BY ... DESC в запросе
CREATE INDEX idx_orders_status_city_created
    ON orders (status, city, created_at DESC);

-- 2. Строк со status = 'new' меньше 1% — переносим условие
-- в WHERE индекса: он становится крошечным и дешёвым в поддержке
CREATE INDEX idx_orders_new_city_created
    ON orders (city, created_at DESC)
    WHERE status = 'new';

-- 3. Убеждаемся, что план сменился на Index Scan
EXPLAIN ANALYZE
SELECT id, amount FROM orders
WHERE status = 'new' AND city = 'Москва'
ORDER BY created_at DESC
LIMIT 20;`,
          hints: [
            'Правило порядка колонок: сначала колонки, по которым в запросе равенство (`status`, `city`), последней — колонка сортировки (`created_at`).',
            'Чтобы ORDER BY ... DESC LIMIT 20 читал первые 20 записей прямо из индекса, объявите колонку сортировки как `created_at DESC`.',
            'В partial-индексе условие `WHERE status = \'new\'` переезжает из списка колонок в WHERE самого индекса — тогда `status` в ключе индекса уже не нужен, остаются `(city, created_at DESC)`.',
          ],
        },
      ],
    },
    {
      slug: 'migrations',
      title: 'Миграции',
      description: 'Версионирование схемы БД: Django-миграции, Alembic для SQLAlchemy, обратимость, миграции данных и деплой изменений без даунтайма.',
      duration: 27,
      blocks: [
        {
          type: 'text',
          text: 'Сценарий из жизни: на staging фича работает, на проде — 500-ки, потому что там нет колонки, которую кто-то добавил вручную через psql два месяца назад. Когда схема живёт «в головах», среды неизбежно расходятся. **Миграции** решают это: каждое изменение схемы — файл в git, с автором, ревью и историей. Любую среду можно привести к нужной версии схемы одной командой, а изменения БД деплоятся тем же процессом, что и код. Миграции — это git для схемы базы данных.',
        },
        {
          type: 'heading',
          text: 'Django: makemigrations и migrate',
        },
        {
          type: 'code',
          language: 'bash',
          code: `# 1. Меняем модели в models.py, затем генерируем миграцию:
python manage.py makemigrations orders
# Migrations for 'orders':
#   orders/migrations/0002_order_comment.py
#     + Add field comment to order

# 2. Применяем к базе:
python manage.py migrate

# Полезное в работе:
python manage.py showmigrations orders   # [X] применена, [ ] нет
python manage.py sqlmigrate orders 0002  # показать SQL миграции
python manage.py migrate orders 0001     # откат до миграции 0001

# makemigrations сравнивает модели с ИСТОРИЕЙ миграций (не с базой!)
# migrate смотрит таблицу django_migrations и применяет недостающее`,
        },
        {
          type: 'code',
          language: 'python',
          filename: 'orders/migrations/0002_order_comment.py',
          code: `from django.db import migrations, models


class Migration(migrations.Migration):
    # граф зависимостей: эта миграция применяется после 0001
    dependencies = [
        ("orders", "0001_initial"),
    ]

    # список операций; каждая знает, как выполниться и откатиться
    operations = [
        migrations.AddField(
            model_name="order",
            name="comment",
            field=models.TextField(blank=True, default=""),
        ),
    ]`,
        },
        {
          type: 'heading',
          text: 'Alembic для SQLAlchemy',
        },
        {
          type: 'code',
          language: 'bash',
          code: `alembic init migrations        # однократная настройка проекта

# autogenerate сравнивает модели SQLAlchemy с реальной схемой БД
alembic revision --autogenerate -m "add comment to orders"

alembic upgrade head           # применить все новые миграции
alembic downgrade -1           # откатить одну последнюю
alembic current                # какая ревизия применена в БД
alembic history                # вся цепочка ревизий`,
        },
        {
          type: 'code',
          language: 'python',
          filename: 'migrations/versions/8f2c1a9b3d10_add_comment.py',
          code: `"""add comment to orders

Revision ID: 8f2c1a9b3d10
Revises: 4a7e2b1c9f00
"""
from alembic import op
import sqlalchemy as sa

revision = "8f2c1a9b3d10"
down_revision = "4a7e2b1c9f00"


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("comment", sa.Text(), nullable=False, server_default=""),
    )


def downgrade() -> None:
    # каждая миграция обязана уметь откатываться
    op.drop_column("orders", "comment")`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Autogenerate — помощник, а не автопилот. Переименование колонки он видит как «удалить старую + добавить новую» — это **потеря данных** на проде. Часть изменений (некоторые server_default, CHECK-ограничения) он не замечает вовсе. Железное правило: каждый сгенерированный файл миграции читается глазами до коммита, а перед прод-деплоем полезно посмотреть итоговый SQL (`sqlmigrate` в Django, `alembic upgrade head --sql` в Alembic).',
        },
        {
          type: 'heading',
          text: 'Миграции данных vs миграции схемы',
        },
        {
          type: 'text',
          text: 'Миграции **схемы** меняют структуру: колонки, таблицы, индексы. Миграции **данных** меняют содержимое: backfill новой колонки, разбиение `full_name` на имя и фамилию, чистка дублей. В Django для этого есть `RunPython`, в Alembic — `op.execute()`. Про **обратимость**: у миграции схемы откат обычно очевиден (drop_column), а вот у миграции данных его может не быть в принципе — слив двух колонок в одну назад не развернуть. Тогда откат объявляют пустым (`migrations.RunPython.noop`) и понимают: назад дороги нет, это осознанное решение, а не забытая функция.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'accounts/migrations/0006_fill_full_name.py',
          code: `from django.db import migrations


def fill_full_name(apps, schema_editor):
    # Историческая модель на момент этой миграции.
    # Прямой импорт из models.py сломается, когда модель изменится!
    User = apps.get_model("accounts", "User")
    users = User.objects.filter(full_name="")
    for user in users.iterator(chunk_size=1000):
        user.full_name = (user.first_name + " " + user.last_name).strip()
        user.save(update_fields=["full_name"])


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0005_user_full_name"),
    ]

    operations = [
        # второй аргумент — функция отката; здесь откат «ничего не делать»
        migrations.RunPython(fill_full_name, migrations.RunPython.noop),
    ]`,
        },
        {
          type: 'heading',
          text: 'Опасные миграции и деплой без даунтайма',
        },
        {
          type: 'text',
          text: 'Ключевой факт: во время деплоя **старый и новый код работают одновременно** (rolling update), поэтому каждая миграция обязана быть совместима с обоими. Вторая опасность — блокировки: DDL берёт `ACCESS EXCLUSIVE` lock, и «безобидный» ALTER на таблице в 50 млн строк останавливает прод. Примеры: `ADD COLUMN ... DEFAULT <константа>` в PostgreSQL 11+ быстрый (default хранится в метаданных), но `SET NOT NULL` на существующей колонке сканирует всю таблицу под блокировкой. Переименование колонки ломает старый код мгновенно — поэтому его делают в несколько релизов: добавить новую колонку, писать в обе, перенести данные, переключить чтение, удалить старую.',
        },
        {
          type: 'table',
          headers: ['Опасная операция', 'Чем грозит', 'Безопасная альтернатива'],
          rows: [
            ['RENAME COLUMN одной миграцией', 'Старый код падает во время rolling-деплоя', 'Новая колонка -> двойная запись -> backfill -> переключение чтения -> удаление старой в следующем релизе'],
            ['ADD COLUMN NOT NULL без default', 'Ошибка на непустой таблице', 'Добавить nullable -> backfill батчами -> SET NOT NULL'],
            ['CREATE INDEX на большой таблице', 'Блокирует запись до конца построения', 'CREATE INDEX CONCURRENTLY (вне транзакции)'],
            ['Смена типа колонки (int -> bigint)', 'Перезапись таблицы под ACCESS EXCLUSIVE', 'Новая колонка + постепенный перенос + переключение'],
            ['DROP COLUMN сразу после релиза', 'Откат кода становится невозможным', 'Удалять колонку через релиз после того, как код перестал её читать'],
          ],
        },
        {
          type: 'heading',
          text: 'Итоги',
        },
        {
          type: 'list',
          items: [
            'Миграции — версионирование схемы в git: любая среда приводится к нужной версии одной командой.',
            'Django: `makemigrations` генерирует файл, сравнивая модели с историей миграций; `migrate` применяет; `sqlmigrate` показывает SQL.',
            'Alembic: `revision --autogenerate` + `upgrade head` / `downgrade -1`; у каждой ревизии есть `upgrade()` и `downgrade()`.',
            'Autogenerate видит переименование как drop+add — сгенерированные миграции всегда читаются перед коммитом.',
            'Миграции данных (RunPython, op.execute) отделяйте от миграций схемы; используйте исторические модели через `apps.get_model`.',
            'Во время деплоя старый и новый код живут одновременно — миграция должна быть совместима с обоими.',
            'Опасные операции разбиваются на шаги: nullable -> backfill -> NOT NULL; переименование — в несколько релизов; индексы — CONCURRENTLY.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Что делает команда `python manage.py makemigrations`?',
          options: [
            'Применяет неприменённые миграции к базе данных',
            'Сравнивает модели с историей миграций и генерирует файл с новыми операциями',
            'Сверяет модели с реальной схемой БД и чинит расхождения',
            'Откатывает последнюю миграцию приложения',
          ],
          correctIndex: 1,
          explanation: '`makemigrations` только генерирует файл: Django строит «виртуальную» схему по цепочке существующих миграций, сравнивает её с текущими моделями и записывает разницу как новые операции. К базе данных эта команда вообще не подключается для изменений — применяет миграции отдельная команда `migrate`, которая сверяется с таблицей `django_migrations`.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Почему колонку на проде нельзя просто переименовать одной миграцией?',
          options: [
            'PostgreSQL не поддерживает RENAME COLUMN',
            'Во время rolling-деплоя старый код продолжает обращаться к старому имени и падает',
            'RENAME COLUMN физически перезаписывает всю таблицу и занимает часы',
            'Django и Alembic не умеют генерировать такую операцию',
          ],
          correctIndex: 1,
          explanation: 'Сам по себе RENAME COLUMN в PostgreSQL мгновенный — меняются только метаданные. Проблема в процессе деплоя: пока новые поды поднимаются, старые ещё обслуживают трафик и шлют запросы со старым именем колонки — они начнут падать сразу после миграции. Поэтому переименование растягивают на несколько релизов: новая колонка, двойная запись, перенос данных, переключение чтения и лишь потом удаление старой.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Какая команда откатывает одну последнюю миграцию Alembic?',
          options: [
            'alembic rollback',
            'alembic downgrade -1',
            'alembic revert head',
            'alembic undo --last',
          ],
          correctIndex: 1,
          explanation: 'В Alembic движение по цепочке ревизий задаётся командами `upgrade` и `downgrade`; аргумент `-1` означает «на одну ревизию назад» — выполнится функция `downgrade()` последней применённой миграции. Можно указать и конкретную ревизию (`alembic downgrade 4a7e2b1c9f00`) или `base` для полного отката. Команд rollback, revert и undo в Alembic не существует.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Безопасное добавление NOT NULL колонки',
          description: 'Напишите миграцию Alembic, которая безопасно добавляет колонку `status` (text, NOT NULL) в большую таблицу `orders`. Порядок для деплоя без даунтайма: (1) добавить колонку nullable, (2) заполнить существующие строки значением `\'new\'`, (3) поставить `server_default` и NOT NULL. Функция `downgrade()` должна полностью откатывать изменение.',
          language: 'python',
          starterCode: `from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = "9f8e7d6c5b4a"


def upgrade() -> None:
    # шаг 1: колонка nullable
    # шаг 2: backfill существующих строк
    # шаг 3: default + NOT NULL
    ...


def downgrade() -> None:
    ...`,
          solution: `from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = "9f8e7d6c5b4a"


def upgrade() -> None:
    # 1. Добавляем колонку без NOT NULL — мгновенно, без блокировки
    op.add_column(
        "orders",
        sa.Column("status", sa.Text(), nullable=True),
    )

    # 2. Backfill существующих строк
    # (на очень больших таблицах — батчами отдельным скриптом)
    op.execute("UPDATE orders SET status = 'new' WHERE status IS NULL")

    # 3. Default для новых строк и запрет NULL
    op.alter_column(
        "orders",
        "status",
        nullable=False,
        server_default="new",
    )


def downgrade() -> None:
    op.drop_column("orders", "status")`,
          hints: [
            'Шаг 1 — `op.add_column("orders", sa.Column("status", sa.Text(), nullable=True))`: nullable-колонка добавляется мгновенно на любом размере таблицы.',
            'Backfill — это миграция данных: `op.execute("UPDATE orders SET status = \'new\' WHERE status IS NULL")`.',
            'Шаг 3 — `op.alter_column("orders", "status", nullable=False, server_default="new")`. Откат — просто `op.drop_column("orders", "status")`: он убирает и колонку, и все её ограничения.',
          ],
        },
      ],
    },
    {
      slug: 'orm',
      title: 'ORM',
      description: 'Django ORM и SQLAlchemy 2.0: ленивые QuerySet, annotate и aggregate, решение N+1 через select_related и prefetch_related, сырой SQL и анти-паттерны.',
      duration: 32,
      blocks: [
        {
          type: 'text',
          text: 'ORM (Object-Relational Mapping) — мост между объектами в коде и строками в таблицах: вместо конкатенации SQL-строк вы пишете `Book.objects.filter(price__lt=1000)`, получаете защиту от SQL-инъекций, типизацию и миграции в комплекте. Но у ORM есть цена: он **скрывает** запросы. Один невинный доступ к атрибуту в цикле — и вот уже 500 запросов на один HTTP-запрос, а страница грузится 6 секунд. Рабочее правило: ORM закрывает 95% CRUD-задач, но разработчик обязан уметь видеть SQL, который тот генерирует, — иначе ORM управляет вами, а не вы им.',
        },
        {
          type: 'heading',
          text: 'Django ORM: модели и ленивые QuerySet',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'catalog/models.py',
          code: `from django.db import models


class Author(models.Model):
    name = models.CharField(max_length=200)


class Book(models.Model):
    title = models.CharField(max_length=300)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    published = models.DateField()
    author = models.ForeignKey(
        Author,
        on_delete=models.PROTECT,      # аналог ON DELETE RESTRICT
        related_name="books",          # author.books.all()
    )

    class Meta:
        indexes = [
            models.Index(fields=["published"]),
        ]`,
        },
        {
          type: 'code',
          language: 'python',
          code: `from django.db.models import Avg, Count, Q

# QuerySet ЛЕНИВ: эти три строки не выполняют ни одного запроса —
# они только накапливают описание будущего SQL
books = Book.objects.filter(price__lt=1000)
books = books.exclude(published__year=2020)
books = books.order_by("-published")

# SQL выполнится здесь — при итерации
for book in books:
    print(book.title)

# annotate: вычисляемое поле для КАЖДОЙ строки (GROUP BY под капотом)
top_authors = (
    Author.objects
    .annotate(books_count=Count("books"))
    .filter(books_count__gt=3)
    .order_by("-books_count")
)

# aggregate: ОДНО значение по всему QuerySet, возвращает dict
stats = Book.objects.aggregate(avg_price=Avg("price"), total=Count("id"))
print(stats["avg_price"], stats["total"])

# Сложные условия — Q-объекты с | и &
cheap_or_old = Book.objects.filter(
    Q(price__lt=500) | Q(published__year__lt=2015)
)

# Посмотреть генерируемый SQL — привычка хорошего разработчика
print(cheap_or_old.query)`,
        },
        {
          type: 'note',
          variant: 'info',
          text: 'Ленивость — суперсила QuerySet: цепочка `.filter().exclude().order_by()` строит один SQL-запрос, а не три. Запрос выполняется при **итерации**, срезе, `list()`, `len()`, `bool()` и выводе в консоль. Отсюда два следствия: QuerySet можно безопасно собирать по условиям в несколько шагов, но повторное выполнение той же цепочки методов создаёт новый QuerySet и новый SQL-запрос. Сам объект QuerySet после первой полной итерации кэширует результат и повторно к базе не обращается; срезы и `len()`/`exists()` на неоценённом QuerySet этот кэш не наполняют.',
        },
        {
          type: 'heading',
          text: 'N+1: select_related и prefetch_related',
        },
        {
          type: 'code',
          language: 'python',
          code: `# ПЛОХО: 1 запрос за книгами + 100 запросов за авторами
for book in Book.objects.all()[:100]:
    print(book.author.name)          # каждый доступ — SELECT!

# select_related: JOIN в том же запросе.
# Для ForeignKey и OneToOne — «один к одному объекту»
for book in Book.objects.select_related("author")[:100]:
    print(book.author.name)          # 0 дополнительных запросов

# prefetch_related: ВТОРОЙ запрос с WHERE ... IN (id1, id2, ...)
# Для обратных FK и ManyToMany — «коллекция объектов»
for author in Author.objects.prefetch_related("books"):
    titles = [b.title for b in author.books.all()]   # без новых запросов

# Комбинируются свободно:
books = (
    Book.objects
    .select_related("author")
    .prefetch_related("author__books")
)`,
        },
        {
          type: 'table',
          headers: ['Критерий', 'select_related', 'prefetch_related'],
          rows: [
            ['SQL-стратегия', 'JOIN в основном запросе', 'Отдельный запрос с WHERE id IN (...) и склейка в Python'],
            ['Для каких связей', 'ForeignKey, OneToOne («родитель» строки)', 'ManyToMany, обратные FK (коллекции)'],
            ['Число запросов', '1', '1 + по одному на каждую связь'],
            ['Риск', 'Раздувание строк при цепочке JOIN', 'Большой IN-список при огромных выборках'],
          ],
        },
        {
          type: 'heading',
          text: 'SQLAlchemy 2.0: engine, session, select()',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'db.py',
          code: `from sqlalchemy import ForeignKey, create_engine, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, Session, mapped_column, relationship,
)

# engine — фабрика соединений с connection pool, один на приложение
engine = create_engine("postgresql+psycopg://app:secret@localhost/shop")


class Base(DeclarativeBase):
    pass


class Author(Base):
    __tablename__ = "authors"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    books: Mapped[list["Book"]] = relationship(back_populates="author")


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    author_id: Mapped[int] = mapped_column(ForeignKey("authors.id"))
    author: Mapped["Author"] = relationship(back_populates="books")


# Стиль 2.0: select() вместо легаси session.query()
with Session(engine) as session:
    stmt = (
        select(Book)
        .where(Book.title.ilike("%python%"))
        .order_by(Book.id)
        .limit(10)
    )
    books = session.execute(stmt).scalars().all()`,
        },
        {
          type: 'code',
          language: 'python',
          code: `from sqlalchemy import func, select, text
from sqlalchemy.orm import Session, selectinload

with Session(engine) as session:
    # Аналог prefetch_related — selectinload решает N+1 для коллекций
    stmt = select(Author).options(selectinload(Author.books))
    for author in session.execute(stmt).scalars():
        print(author.name, len(author.books))   # без новых запросов

    # Агрегация: авторы и число их книг
    stmt = (
        select(Author.name, func.count(Book.id).label("books_count"))
        .join(Book, Book.author_id == Author.id)
        .group_by(Author.name)
        .having(func.count(Book.id) > 3)
    )
    for name, books_count in session.execute(stmt):
        print(name, books_count)

    # Запись: session копит изменения и отправляет их на commit
    session.add(Author(name="Новый автор"))
    session.commit()

    # Сырой SQL, когда он честнее: параметры ВСЕГДА через bind,
    # никогда через f-строки — иначе SQL-инъекция
    rows = session.execute(
        text("SELECT id, title FROM books WHERE author_id = :aid"),
        {"aid": 42},
    )`,
        },
        {
          type: 'heading',
          text: 'Когда сырой SQL и анти-паттерны',
        },
        {
          type: 'list',
          items: [
            'Сложная аналитика: оконные функции, `GROUP BY` с десятком агрегатов — на SQL читается лучше, чем на ORM-DSL.',
            'Рекурсивные CTE (`WITH RECURSIVE`) для деревьев и графов — в ORM выражаются мучительно.',
            'Специфика PostgreSQL: тонкости `ON CONFLICT`, `DISTINCT ON`, операторы jsonb.',
            'Массовые операции: один `UPDATE ... WHERE` быстрее тысяч объектов через ORM.',
            'Инструменты: в Django — `Manager.raw()` и `connection.cursor()`, в SQLAlchemy — `text()`; параметры всегда через placeholders.',
          ],
        },
        {
          type: 'code',
          language: 'python',
          code: `# Анти-паттерн 1: запрос в цикле
books = []
for author_id in author_ids:
    books += list(Book.objects.filter(author_id=author_id))  # N запросов!
# Правильно — один запрос:
books = list(Book.objects.filter(author_id__in=author_ids))

# Анти-паттерн 2: тащим миллион объектов в память
titles = [b.title for b in Book.objects.all()]   # OOM на большой таблице
# Правильно — только нужные колонки или потоковая обработка:
titles = list(Book.objects.values_list("title", flat=True))
for book in Book.objects.iterator(chunk_size=2000):
    process(book)

# Анти-паттерн 3: считаем через len()
n = len(Book.objects.all())      # выгружает ВСЕ строки, чтобы посчитать
n = Book.objects.count()         # SELECT count(*) — правильно

# Анти-паттерн 4: обновление объектов в цикле
for book in Book.objects.filter(published__year__lt=2000):
    book.archived = True
    book.save()                  # UPDATE на каждую книгу
# Правильно — один UPDATE:
Book.objects.filter(published__year__lt=2000).update(archived=True)`,
        },
        {
          type: 'heading',
          text: 'Итоги',
        },
        {
          type: 'list',
          items: [
            'ORM даёт безопасность, типизацию и скорость разработки, но скрывает SQL — держите логирование запросов включённым в dev.',
            'QuerySet ленив: SQL выполняется при итерации, `list()`, `len()`, срезе — а не при `.filter()`.',
            '`annotate` добавляет вычисляемое поле каждой строке, `aggregate` возвращает одно значение по выборке.',
            'N+1 лечится `select_related` (JOIN, для FK/OneToOne) и `prefetch_related` (IN-запрос, для M2M и обратных FK).',
            'SQLAlchemy 2.0: один `engine` на приложение, короткоживущие `Session`, запросы через `select()` + `.scalars()`.',
            'Против N+1 в SQLAlchemy — `selectinload`; сырой SQL — через `text()` с bind-параметрами.',
            'Анти-паттерны: запросы в цикле, `.all()` на миллионе строк, `len()` вместо `count()`, `save()` в цикле вместо `update()`.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'В какой момент Django QuerySet выполняет SQL-запрос?',
          options: [
            'Сразу при вызове `.filter()` или `.exclude()`',
            'При итерации, срезе, вызове `list()`, `len()` или `bool()`',
            'В момент объявления модели',
            'Только при явном вызове `.execute()`',
          ],
          correctIndex: 1,
          explanation: 'QuerySet ленив: методы `.filter()`, `.exclude()`, `.order_by()` лишь накапливают описание запроса и возвращают новый QuerySet, не трогая базу. SQL уходит в БД только когда результат реально нужен — при итерации, материализации в `list()`, подсчёте `len()`, проверке `bool()` или выводе. Благодаря этому длинная цепочка условий превращается в один запрос, а не в серию. Метода `.execute()` у QuerySet нет.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Когда нужен `prefetch_related`, а не `select_related`?',
          options: [
            'Для ManyToMany-связей и обратных ForeignKey (коллекций объектов)',
            'Всегда — prefetch_related просто быстрее',
            'Для обычного ForeignKey, чтобы получить один связанный объект',
            'Когда таблица очень большая и JOIN не помещается в память',
          ],
          correctIndex: 0,
          explanation: '`select_related` работает через SQL JOIN и подходит, когда у строки один «родитель» — ForeignKey или OneToOne. Для коллекций (ManyToMany, обратные FK вроде `author.books`) JOIN размножил бы строки основного запроса, поэтому `prefetch_related` делает отдельный запрос с `WHERE id IN (...)` и склеивает результаты в Python. Выбор инструмента определяется типом связи, а не скоростью или размером таблицы.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Как в стиле SQLAlchemy 2.0 получить список объектов `User`?',
          options: [
            'users = session.query(User).all()',
            'users = session.execute(select(User)).scalars().all()',
            'users = User.objects.all()',
            'users = engine.fetch(User)',
          ],
          correctIndex: 1,
          explanation: 'Канонический стиль 2.0 — построить запрос через `select(User)`, выполнить его `session.execute()` и снять ORM-объекты через `.scalars()` (без него вернутся кортежи Row). `session.query()` — легаси-API из версии 1.x: он работает, но новый код на нём писать не рекомендуется. `User.objects` — это синтаксис Django ORM, а метода `engine.fetch` не существует.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Чиним N+1 в API каталога',
          description: 'Функция `book_list` строит JSON для каталога: 200 книг, у каждой — имя автора и список жанров (`genres` — ManyToMany). Сейчас она делает **401 запрос** к базе. Перепишите функцию так, чтобы запросов стало **3** (книги + JOIN автора, жанры одним IN-запросом), не меняя структуру ответа.',
          language: 'python',
          starterCode: `def book_list(request):
    data = []
    for book in Book.objects.all()[:200]:            # 1 запрос
        data.append({
            "title": book.title,
            "author": book.author.name,              # +1 запрос на книгу
            "genres": [g.name for g in book.genres.all()],  # +1 на книгу
        })
    return JsonResponse({"books": data})`,
          solution: `def book_list(request):
    books = (
        Book.objects
        .select_related("author")        # автор — FK: JOIN, 0 доп. запросов
        .prefetch_related("genres")      # жанры — M2M: один IN-запрос
    )[:200]

    data = []
    for book in books:                   # итого 3 запроса на всё
        data.append({
            "title": book.title,
            "author": book.author.name,             # из JOIN
            "genres": [g.name for g in book.genres.all()],  # из prefetch
        })
    return JsonResponse({"books": data})`,
          hints: [
            'Здесь два разных источника N+1: доступ к `book.author` (ForeignKey) и к `book.genres.all()` (ManyToMany). Каждому нужен свой инструмент.',
            'Для ForeignKey `author` используйте `select_related("author")` — автор приедет через JOIN в том же запросе, что и книги.',
            'Для ManyToMany `genres` используйте `prefetch_related("genres")` и стройте цепочку до среза: `Book.objects.select_related(...).prefetch_related(...)[:200]`. Внутри цикла `book.genres.all()` возьмёт данные из кэша prefetch.',
          ],
        },
      ],
    },
  ],
}
