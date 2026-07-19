import type { Problem } from '@/types/course'

// Сборник задач: Продвинутые темы, часть 1
export const problems: Problem[] = [
  {
    type: 'quiz',
    id: 'a1',
    difficulty: 'easy',
    question: 'Redis подключён с `decode_responses=True`. Выполнены команды: `r.set(\'counter\', \'10\')`, затем `r.incr(\'counter\')` и `r.incr(\'counter\', 5)`. Что выведет `print(r.get(\'counter\'))`?',
    options: [
      'Ошибка: INCR нельзя применять к значению, записанному через SET',
      '15',
      '16 — причём это строка, а не число',
      '16 — целое число int',
    ],
    correctIndex: 2,
    explanation: 'INCR работает со строками, которые содержат целое число: 10 + 1 + 5 = 16. Но Redis хранит всё как байты, и `GET` с `decode_responses=True` возвращает строку `\'16\'` — приводить к int нужно самому. Ошибки нет: SET строки с числом и последующий INCR — легальная комбинация.',
  },
  {
    type: 'code',
    id: 'a2',
    difficulty: 'easy',
    title: 'Профиль пользователя в Redis hash',
    description: 'Храните профиль пользователя в **hash** — так можно читать одно поле, не десериализуя весь объект. Напишите функцию `save_profile(user_id, profile)`, которая сохраняет словарь полей в ключ `profile:<user_id>` с TTL 1 час, и функцию `get_plan(user_id)`, которая возвращает только поле `plan` (или `None`, если профиля нет).',
    language: 'python',
    starterCode: `import redis

r = redis.Redis(decode_responses=True)

def save_profile(user_id: int, profile: dict) -> None:
    # TODO: сохраните все поля словаря в hash profile:<user_id>
    # и поставьте TTL 3600 секунд
    ...

def get_plan(user_id: int) -> str | None:
    # TODO: прочитайте ровно одно поле plan, не забирая весь hash
    ...`,
    solution: `import redis

r = redis.Redis(decode_responses=True)

def save_profile(user_id: int, profile: dict) -> None:
    key = f"profile:{user_id}"
    r.hset(key, mapping=profile)  # все поля одной командой
    r.expire(key, 3600)           # TTL вешается на весь ключ

def get_plan(user_id: int) -> str | None:
    # HGET читает одно поле — не тащим весь профиль по сети
    return r.hget(f"profile:{user_id}", "plan")`,
    hints: [
      'Для записи нескольких полей сразу у `hset` есть параметр `mapping=` — принимает словарь.',
      'TTL в Redis живёт на уровне ключа, а не поля: после `hset` вызовите `r.expire(key, 3600)`.',
      'Одно поле читается через `r.hget(key, "plan")` — вернётся `None`, если ключа или поля нет. `hgetall` здесь избыточен.',
    ],
  },
  {
    type: 'quiz',
    id: 'a3',
    difficulty: 'easy',
    question: 'Вам нужно считать уникальных посетителей страницы за день: один пользователь, зашедший 10 раз, учитывается один раз. Какая структура Redis решает задачу без логики на стороне приложения?',
    options: [
      'list — добавлять LPUSH и считать длину LLEN',
      'string со счётчиком INCR на каждый визит',
      'hash — поле на каждого посетителя со значением 1',
      'set — SADD для каждого визита и SCARD для подсчёта',
    ],
    correctIndex: 3,
    explanation: 'Set хранит только уникальные элементы: повторный `SADD` того же user_id ничего не меняет, а `SCARD` мгновенно отдаёт количество. List и INCR посчитают все визиты, включая повторные, а hash технически сработает, но это ручная имитация set с лишним расходом памяти на значения.',
  },
  {
    type: 'quiz',
    id: 'a4',
    difficulty: 'easy',
    question: 'Коллега ставит фоновую задачу так: `send_invoice.delay(order)`, передавая ORM-объект заказа целиком. Код работает на демо. В чём главная проблема этого решения?',
    options: [
      'Объект сериализуется в момент постановки задачи: воркер получит устаревшие данные, а после миграции схемы сообщение может вообще не десериализоваться',
      'Передача объекта работает только с брокером RabbitMQ, но не с Redis',
      'ORM-объекты нельзя сериализовать, поэтому задача упадёт сразу же',
      'Задача с объектом выполняется медленнее, потому что воркер должен переподключиться к БД',
    ],
    correctIndex: 0,
    explanation: 'Между постановкой задачи и её выполнением проходят секунды, а при заторе в очереди — часы: снапшот объекта в сообщении устаревает, и воркер работает с данными, которых уже нет в БД. Правильно передавать `order.id` и загружать объект внутри задачи. Сериализовать объект технически можно (потому демо и работает) — в этом и коварство.',
  },
  {
    type: 'code',
    id: 'a5',
    difficulty: 'easy',
    title: 'Первая задача Celery',
    description: 'Оформите отправку приветственного письма как фоновую задачу. Напишите задачу `send_welcome_email(user_id)`: она загружает пользователя из БД и вызывает `mailer.send(...)`. Затем в функции `register_user` поставьте задачу в очередь двумя способами: обычным вызовом «выполнить сейчас» и отложенным на 5 минут (письмо-напоминание `send_reminder_email`).',
    language: 'python',
    starterCode: `from celery import shared_task
from users.models import User

# TODO: оформите send_welcome_email как задачу Celery
def send_welcome_email(user_id: int) -> None:
    user = User.objects.get(pk=user_id)
    mailer.send(user.email, template="welcome")

@shared_task
def send_reminder_email(user_id: int) -> None:
    user = User.objects.get(pk=user_id)
    mailer.send(user.email, template="reminder")

def register_user(email: str) -> User:
    user = User.objects.create(email=email)
    # TODO: welcome — сразу, reminder — через 5 минут
    return user`,
    solution: `from celery import shared_task
from users.models import User

@shared_task
def send_welcome_email(user_id: int) -> None:
    # В задачу передаётся id: воркер сам читает свежие данные из БД
    user = User.objects.get(pk=user_id)
    mailer.send(user.email, template="welcome")

@shared_task
def send_reminder_email(user_id: int) -> None:
    user = User.objects.get(pk=user_id)
    mailer.send(user.email, template="reminder")

def register_user(email: str) -> User:
    user = User.objects.create(email=email)
    # delay — шорткат «в очередь прямо сейчас»
    send_welcome_email.delay(user.id)
    # apply_async с countdown — отложенный запуск через N секунд
    send_reminder_email.apply_async(args=[user.id], countdown=300)
    return user`,
    hints: [
      'Функция превращается в задачу декоратором `@shared_task` — после этого у неё появляются методы `.delay()` и `.apply_async()`.',
      '`send_welcome_email.delay(user.id)` кладёт задачу в очередь немедленно. Передавайте id, а не объект user.',
      'Для отложенного запуска используйте `apply_async(args=[user.id], countdown=300)` — 300 секунд это и есть 5 минут.',
    ],
  },
  {
    type: 'quiz',
    id: 'a6',
    difficulty: 'easy',
    question: 'Что такое offset в Kafka?',
    options: [
      'Количество сообщений, которые consumer ещё не успел прочитать',
      'Порядковый номер сообщения внутри партиции; каждый consumer хранит свою позицию чтения и может откатить её назад',
      'Уникальный идентификатор сообщения, сквозной для всего топика',
      'Задержка между записью сообщения продюсером и его доставкой потребителю',
    ],
    correctIndex: 1,
    explanation: 'Партиция — упорядоченный журнал, и offset — номер записи в нём. Kafka не удаляет сообщение после чтения: потребитель просто продвигает свой offset, а «перечитать историю» значит откатить его назад. Сквозного номера на весь топик нет — нумерация в каждой партиции своя, поэтому третий вариант неверен.',
  },
  {
    type: 'quiz',
    id: 'a7',
    difficulty: 'easy',
    question: 'Клиент отправил запрос с заголовками `Upgrade: websocket` и `Connection: Upgrade`. Какой статус-код вернёт сервер, если апгрейд соединения прошёл успешно?',
    options: [
      '101 Switching Protocols',
      '200 OK',
      '204 No Content',
      '301 Moved Permanently',
    ],
    correctIndex: 0,
    explanation: 'Статус 101 означает «переключаю протокол»: после этого ответа то же TCP-соединение перестаёт быть HTTP и начинает передавать WebSocket-фреймы. 200 OK вернул бы обычный ответ с телом и завершил цикл запрос-ответ — постоянного соединения не получилось бы.',
  },
  {
    type: 'code',
    id: 'a8',
    difficulty: 'easy',
    title: 'HTTP-ответ в формате SSE',
    description: 'Составьте «сырой» HTTP-ответ сервера, отдающего поток Server-Sent Events: статусная строка, заголовки `Content-Type: text/event-stream` и `Cache-Control: no-cache`, затем два события с JSON-данными (уведомления `order_shipped` и `bonus_added`) и один комментарий keep-alive между ними. Вспомните: чем событие отделяется от следующего и как выглядит строка-комментарий.',
    language: 'http',
    starterCode: `HTTP/1.1 200 OK
Content-Type: text/plain

# TODO: исправьте Content-Type, добавьте Cache-Control,
# запишите два события в формате SSE и комментарий keep-alive`,
    solution: `HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type": "order_shipped", "order_id": 1042}

: keep-alive

data: {"type": "bonus_added", "amount": 150}
`,
    hints: [
      'Тип содержимого потока SSE — `text/event-stream`; `Cache-Control: no-cache` запрещает прокси буферизовать поток.',
      'Каждое событие — строка вида `data: <текст>`, а завершается оно ПУСТОЙ строкой: два перевода строки подряд отделяют события друг от друга.',
      'Строка, начинающаяся с двоеточия (`: keep-alive`), — комментарий: клиентский EventSource его игнорирует, но «тихое» соединение не закрывается прокси.',
    ],
  },
  {
    type: 'quiz',
    id: 'a9',
    difficulty: 'easy',
    question: 'На странице «личный кабинет» показывается статус ежемесячного отчёта, который пересчитывается фоновой задачей раз в 10-15 минут. Каким способом доставлять обновления на клиент?',
    options: [
      'WebSocket — минимальная задержка доставки важна всегда',
      'SSE — у EventSource есть автоматический reconnect',
      'Обычный polling раз в минуту-две: данные меняются редко, постоянное соединение не окупается',
      'Long polling с таймаутом 10 минут',
    ],
    correctIndex: 2,
    explanation: 'Когда данные обновляются раз в десятки минут, стоимость поддержания тысяч постоянных соединений (память, heartbeat, reconnect-логика) не даёт ничего взамен: свежесть данных при polling раз в минуту практически та же. WebSocket и SSE оправданы при частых событиях, где задержка опроса реально заметна.',
  },
  {
    type: 'quiz',
    id: 'a10',
    difficulty: 'easy',
    question: 'Стартап из четырёх разработчиков начинает писать MVP маркетплейса. CTO предлагает сразу заложить микросервисную архитектуру: «потом мигрировать будет дороже». Какой ответ правильный?',
    options: [
      'CTO прав: переход от монолита к микросервисам всегда дороже, чем старт с микросервисов',
      'Начать с модульного монолита: границы доменов ещё будут меняться, а ошибка в границах сервисов стоит на порядок дороже ошибки в границах модулей',
      'Компромисс: начать с двух-трёх крупных сервисов и делить их дальше',
      'Микросервисы вообще не нужны командам меньше тысячи человек',
    ],
    correctIndex: 1,
    explanation: 'Пока продукт ищет product-market fit, домены перекраиваются каждый месяц — а перенос логики между сервисами означает смену API, схем БД и деплоя. Модульный монолит с явными интерфейсами модулей дешевле в жизни и дешевле в последующем распиле: границы уже проведены. Даже «всего 2-3 сервиса» сразу приносят сеть, распределённые транзакции и зоопарк инфраструктуры.',
  },
  {
    type: 'quiz',
    id: 'a11',
    difficulty: 'easy',
    question: 'Какую роль в микросервисной архитектуре играет API Gateway?',
    options: [
      'Хранит данные всех сервисов в единой базе, чтобы избежать дублирования',
      'Выполняет фоновые задачи, снимая нагрузку с воркеров',
      'Заменяет брокер сообщений, превращая события в синхронные вызовы',
      'Единая точка входа для клиентов: маршрутизация по сервисам, TLS, аутентификация, rate limiting, агрегация ответов',
    ],
    correctIndex: 3,
    explanation: 'Gateway прячет внутреннюю топологию: клиент ходит на один адрес, а маршрутизацию до нужного сервиса, проверку токенов и ограничение частоты запросов берёт на себя входная точка. С хранением данных и фоновыми задачами gateway не связан — это зоны ответственности БД сервисов и очередей.',
  },
  {
    type: 'code',
    id: 'a12',
    difficulty: 'easy',
    title: 'Топ медленных запросов PostgreSQL',
    description: 'Расширение `pg_stat_statements` уже включено. Напишите запрос, который выводит топ-5 самых медленных **в среднем** запросов: среднее время (`mean_exec_time`, округлённое до 2 знаков), число вызовов и первые 60 символов текста запроса. Отбросьте шум — запросы, которые вызывались меньше 100 раз.',
    language: 'sql',
    starterCode: `-- TODO: топ-5 запросов по среднему времени выполнения
-- колонки: mean_ms, calls, query (первые 60 символов)
-- фильтр: calls >= 100
SELECT
    ...
FROM pg_stat_statements`,
    solution: `SELECT
    round(mean_exec_time::numeric, 2) AS mean_ms,
    calls,
    left(query, 60)                   AS query
FROM pg_stat_statements
WHERE calls >= 100
ORDER BY mean_exec_time DESC
LIMIT 5;`,
    hints: [
      'Среднее время уже посчитано расширением — колонка `mean_exec_time` (в миллисекундах); сортируйте по ней по убыванию.',
      'Для округления приведите тип: `round(mean_exec_time::numeric, 2)` — без `::numeric` round с двумя аргументами не сработает на double precision.',
      'Обрезать текст запроса удобно функцией `left(query, 60)`, редкие запросы отсекает `WHERE calls >= 100`, а топ-5 — `ORDER BY ... DESC LIMIT 5`.',
    ],
  },
  {
    type: 'quiz',
    id: 'a13',
    difficulty: 'easy',
    question: 'Что выведет код: `value = r.get(\'no:such:key\')` и затем `print(value)` — если такого ключа в Redis нет?',
    options: [
      'None',
      'Пустая строка',
      'Будет выброшено исключение KeyError',
      'Строка \'nil\', как в redis-cli',
    ],
    correctIndex: 0,
    explanation: 'GET по отсутствующему ключу — штатная ситуация, а не ошибка: клиент Python возвращает `None`. Именно на этом строится cache-aside: `if cached is not None` отличает hit от miss. Ответ `(nil)` — это лишь то, как redis-cli отображает отсутствие значения в терминале.',
  },
  {
    type: 'quiz',
    id: 'a14',
    difficulty: 'easy',
    question: 'Сколько экземпляров процесса celery beat нужно запускать в продакшене?',
    options: [
      'По одному рядом с каждым воркером',
      'Столько же, сколько очередей в системе',
      'Ровно один на всю систему — иначе периодические задачи будут ставиться в очередь по несколько раз',
      'Минимум два, чтобы обеспечить отказоустойчивость',
    ],
    correctIndex: 2,
    explanation: 'Beat — планировщик: он не выполняет задачи, а кладёт их в очередь по расписанию. Два независимых beat не знают друг о друге, и каждый поставит задачу — она выполнится дважды. Отказоустойчивость решается быстрым перезапуском процесса (или распределённой блокировкой), а не вторым экземпляром.',
  },
  {
    type: 'code',
    id: 'a15',
    difficulty: 'easy',
    title: 'Кэш справочника категорий',
    description: 'Список категорий каталога меняется раз в неделю, а запрашивается на каждой странице. Напишите `get_categories()` по паттерну cache-aside: проверить ключ `catalog:categories`, при промахе выполнить `db.fetch_categories()` (возвращает список словарей), положить в кэш с TTL 1 час и вернуть. И `invalidate_categories()` — вызывается после редактирования категорий в админке.',
    language: 'python',
    starterCode: `import json
import redis

r = redis.Redis(decode_responses=True)
KEY = "catalog:categories"
TTL = 3600

def get_categories() -> list[dict]:
    # TODO: cache-aside: кэш -> при промахе БД -> записать с TTL
    ...

def invalidate_categories() -> None:
    # TODO: сброс кэша после изменения категорий
    ...`,
    solution: `import json
import redis

r = redis.Redis(decode_responses=True)
KEY = "catalog:categories"
TTL = 3600

def get_categories() -> list[dict]:
    cached = r.get(KEY)
    if cached is not None:          # cache hit
        return json.loads(cached)

    categories = db.fetch_categories()   # cache miss: идём в БД
    r.set(KEY, json.dumps(categories), ex=TTL)
    return categories

def invalidate_categories() -> None:
    # Удаляем, а не перезаписываем: следующий запрос сам наполнит кэш
    r.delete(KEY)`,
    hints: [
      'Сначала `r.get(KEY)`: список хранится как JSON-строка, поэтому при hit верните `json.loads(cached)`.',
      'При промахе получите данные из `db.fetch_categories()` и запишите: `r.set(KEY, json.dumps(categories), ex=TTL)`.',
      'Инвалидация — это `r.delete(KEY)`: удаление атомарно, а свежие данные в кэш положит первый же следующий `get_categories()`.',
    ],
  },
  {
    type: 'quiz',
    id: 'a16',
    difficulty: 'easy',
    question: 'Топик `orders` читают два сервиса: warehouse с `group.id=warehouse` и analytics с `group.id=analytics`. Как распределятся сообщения?',
    options: [
      'Сообщения поделятся между сервисами примерно поровну',
      'Каждый сервис получит все сообщения топика — группы независимы и читают каждый в своём темпе',
      'Все сообщения получит тот сервис, который подписался первым',
      'Kafka вернёт ошибку: на один топик может подписаться только одна consumer group',
    ],
    correctIndex: 1,
    explanation: 'Партиции делятся между потребителями только ВНУТРИ одной группы. Разные группы — это разные независимые читатели журнала, каждая со своими offsets: warehouse и analytics обработают весь поток целиком, не мешая друг другу. Именно это отличает лог событий от классической очереди задач.',
  },
  {
    type: 'quiz',
    id: 'a17',
    difficulty: 'easy',
    question: 'Найдите проблему: для подсчёта активных сессий на проде выполняется `len(r.keys(\'session:*\'))` при нескольких миллионах ключей в Redis.',
    options: [
      'Проблемы нет: KEYS — обычная команда чтения',
      'Паттерн со звёздочкой в KEYS не поддерживается — нужен точный ключ',
      'KEYS возвращает максимум 10 000 ключей, результат будет неполным',
      'KEYS перебирает все ключи, блокируя однопоточный Redis; на проде нужен курсорный SCAN или отдельный счётчик',
    ],
    correctIndex: 3,
    explanation: 'Redis обрабатывает команды в одном потоке: пока KEYS сканирует миллионы ключей, все остальные клиенты ждут — латентность кэша взлетает на сотни миллисекунд. SCAN обходит ключи порциями по курсору, не блокируя сервер; а ещё лучше держать счётчик сессий отдельным ключом (INCR/DECR).',
  },
  {
    type: 'code',
    id: 'a18',
    difficulty: 'easy',
    title: 'Ответ 429 от rate limiter',
    description: 'API ограничивает клиентов: 100 запросов в минуту. Составьте HTTP-ответ для клиента, превысившего лимит: правильный статус-код, заголовок с числом секунд до следующей попытки, информационные заголовки `X-RateLimit-Limit` и `X-RateLimit-Remaining`, и краткое JSON-тело с описанием ошибки.',
    language: 'http',
    starterCode: `HTTP/1.1 200 OK
Content-Type: application/json

# TODO: статус-код превышения лимита, Retry-After,
# X-RateLimit-заголовки и JSON-тело ошибки`,
    solution: `HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 42
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0

{"error": "rate_limit_exceeded", "detail": "Retry after 42 seconds"}`,
    hints: [
      'Для превышения лимита существует отдельный статус-код — 429 Too Many Requests (не 403 и не 503).',
      'Заголовок `Retry-After: 42` сообщает, через сколько секунд можно повторить: хорошие клиенты и SDK учитывают его в backoff.',
      '`X-RateLimit-Limit: 100` — потолок окна, `X-RateLimit-Remaining: 0` — остаток; тело — короткий JSON с машиночитаемым кодом ошибки.',
    ],
  },
  {
    type: 'quiz',
    id: 'a19',
    difficulty: 'medium',
    question: 'Найдите ошибку: `def update_user(user_id, data): db.update_user(user_id, data); r.set(f\'user:{user_id}\', json.dumps(data), ex=300)` — обновляем БД и сразу кладём свежее значение в кэш.',
    options: [
      'Гонка с параллельными записями: другой процесс мог обновить БД позже, но записать в кэш раньше — кэш «застынет» с устаревшими данными; надёжнее удалить ключ',
      'Ошибка в TTL: при обновлении кэша ex указывать нельзя',
      'Ошибки нет — это корректная инвалидация через перезапись',
      'Нужно сначала обновить кэш, а потом БД, иначе читатели увидят старые данные',
    ],
    correctIndex: 0,
    explanation: 'Два конкурентных update-а могут выполниться в БД в одном порядке, а дойти до Redis в обратном — и в кэше до конца TTL останется проигравшая, устаревшая версия. `DELETE` ключа такой гонки не имеет: кто бы ни удалил последним, следующий читатель возьмёт из БД актуальные данные. Порядок «сначала кэш, потом БД» ещё хуже: при сбое БД кэш будет врать.',
  },
  {
    type: 'code',
    id: 'a20',
    difficulty: 'medium',
    title: 'Sliding window rate limiter',
    description: 'Fixed window пропускает всплеск на границе окон: 100 запросов в 59-ю секунду и ещё 100 в 61-ю. Реализуйте `is_allowed(user_id, limit, window)` на **sorted set**: score и значение элемента — текущий timestamp; перед проверкой удалите из множества всё старше окна; запрос разрешён, если элементов меньше limit. Все команды — одним pipeline, ключу поставьте TTL.',
    language: 'python',
    starterCode: `import time
import redis

r = redis.Redis(decode_responses=True)

def is_allowed(user_id: int, limit: int = 100, window: int = 60) -> bool:
    now = time.time()
    key = f"rate:sw:{user_id}"
    # TODO: удалить устаревшие элементы, добавить текущий запрос,
    # посчитать размер окна, поставить TTL — одним pipeline
    ...`,
    solution: `import time
import redis

r = redis.Redis(decode_responses=True)

def is_allowed(user_id: int, limit: int = 100, window: int = 60) -> bool:
    now = time.time()
    key = f"rate:sw:{user_id}"

    pipe = r.pipeline()
    # 1. Выкинуть запросы старше окна: score < now - window
    pipe.zremrangebyscore(key, 0, now - window)
    # 2. Записать текущий запрос: уникальное значение, score = время
    pipe.zadd(key, {f"{now}:{id(object())}": now})
    # 3. Сколько запросов осталось в окне
    pipe.zcard(key)
    # 4. Ключ неактивного пользователя умрёт сам
    pipe.expire(key, window * 2)
    _, _, count, _ = pipe.execute()

    return count <= limit`,
    hints: [
      'Sorted set с score = timestamp превращает «окно за последние 60 секунд» в диапазон score: устаревшее удаляет `zremrangebyscore(key, 0, now - window)`.',
      'Добавьте текущий запрос через `zadd` (значение должно быть уникальным — иначе два запроса в один timestamp схлопнутся) и посчитайте окно через `zcard`.',
      'Соберите zremrangebyscore, zadd, zcard и expire в один `r.pipeline()` — одна сетевая поездка; результат `zcard` — третий элемент списка `pipe.execute()`, сравните его с limit.',
    ],
  },
  {
    type: 'quiz',
    id: 'a21',
    difficulty: 'medium',
    question: 'Воркер Celery с настройками по умолчанию (`acks_late=False`) взял из очереди задачу генерации отчёта и был убит OOM-killer посреди выполнения. Что произойдёт с задачей?',
    options: [
      'Брокер заметит смерть воркера и сразу отдаст задачу другому',
      'Задача вернётся в очередь по истечении task_time_limit',
      'Ничего: сообщение было подтверждено (ack) в момент получения, брокер его уже удалил — задача потеряна',
      'Задача перезапустится автоматически, потому что у Celery гарантия at-least-once по умолчанию',
    ],
    correctIndex: 2,
    explanation: 'По умолчанию Celery подтверждает сообщение при получении, до выполнения — умерший воркер уносит задачу с собой. `acks_late=True` переносит ack на момент после выполнения: тогда брокер отдаст незавершённую задачу другому воркеру, но за это придётся платить идемпотентностью — задача может выполниться дважды.',
  },
  {
    type: 'code',
    id: 'a22',
    difficulty: 'medium',
    title: 'Ручной retry с учётом Retry-After',
    description: 'Внешний API отвечает `429` c заголовком `Retry-After`, и повторять запрос раньше указанного срока бессмысленно — автоматический backoff тут не подходит. Напишите задачу `fetch_partner_prices(sku)` c `bind=True`: при статусе 429 она перезапускает себя через `self.retry` с countdown из заголовка (по умолчанию 60), при сетевых ошибках — стандартный retry c backoff; максимум 5 попыток.',
    language: 'python',
    starterCode: `import requests
from celery import shared_task

API_URL = "https://partner.example.com/api/prices"

@shared_task  # TODO: bind, autoretry для сетевых ошибок, max_retries
def fetch_partner_prices(sku: str) -> dict:
    resp = requests.get(API_URL, params={"sku": sku}, timeout=10)
    # TODO: обработайте 429 через self.retry с countdown из Retry-After
    resp.raise_for_status()
    return resp.json()`,
    solution: `import requests
from celery import shared_task

API_URL = "https://partner.example.com/api/prices"

@shared_task(
    bind=True,                    # первый аргумент задачи — self
    autoretry_for=(requests.ConnectionError, requests.Timeout),
    retry_backoff=True,           # сетевые сбои: 1с, 2с, 4с...
    max_retries=5,
)
def fetch_partner_prices(self, sku: str) -> dict:
    resp = requests.get(API_URL, params={"sku": sku}, timeout=10)

    if resp.status_code == 429:
        # Сервер сам сказал, когда приходить — уважаем его, а не backoff
        delay = int(resp.headers.get("Retry-After", 60))
        raise self.retry(countdown=delay)

    resp.raise_for_status()
    return resp.json()`,
    hints: [
      '`@shared_task(bind=True)` делает первым параметром задачи `self` — только через него доступен ручной `self.retry(...)`.',
      'Значение задержки берите из ответа: `int(resp.headers.get("Retry-After", 60))` — заголовка может не быть, нужен дефолт.',
      '`self.retry(countdown=delay)` выбрасывает специальное исключение — пишите `raise self.retry(...)`, чтобы выполнение задачи гарантированно прервалось. Сетевые ошибки отдайте `autoretry_for` с `retry_backoff=True`.',
    ],
  },
  {
    type: 'quiz',
    id: 'a23',
    difficulty: 'medium',
    question: 'В топике `payments` 3 партиции. Обработка не успевает, и вы масштабируете consumer group с 3 до 5 инстансов. Насколько вырастет пропускная способность чтения?',
    options: [
      'Примерно в 5/3 раза — сообщения распределятся по всем пятерым',
      'Никак: партиция назначается целиком одному участнику группы, три потребителя получат по партиции, а два будут простаивать',
      'Вырастет вдвое: Kafka автоматически создаст две новые партиции',
      'Вырастет, но только если увеличить replication factor до 5',
    ],
    correctIndex: 1,
    explanation: 'Число партиций — жёсткий потолок параллелизма группы: партиция читается ровно одним участником, делить её между двумя нельзя. Лишние потребители останутся в резерве. Партиции сами не создаются, а replication factor — про отказоустойчивость хранения, не про параллелизм чтения. Поэтому партиции планируют с запасом заранее.',
  },
  {
    type: 'code',
    id: 'a24',
    difficulty: 'medium',
    title: 'Публикация события с конвертом',
    description: 'Событие — контракт между сервисами, и публиковать «голый» payload нельзя. Напишите функцию `publish_event(event_type, user_id, payload)`: она оборачивает данные в конверт с полями `event_id` (uuid4), `event_type`, `occurred_at` (UTC, ISO 8601), `version: 1` и `payload`; публикует его в топик `events` с ключом партиционирования `user_id` и callback-ом, логирующим ошибку доставки.',
    language: 'python',
    starterCode: `import json
import uuid
from datetime import datetime, timezone
from confluent_kafka import Producer

producer = Producer({"bootstrap.servers": "localhost:9092"})

def delivery_report(err, msg):
    if err is not None:
        log.error("delivery failed: %s", err)

def publish_event(event_type: str, user_id: int, payload: dict) -> None:
    # TODO: соберите конверт события и опубликуйте его
    # с ключом user_id и callback=delivery_report
    ...`,
    solution: `import json
import uuid
from datetime import datetime, timezone
from confluent_kafka import Producer

producer = Producer({"bootstrap.servers": "localhost:9092"})

def delivery_report(err, msg):
    if err is not None:
        log.error("delivery failed: %s", err)

def publish_event(event_type: str, user_id: int, payload: dict) -> None:
    envelope = {
        "event_id": str(uuid.uuid4()),      # для дедупликации у потребителей
        "event_type": event_type,
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "version": 1,                       # эволюция схемы — только добавление полей
        "payload": payload,
    }
    producer.produce(
        topic="events",
        # события одного пользователя попадут в одну партицию — порядок сохранён
        key=str(user_id),
        value=json.dumps(envelope).encode(),
        callback=delivery_report,
    )
    producer.poll(0)   # дать библиотеке обработать callbacks доставки`,
    hints: [
      'Конверт — обычный dict: `event_id` — это `str(uuid.uuid4())`, время — `datetime.now(timezone.utc).isoformat()`, а `version` начинается с 1.',
      'В `producer.produce` передайте `topic`, `key=str(user_id)` (ключ управляет партицией и порядком событий пользователя), `value=json.dumps(envelope).encode()` — Kafka принимает байты.',
      'Не забудьте `callback=delivery_report` и вызов `producer.poll(0)` после produce — иначе callbacks доставки не будут обработаны, и об ошибках вы не узнаете.',
    ],
  },
  {
    type: 'quiz',
    id: 'a25',
    difficulty: 'medium',
    question: 'В `pg_stat_statements` лидер по суммарному времени — запрос `SELECT * FROM products WHERE id = $1`: mean_exec_time всего 0.3 мс, но 80 000 вызовов за последний час. Что это и как лечить?',
    options: [
      'Тяжёлый запрос: нужен составной индекс на products',
      'Недостаточный размер connection pool — соединения открываются на каждый запрос',
      'Нормальная картина: 0.3 мс — отличное время, оптимизировать нечего',
      'Классический N+1: запрос дёргается в цикле по одному id; лечится select_related/prefetch_related или одним запросом с WHERE id IN (...)',
    ],
    correctIndex: 3,
    explanation: 'Сигнатура N+1 — именно такая: каждый вызов молниеносный, но их десятки тысяч, и в сумме они съедают больше всех. Индекс по id уже есть (потому и 0.3 мс), а проблема в количестве round-trip до БД: список товаров надо загружать одним запросом, а связанные объекты — через select_related/prefetch_related.',
  },
  {
    type: 'code',
    id: 'a26',
    difficulty: 'medium',
    title: 'Поиск кандидатов на N+1',
    description: 'Напишите SQL-запрос по `pg_stat_statements`, который находит вероятные N+1: запросы с большим числом вызовов (`calls > 10000`), быстрые поштучно (`mean_exec_time < 1` мс), но заметные в сумме. Выведите calls, суммарное время в секундах (округлённое до 1 знака), среднее число строк на вызов (rows / calls, 2 знака) и первые 70 символов запроса; отсортируйте по суммарному времени.',
    language: 'sql',
    starterCode: `-- TODO: кандидаты на N+1 из pg_stat_statements
-- условия: calls > 10000 AND mean_exec_time < 1
-- колонки: calls, total_s, rows_per_call, query
SELECT
    ...`,
    solution: `SELECT
    calls,
    round((total_exec_time / 1000)::numeric, 1) AS total_s,
    round((rows::numeric / calls), 2)           AS rows_per_call,
    left(query, 70)                             AS query
FROM pg_stat_statements
WHERE calls > 10000
  AND mean_exec_time < 1
ORDER BY total_exec_time DESC;`,
    hints: [
      'Профиль N+1 в статистике: огромный `calls` при крошечном `mean_exec_time` — оба условия идут в WHERE.',
      '`total_exec_time` хранится в миллисекундах: секунды — это `total_exec_time / 1000`, для round приведите к `::numeric`.',
      'Среднее число строк: `rows::numeric / calls` (без приведения будет целочисленное деление, и 0.98 превратится в 0). У N+1 оно обычно около 1 — запрос тянет по одной записи.',
    ],
  },
  {
    type: 'quiz',
    id: 'a27',
    difficulty: 'medium',
    question: 'Чат на FastAPI работал на одном инстансе. После масштабирования до четырёх за балансировщиком сообщения стали доходить только до части участников комнаты. В чём причина и каково решение?',
    options: [
      'ConnectionManager хранит соединения в памяти своего процесса: участники на разных инстансах друг друга не видят; нужна общая шина — например, Redis pub/sub между инстансами',
      'Балансировщик не поддерживает WebSocket — нужно вернуться к одному инстансу',
      'Объекты WebSocket нужно сохранять в Redis, чтобы любой инстанс мог отправить в них сообщение',
      'Клиенты обязаны устанавливать по соединению с каждым из четырёх инстансов',
    ],
    correctIndex: 0,
    explanation: 'Балансировщик разводит подключения по инстансам, и broadcast каждого инстанса видит только своих локальных клиентов. Решение — оставить соединения локальными, а сообщения гнать через общую шину: каждый инстанс публикует в канал Redis и рассылает полученное своим подключениям. Сам объект соединения в Redis не положишь — это живой TCP-сокет, а не данные.',
  },
  {
    type: 'code',
    id: 'a28',
    difficulty: 'medium',
    title: 'Идемпотентный POST с Idempotency-Key',
    description: 'Платёжный API должен переживать ретраи клиентов: повторный POST с тем же ключом идемпотентности не списывает деньги дважды. Составьте две пары запрос-ответ: первый `POST /api/charges` с заголовком `Idempotency-Key` и JSON-телом — сервер отвечает `201` и создаёт платёж; повторный точно такой же запрос (клиент не дождался ответа и повторил) — сервер возвращает сохранённый результат со статусом `200` и тем же `charge_id`, не создавая новый платёж.',
    language: 'http',
    starterCode: `POST /api/charges HTTP/1.1
Host: pay.example.com
Content-Type: application/json

{"amount": "4990.00", "currency": "RUB"}

# TODO: добавьте Idempotency-Key, ответ 201,
# затем повторный запрос и ответ 200 с тем же charge_id`,
    solution: `POST /api/charges HTTP/1.1
Host: pay.example.com
Content-Type: application/json
Idempotency-Key: 9f1c1d2e-5a44-4b8b-9c1a-2f6f0a1b3c4d

{"amount": "4990.00", "currency": "RUB"}

HTTP/1.1 201 Created
Content-Type: application/json

{"charge_id": "ch_10428", "status": "succeeded"}

POST /api/charges HTTP/1.1
Host: pay.example.com
Content-Type: application/json
Idempotency-Key: 9f1c1d2e-5a44-4b8b-9c1a-2f6f0a1b3c4d

{"amount": "4990.00", "currency": "RUB"}

HTTP/1.1 200 OK
Content-Type: application/json

{"charge_id": "ch_10428", "status": "succeeded"}`,
    hints: [
      'Ключ идемпотентности — uuid, который генерирует КЛИЕНТ и присылает в заголовке `Idempotency-Key`; при ретрае ключ обязан остаться тем же.',
      'Первый запрос создаёт ресурс — статус `201 Created`; сервер сохраняет результат, привязав его к ключу.',
      'Повторный запрос с известным ключом не выполняет списание заново: сервер отдаёт сохранённый ответ — тот же `charge_id`, статус `200 OK`. Именно так работают Stripe и другие платёжные API.',
    ],
  },
  {
    type: 'quiz',
    id: 'a29',
    difficulty: 'medium',
    question: 'Команда выбирает между saga-оркестрацией и хореографией для сценария оформления заказа из шести шагов. Какое сравнение верно?',
    options: [
      'Хореография требует двухфазного коммита, оркестрация обходится без него',
      'Оркестратор держит весь сценарий в одном месте и упрощает отладку, но становится дополнительным компонентом; хореография снижает связность, зато сценарий размазан по сервисам и его труднее отлаживать',
      'Оркестрация работает только синхронно по REST, хореография — только через события',
      'Хореография даёт exactly-once, оркестрация — только at-least-once',
    ],
    correctIndex: 1,
    explanation: 'Это трейдофф «явный сценарий против слабой связности». С оркестратором последовательность шагов и компенсаций читается в одном файле, но появляется координирующий компонент. В хореографии сервисы просто реагируют на события друг друга — связность ниже, но чтобы понять сценарий из шести шагов, придётся собирать его по кусочкам из шести сервисов. 2PC и гарантии доставки тут ни при чём.',
  },
  {
    type: 'code',
    id: 'a30',
    difficulty: 'medium',
    title: 'Параллельные запросы с ограничением',
    description: 'Нужно опросить 200 URL внешнего API. Последовательно — минуты, все разом — API забанит. Напишите асинхронную функцию `fetch_all(urls, max_concurrent=10)`: она выполняет GET-запросы через `httpx.AsyncClient` с таймаутом 5 секунд, держит не больше 10 одновременных запросов через `asyncio.Semaphore` и возвращает список JSON-ответов; упавшие запросы не роняют остальные — вместо результата кладётся `None`.',
    language: 'python',
    starterCode: `import asyncio
import httpx

async def fetch_all(urls: list[str], max_concurrent: int = 10) -> list:
    # TODO: semaphore на max_concurrent, общий AsyncClient
    # с таймаутом 5с, gather по всем URL, ошибки -> None
    ...`,
    solution: `import asyncio
import httpx

async def fetch_all(urls: list[str], max_concurrent: int = 10) -> list:
    semaphore = asyncio.Semaphore(max_concurrent)

    async def fetch_one(client: httpx.AsyncClient, url: str):
        async with semaphore:          # не больше 10 запросов одновременно
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPError:
                return None            # сбой одного URL не роняет остальные

    # Один клиент на все запросы: переиспользует соединения (keep-alive)
    async with httpx.AsyncClient(timeout=5.0) as client:
        tasks = [fetch_one(client, url) for url in urls]
        return await asyncio.gather(*tasks)`,
    hints: [
      'Создайте `asyncio.Semaphore(max_concurrent)` и захватывайте его внутри вспомогательной корутины: `async with semaphore:` — лишние задачи будут ждать у входа.',
      'Клиент создаётся один на все запросы: `async with httpx.AsyncClient(timeout=5.0) as client` — так переиспользуются TCP-соединения. Таймаут задаётся прямо в конструкторе.',
      'Соберите корутины в список и выполните `await asyncio.gather(*tasks)` — порядок результатов совпадёт с порядком urls. Ошибки ловите внутри `fetch_one` (`except httpx.HTTPError: return None`), тогда gather не понадобится обвешивать return_exceptions.',
    ],
  },
]

