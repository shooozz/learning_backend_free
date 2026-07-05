import type { Course } from '@/types/course'

export const advancedCourse: Course = {
  slug: 'advanced',
  order: 5,
  title: 'Продвинутые темы',
  description: 'Кэширование, очереди, микросервисы и оптимизация производительности.',
  level: 'Продвинутый',
  image: '/img-5.jpg',
  tags: ['Redis', 'Celery', 'Kafka'],
  lessons: [
    {
      slug: 'redis-caching',
      title: 'Redis и кэширование',
      description: 'Латентность, структуры данных Redis, паттерн cache-aside, инвалидация, защита от cache stampede и rate limiting.',
      duration: 30,
      blocks: [
        { type: 'text', text: 'Типичная история: страница каталога делает 12 SQL-запросов, под рекламной кампанией трафик вырастает в 20 раз, PostgreSQL захлёбывается, и сайт лежит. При этом 95% этих запросов возвращают одни и те же данные — список категорий, который меняется раз в неделю. Кэш в **Redis** превращает 400 мс ответа в 15 мс и снимает с БД почти всю читающую нагрузку. В этом уроке разберём, как кэшировать правильно: паттерн cache-aside, инвалидацию, защиту от cache stampede и бонусом — rate limiting. Но сначала — порядки величин, из которых складывается весь выигрыш.' },
        { type: 'table', headers: ['Операция', 'Типичная латентность'], rows: [
          ['Чтение из RAM', '~100 нс'],
          ['GET из Redis (в той же сети)', '0.1–0.5 мс'],
          ['SELECT по индексу в PostgreSQL', '1–5 мс'],
          ['Сложный JOIN по большим таблицам', '50–500 мс'],
          ['HTTP-запрос к внешнему API', '100–1000 мс'],
        ] },
        { type: 'heading', text: 'Структуры данных Redis' },
        { type: 'table', headers: ['Структура', 'Ключевые команды', 'Типичное применение'], rows: [
          ['string', 'GET, SET, INCR', 'Кэш сериализованных объектов, счётчики, rate limiting'],
          ['hash', 'HGET, HSET, HGETALL', 'Объект с полями: читаем одно поле без десериализации всего'],
          ['list', 'LPUSH, LRANGE, LTRIM', 'Лента последних событий, простая очередь'],
          ['set', 'SADD, SISMEMBER, SCARD', 'Уникальные посетители, теги, чёрные списки'],
          ['sorted set', 'ZADD, ZRANGE, ZINCRBY', 'Leaderboard, задачи с приоритетом, топ-N за период'],
        ] },
        { type: 'code', language: 'python', filename: 'structures.py', code: `import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

# String: счётчик просмотров
r.incr("page:views:42")

# Hash: профиль пользователя, поля читаются по отдельности
r.hset("user:42", mapping={"name": "Alice", "plan": "pro"})
plan = r.hget("user:42", "plan")

# List: последние 100 событий ленты
r.lpush("feed:42", "order_created")
r.ltrim("feed:42", 0, 99)

# Set: уникальные посетители за день
r.sadd("visitors:2026-07-06", "user:42")
unique = r.scard("visitors:2026-07-06")

# Sorted set: leaderboard
r.zadd("leaderboard", {"alice": 1250, "bob": 980})
top10 = r.zrevrange("leaderboard", 0, 9, withscores=True)` },
        { type: 'heading', text: 'Паттерн cache-aside и TTL' },
        { type: 'code', language: 'python', filename: 'cache_aside.py', code: `import json
import redis

r = redis.Redis(decode_responses=True)
TTL = 300  # 5 минут: даже без инвалидации кэш не протухнет навсегда

def get_user(user_id: int) -> dict:
    key = f"user:{user_id}"
    cached = r.get(key)
    if cached is not None:            # cache hit
        return json.loads(cached)

    user = db.fetch_user(user_id)     # cache miss: идём в БД
    r.set(key, json.dumps(user), ex=TTL)
    return user

def update_user(user_id: int, data: dict) -> None:
    db.update_user(user_id, data)
    r.delete(f"user:{user_id}")       # инвалидация: удаляем, а не обновляем` },
        { type: 'text', text: 'Приложение само управляет кэшем: читает Redis, при промахе идёт в БД и кладёт результат обратно с **TTL**. При записи ключ **удаляют**, а не перезаписывают новым значением: удаление атомарно и не гонится с параллельными читателями. Инвалидация — знаменитая «одна из двух сложных проблем в CS»: ключей может касаться несколько сценариев записи, данные меняются в обход приложения (миграции, админка, другой сервис), а забытый сценарий означает, что пользователи видят устаревшие данные до истечения TTL. Поэтому TTL ставят всегда, даже при событийной инвалидации — это страховка.' },
        { type: 'note', variant: 'warning', text: 'Cache stampede: у горячего ключа истёк TTL — и тысяча параллельных запросов одновременно промахивается и бежит в БД выполнять один и тот же тяжёлый запрос. БД получает лавину нагрузки именно в тот момент, когда кэш перестал её защищать. Лечится блокировкой (только один пересчитывает), фоновым обновлением до истечения TTL или probabilistic early expiration.' },
        { type: 'code', language: 'python', filename: 'stampede_lock.py', code: `import json
import time

def get_report(report_id: int) -> dict:
    key = f"report:{report_id}"
    cached = r.get(key)
    if cached is not None:
        return json.loads(cached)

    lock_key = f"lock:{key}"
    # SET NX атомарен: блокировку получит только один процесс
    if r.set(lock_key, "1", nx=True, ex=10):
        try:
            report = build_expensive_report(report_id)  # ~2 секунды
            r.set(key, json.dumps(report), ex=600)
            return report
        finally:
            r.delete(lock_key)

    # Остальные ждут и перечитывают кэш вместо похода в БД
    for _ in range(50):
        time.sleep(0.1)
        cached = r.get(key)
        if cached is not None:
            return json.loads(cached)
    raise TimeoutError("cache is still empty after 5s")` },
        { type: 'heading', text: 'Rate limiting и сессии' },
        { type: 'code', language: 'python', filename: 'rate_limit.py', code: `import json
import time

def is_allowed(user_id: int, limit: int = 100, window: int = 60) -> bool:
    """Fixed window: не больше limit запросов за window секунд."""
    bucket = int(time.time()) // window
    key = f"rate:{user_id}:{bucket}"

    pipe = r.pipeline()               # одна сетевая поездка, атомарно
    pipe.incr(key)
    pipe.expire(key, window * 2)      # ключ удалится сам
    count, _ = pipe.execute()
    return count <= limit

# Сессии: значение с TTL, продлеваем при активности
r.setex(f"session:{token}", 3600, json.dumps({"user_id": 42}))` },
        { type: 'text', text: 'Схема `INCR` + `EXPIRE` — стандартный fixed-window rate limiter: счётчик на пользователя и окно времени, ключ умирает сам. Для более ровного ограничения используют sliding window на sorted set. Пара слов о персистентности: **RDB** периодически снимает снапшот всего датасета (быстрый рестарт, но теряются последние минуты), **AOF** пишет каждую команду в лог (режим `everysec` теряет максимум секунду). Для кэша персистентность часто вообще отключают — данные восстановимы из БД.' },
        { type: 'list', items: [
          'Не храните в Redis единственную копию критичных данных — это кэш и вспомогательное хранилище, а не замена PostgreSQL.',
          'Не кладите большие блобы (файлы, изображения, мегабайтные JSON): память дорогая, а большие значения блокируют однопоточный event loop Redis.',
          'Не используйте `KEYS *` в продакшене — команда блокирует сервер; для обхода ключей есть `SCAN`.',
          'Не кэшируйте то, что читается реже, чем меняется: hit rate будет нулевым, а сложность инвалидации останется.',
        ] },
        { type: 'heading', text: 'Итоги' },
        { type: 'list', items: [
          'Кэш нужен, потому что Redis отвечает за доли миллисекунды, а тяжёлые SQL-запросы — за сотни.',
          'Выбирайте структуру под задачу: hash для объектов, sorted set для рейтингов, set для уникальности.',
          'Cache-aside: читаем кэш, при промахе — БД, кладём результат с TTL; при записи ключ удаляем.',
          'TTL ставим всегда: это страховка от забытых сценариев инвалидации.',
          'От cache stampede защищаемся блокировкой SET NX или фоновым прогревом.',
          '`INCR` + `EXPIRE` дают простой и быстрый rate limiter.',
        ] },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Нужен leaderboard: топ-10 игроков по очкам с быстрым обновлением счёта. Какая структура Redis подходит лучше всего?',
          options: ['list', 'hash', 'sorted set', 'set'],
          correctIndex: 2,
          explanation: 'Sorted set хранит элементы вместе с числовым score и держит их отсортированными: ZINCRBY обновляет счёт за O(log N), ZREVRANGE мгновенно отдаёт топ-N. List и set не упорядочены по значению, а hash потребовал бы сортировать всё на стороне приложения.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Что такое cache stampede?',
          options: [
            'Переполнение памяти Redis из-за ключей без TTL',
            'Потеря данных кэша при перезапуске Redis без персистентности',
            'Рассинхронизация кэша и БД после UPDATE без инвалидации',
            'Лавина одновременных запросов к БД после истечения горячего ключа кэша',
          ],
          correctIndex: 3,
          explanation: 'Пока горячий ключ жив, он принимает на себя тысячи чтений. Как только TTL истекает, все эти запросы одновременно промахиваются и бегут выполнять один и тот же тяжёлый запрос к БД. Защита — блокировка SET NX, чтобы пересчитывал только один процесс, или обновление кэша до истечения TTL.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Как работает паттерн cache-aside?',
          options: [
            'Приложение пишет только в кэш, а кэш асинхронно сбрасывает данные в БД',
            'Приложение читает кэш, при промахе само читает БД и кладёт результат в кэш',
            'Кэш-слой прозрачно подгружает данные из БД при промахе, приложение о БД не знает',
            'Каждая запись синхронно идёт и в кэш, и в БД',
          ],
          correctIndex: 1,
          explanation: 'В cache-aside именно приложение управляет кэшем: проверить ключ, при промахе сходить в БД, положить результат с TTL. Первый вариант описывает write-behind, третий — read-through, четвёртый — write-through: это другие стратегии со своими трейдоффами.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Декоратор redis_cache',
          description: 'Напишите декоратор `redis_cache(ttl)`, который кэширует результат функции (dict, сериализуемый в JSON) по паттерну cache-aside. Ключ собирается из имени функции и аргументов, например `cache:get_user:42`. При повторном вызове с теми же аргументами функция не должна выполняться — результат берётся из Redis.',
          language: 'python',
          starterCode: `import json
from functools import wraps
import redis

r = redis.Redis(decode_responses=True)

def redis_cache(ttl: int):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # TODO: соберите ключ, проверьте кэш,
            # при промахе вызовите func и сохраните результат с TTL
            ...
        return wrapper
    return decorator

@redis_cache(ttl=300)
def get_user(user_id: int) -> dict:
    print("going to DB...")
    return {"id": user_id, "name": "Alice"}`,
          solution: `import json
from functools import wraps
import redis

r = redis.Redis(decode_responses=True)

def redis_cache(ttl: int):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            parts = [func.__name__]
            parts += [str(a) for a in args]
            parts += [f"{k}={v}" for k, v in sorted(kwargs.items())]
            key = "cache:" + ":".join(parts)

            cached = r.get(key)
            if cached is not None:          # cache hit
                return json.loads(cached)

            result = func(*args, **kwargs)  # cache miss
            r.set(key, json.dumps(result), ex=ttl)
            return result
        return wrapper
    return decorator

@redis_cache(ttl=300)
def get_user(user_id: int) -> dict:
    print("going to DB...")
    return {"id": user_id, "name": "Alice"}`,
          hints: [
            'Соберите ключ из `func.__name__` и аргументов: `cache:get_user:42`. Пары kwargs отсортируйте, чтобы ключ был стабильным при любом порядке передачи.',
            'Сначала `r.get(key)`: если значение не None — это cache hit, верните `json.loads(cached)` без вызова функции.',
            'При промахе вызовите `func(*args, **kwargs)`, сохраните через `r.set(key, json.dumps(result), ex=ttl)` и верните результат.',
          ],
        },
      ],
    },
    {
      slug: 'celery',
      title: 'Celery и фоновые задачи',
      description: 'Выносим тяжёлую работу из request/response цикла: брокер, воркеры, retry с backoff, идемпотентность и celery beat.',
      duration: 28,
      blocks: [
        { type: 'text', text: 'Пользователь оформляет заказ, а обработчик запроса синхронно шлёт письмо через SMTP, генерирует PDF-счёт и дёргает CRM. Ответ занимает 4 секунды, а когда SMTP-сервер падает — пользователь получает 500 на **оплаченный** заказ. Правило: в request/response цикле остаётся только то, без чего нельзя ответить. Всё остальное — письма, PDF, синхронизации, обработка изображений — уходит в фоновые задачи. Стандарт де-факто в Python для этого — **Celery**.' },
        { type: 'heading', text: 'Архитектура: брокер, воркеры, result backend' },
        { type: 'text', text: 'Схема из трёх частей. Приложение сериализует вызов задачи в сообщение и кладёт его в **брокер** (Redis или RabbitMQ). Отдельные процессы-**воркеры** забирают сообщения и выполняют задачи — их можно запускать на других машинах и масштабировать независимо от веб-приложения. **Result backend** (опционально) хранит результаты и статусы задач. Для большинства проектов Redis в роли брокера — практичный выбор: он уже есть в инфраструктуре для кэша.' },
        { type: 'code', language: 'python', filename: 'proj/celery.py', code: `import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "proj.settings")

app = Celery("proj")
app.conf.update(
    broker_url="redis://localhost:6379/0",
    result_backend="redis://localhost:6379/1",
    task_acks_late=True,           # ack после выполнения, а не при получении
    worker_prefetch_multiplier=1,  # не резервировать пачку задач заранее
    task_time_limit=300,           # жёсткий лимит: зависшая задача убивается
)
app.autodiscover_tasks()

# Запуск: celery -A proj worker -l info --concurrency=4` },
        { type: 'heading', text: 'Задачи и способы их вызова' },
        { type: 'code', language: 'python', filename: 'orders/tasks.py', code: `from celery import shared_task
from orders.models import Order

@shared_task
def send_order_email(order_id: int) -> None:
    # Передали id, а не объект: воркер читает свежие данные из БД
    order = Order.objects.select_related("user").get(pk=order_id)
    mailer.send(order.user.email, template="order_confirmed", order=order)

# Простой вызов из view:
send_order_email.delay(order.id)

# Полный контроль через apply_async:
send_order_email.apply_async(
    args=[order.id],
    countdown=60,       # выполнить через минуту
    queue="emails",     # отдельная очередь со своими воркерами
    expires=3600,       # устаревшую задачу не выполнять вовсе
)` },
        { type: 'table', headers: ['Вызов', 'Что делает'], rows: [
          ['task.delay(x, y)', 'Шорткат: положить задачу в очередь прямо сейчас'],
          ['task.apply_async(args, countdown=60)', 'Отложенный запуск через N секунд'],
          ['task.apply_async(args, queue="emails")', 'Маршрутизация в отдельную очередь'],
          ['task.apply_async(args, eta=datetime)', 'Запуск не раньше конкретного момента'],
          ['result.get(timeout=5)', 'Дождаться результата (в вебе почти никогда не нужно)'],
        ] },
        { type: 'heading', text: 'Retry с backoff и идемпотентность' },
        { type: 'code', language: 'python', filename: 'crm/tasks.py', code: `import requests
from celery import shared_task

@shared_task(
    autoretry_for=(requests.RequestException,),
    retry_backoff=True,       # задержки 1с, 2с, 4с, 8с...
    retry_backoff_max=600,
    retry_jitter=True,        # случайный разброс против thundering herd
    max_retries=5,
    acks_late=True,
)
def sync_to_crm(order_id: int) -> None:
    order = Order.objects.get(pk=order_id)
    if order.crm_synced:      # идемпотентность: повтор ничего не сломает
        return
    resp = requests.post(CRM_URL, json=order.as_payload(), timeout=10)
    resp.raise_for_status()
    order.crm_synced = True
    order.save(update_fields=["crm_synced"])` },
        { type: 'text', text: 'Celery с `acks_late=True` даёт гарантию **at-least-once**: если воркер умер посреди задачи, брокер отдаст её другому воркеру. Значит, любая задача может выполниться дважды — и обязана быть **идемпотентной**. Приёмы: проверка статуса перед работой (как выше), уникальные ограничения в БД, idempotency key при вызовах внешних API. Списывать деньги или слать письмо без такой проверки — верный способ сделать это дважды.' },
        { type: 'note', variant: 'warning', text: 'Главные грабли Celery: передавать в задачу ORM-объект или большой словарь вместо id. Объект сериализуется в момент постановки задачи и к моменту выполнения уже устарел (а после смены схемы БД может вообще не десериализоваться). Передавайте `order.id`, а объект загружайте внутри задачи из БД.' },
        { type: 'heading', text: 'Периодические задачи: celery beat' },
        { type: 'code', language: 'python', filename: 'proj/celery.py', code: `from celery.schedules import crontab

app.conf.beat_schedule = {
    "cleanup-expired-carts": {
        "task": "orders.tasks.cleanup_expired_carts",
        "schedule": crontab(minute=0, hour=3),  # каждый день в 03:00
    },
    "refresh-exchange-rates": {
        "task": "billing.tasks.refresh_rates",
        "schedule": 300.0,                      # каждые 5 минут
    },
}

# Запуск отдельным процессом (ровно одним!):
# celery -A proj beat -l info` },
        { type: 'text', text: 'Beat — планировщик: отдельный процесс, который по расписанию кладёт задачи в очередь, а выполняют их обычные воркеры. Запускайте ровно один экземпляр beat, иначе задачи будут дублироваться. Для наблюдения за всем этим хозяйством есть **Flower** (`celery -A proj flower`): веб-интерфейс со списком воркеров, историей задач, временем выполнения и ошибками. В продакшене к нему добавляют алерты на рост очереди — распухшая очередь значит, что воркеры не справляются.' },
        { type: 'heading', text: 'Итоги' },
        { type: 'list', items: [
          'В request/response цикле остаётся только то, без чего нельзя ответить; остальное — в фоновые задачи.',
          'Архитектура Celery: приложение кладёт сообщение в брокер, воркеры выполняют, result backend хранит статусы.',
          'Передавайте в задачи id, а не объекты: воркер загрузит свежие данные из БД.',
          'Гарантия at-least-once означает возможные повторы: каждая задача должна быть идемпотентной.',
          '`autoretry_for` + `retry_backoff` + `retry_jitter` — стандартный набор для устойчивых задач с внешними API.',
          'Celery beat запускается в одном экземпляре; мониторинг — Flower плюс алерты на длину очереди.',
        ] },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Какой компонент архитектуры Celery хранит статусы и результаты выполненных задач?',
          options: ['Брокер сообщений', 'Воркер', 'Result backend', 'Celery beat'],
          correctIndex: 2,
          explanation: 'Брокер хранит очередь ещё не выполненных сообщений, воркеры выполняют задачи, beat ставит их по расписанию. А результаты и статусы (SUCCESS, FAILURE, RETRY) пишутся именно в result backend — отдельное хранилище, часто другая база Redis.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Почему задачи Celery должны быть идемпотентными?',
          options: [
            'Celery выполняет каждую задачу ровно один раз, идемпотентность лишь ускоряет повторы',
            'Гарантия at-least-once: после сбоя воркера или ретрая задача может выполниться повторно, и повтор не должен ломать данные',
            'Идемпотентность нужна только периодическим задачам celery beat',
            'Без идемпотентности воркеры не могут обрабатывать задачи параллельно',
          ],
          correctIndex: 1,
          explanation: 'С acks_late и ретраями одно и то же сообщение может быть обработано больше одного раза — это фундаментальное свойство at-least-once доставки, а не баг. Поэтому задача обязана давать тот же результат при повторе: проверять статус, использовать уникальные ключи, idempotency key для внешних API.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Устойчивая задача оплаты',
          description: 'Напишите задачу `process_payment(payment_id)`: она читает `Payment` из БД, отправляет запрос платёжному шлюзу и помечает платёж выполненным. Требования: автоматический retry с экспоненциальным backoff при сетевых ошибках (`requests.RequestException`, до 5 попыток), идемпотентность — повторный запуск уже завершённого платежа ничего не делает, шлюзу передаётся idempotency key.',
          language: 'python',
          starterCode: `import requests
from celery import shared_task
from payments.models import Payment

GATEWAY_URL = "https://gateway.example.com/api/charge"

@shared_task  # TODO: добавьте параметры retry
def process_payment(payment_id: int) -> None:
    # TODO: загрузите платёж, проверьте статус,
    # вызовите шлюз, пометьте платёж выполненным
    ...`,
          solution: `import requests
from celery import shared_task
from payments.models import Payment

GATEWAY_URL = "https://gateway.example.com/api/charge"

@shared_task(
    autoretry_for=(requests.RequestException,),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
    max_retries=5,
    acks_late=True,
)
def process_payment(payment_id: int) -> None:
    payment = Payment.objects.get(pk=payment_id)

    if payment.status == "completed":
        return  # идемпотентность: повтор ничего не ломает

    resp = requests.post(
        GATEWAY_URL,
        json={
            "amount": str(payment.amount),
            "currency": payment.currency,
            "idempotency_key": str(payment.uuid),
        },
        timeout=15,
    )
    resp.raise_for_status()  # 5xx вызовет RequestException и retry

    payment.status = "completed"
    payment.save(update_fields=["status"])`,
          hints: [
            'В задачу передаётся `payment_id`, а объект загружается внутри — воркер всегда видит свежий статус из БД.',
            '`autoretry_for=(requests.RequestException,)` вместе с `retry_backoff=True` и `retry_jitter=True` дают повторы с растущей задержкой без ручного `self.retry()`.',
            'Идемпотентность из двух частей: до вызова шлюза проверьте `payment.status == "completed"` и выйдите; самому шлюзу передайте `idempotency_key`, чтобы и он не списал деньги дважды.',
          ],
        },
      ],
    },
    {
      slug: 'kafka',
      title: 'Kafka и очереди сообщений',
      description: 'Event-driven архитектура: топики, партиции, offsets, consumer groups и реальные гарантии доставки.',
      duration: 32,
      blocks: [
        { type: 'text', text: 'Сервис заказов после оформления должен уведомить склад, начислить бонусы, отправить письмо и записать событие в аналитику. Если делать это прямыми HTTP-вызовами, сервис заказов знает обо всех потребителях, падает вместе с любым из них и требует правок при появлении каждого нового. **Event-driven** подход переворачивает схему: заказы публикуют факт «заказ создан», а кто и как на него реагирует — не их забота. Хребет такой архитектуры чаще всего — **Apache Kafka**: распределённый журнал событий (commit log), который переживает терабайты и сотни тысяч сообщений в секунду.' },
        { type: 'heading', text: 'Kafka vs Celery vs RabbitMQ' },
        { type: 'table', headers: ['Инструмент', 'Модель', 'Когда выбирать'], rows: [
          ['Celery + Redis', 'Очередь задач: задача выполняется воркером и исчезает', 'Фоновая работа одного приложения: письма, PDF, синхронизации'],
          ['RabbitMQ', 'Брокер сообщений: гибкая маршрутизация, приоритеты, TTL сообщений', 'Сложный роутинг между сервисами, RPC-паттерны, когда история не нужна'],
          ['Kafka', 'Распределённый лог: события хранятся и перечитываются', 'Поток событий для многих потребителей, аналитика, интеграция сервисов, история'],
        ] },
        { type: 'text', text: 'Это **разные инструменты, а не конкуренты**. Celery отвечает на вопрос «выполни эту работу когда-нибудь скоро», Kafka — «вот факт, узнайте о нём все, кому интересно». Сообщение в очереди задач исчезает после обработки; событие в Kafka лежит весь срок retention, и новый потребитель может прочитать историю с начала. В зрелой системе часто есть и то и другое: Kafka для событий между сервисами, Celery для фоновых задач внутри сервиса.' },
        { type: 'heading', text: 'Topics, партиции, offsets и consumer groups' },
        { type: 'text', text: '**Topic** — именованный поток событий (`orders`, `payments`). Топик разбит на **партиции** — независимые упорядоченные журналы, и именно партиции дают горизонтальное масштабирование: их можно разложить по разным брокерам. Каждое сообщение в партиции имеет **offset** — порядковый номер. Kafka не удаляет сообщение после чтения: каждый потребитель просто помнит свой offset, и «прочитать заново» значит откатить offset назад. Retention настраивается по времени или размеру: например, хранить события 7 дней.' },
        { type: 'code', language: 'python', filename: 'producer.py', code: `import json
from confluent_kafka import Producer

producer = Producer({"bootstrap.servers": "localhost:9092"})

def delivery_report(err, msg):
    if err is not None:
        log.error("delivery failed: %s", err)

event = {
    "event_type": "order.created",
    "order_id": 1042,
    "user_id": 7,
    "total": "4990.00",
}

producer.produce(
    topic="orders",
    key=str(event["user_id"]),        # ключ партиционирования
    value=json.dumps(event).encode(),
    callback=delivery_report,
)
producer.flush()  # дождаться подтверждения от брокера` },
        { type: 'code', language: 'python', filename: 'consumer.py', code: `import json
from confluent_kafka import Consumer

consumer = Consumer({
    "bootstrap.servers": "localhost:9092",
    "group.id": "warehouse-service",   # consumer group
    "auto.offset.reset": "earliest",   # новой группе — читать с начала
    "enable.auto.commit": False,       # offset коммитим сами
})
consumer.subscribe(["orders"])

while True:
    msg = consumer.poll(timeout=1.0)
    if msg is None:
        continue
    if msg.error():
        log.error(msg.error())
        continue

    event = json.loads(msg.value())
    reserve_stock(event["order_id"])           # обработка
    consumer.commit(msg, asynchronous=False)   # commit после обработки` },
        { type: 'text', text: '**Consumer group** — команда потребителей с общим `group.id`: Kafka распределяет партиции между её участниками, и каждое сообщение получает ровно один участник группы. Разные группы независимы: `warehouse-service` и `analytics-service` читают один топик каждый в своём темпе. Порядок гарантируется **только внутри партиции**. Сообщения с одинаковым ключом попадают в одну партицию — поэтому ключ выбирают так, чтобы связанные события шли по порядку: ключ `user_id` гарантирует, что события одного пользователя не перегонят друг друга, но глобального порядка между пользователями нет.' },
        { type: 'note', variant: 'warning', text: 'Число партиций — потолок параллелизма: в группе не может быть больше активных потребителей, чем партиций в топике (лишние будут простаивать). А увеличение числа партиций задним числом ломает распределение ключей: события одного пользователя окажутся в разных партициях. Планируйте партиции с запасом заранее.' },
        { type: 'heading', text: 'Гарантии доставки: реалистичный взгляд' },
        { type: 'text', text: '**At-most-once**: коммитим offset до обработки — при сбое сообщение теряется, зато нет дублей. **At-least-once**: коммитим после обработки (как в примере выше) — ничего не теряем, но при падении между обработкой и коммитом получим дубль. **Exactly-once** Kafka обеспечивает транзакциями только внутри своей экосистемы (Kafka Streams, чтение и запись в Kafka); как только появляется внешняя система — БД, платёжный шлюз, e-mail — честного exactly-once не существует. Практичный рецепт: at-least-once на доставке плюс **идемпотентная обработка** с дедупликацией по `event_id`. Отдельный плюс лога: retention позволяет новому сервису или починенному после бага потребителю **перечитать историю** — откатить offset и обработать события заново.' },
        { type: 'code', language: 'json', filename: 'order.created.json', code: `{
  "event_type": "order.created",
  "event_id": "9f1c1d2e-5a44-4b8b-9c1a-2f6f0a1b3c4d",
  "occurred_at": "2026-07-06T12:30:00Z",
  "version": 1,
  "payload": {
    "order_id": 1042,
    "user_id": 7,
    "items": [{ "sku": "AB-100", "qty": 2 }],
    "total": "4990.00"
  }
}` },
        { type: 'text', text: 'Событие — это **контракт** между сервисами, поэтому у него есть схема и дисциплина изменений. Минимум: `event_id` (uuid для дедупликации), `event_type`, `occurred_at`, `version` и полезная нагрузка. В командах побольше схемы описывают в Avro или JSON Schema и регистрируют в **Schema Registry**, которая не даст опубликовать несовместимое изменение. Правило эволюции: поля можно добавлять, но нельзя удалять и менять тип — потребители со старым кодом должны продолжать работать.' },
        { type: 'heading', text: 'Итоги' },
        { type: 'list', items: [
          'Event-driven: продюсер публикует факт и не знает потребителей; связность системы падает.',
          'Kafka — распределённый лог с retention, Celery — очередь задач, RabbitMQ — гибкий брокер: инструменты для разных задач.',
          'Топик состоит из партиций; порядок гарантирован только внутри партиции, управляется ключом.',
          'Consumer group делит партиции между участниками; число партиций — потолок параллелизма.',
          'Реалистичная стратегия: at-least-once + идемпотентный потребитель с дедупликацией по event_id.',
          'События — контракт: версионируйте схему и меняйте её только обратно-совместимо.',
        ] },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Где Kafka гарантирует порядок сообщений?',
          options: [
            'Во всём топике независимо от числа партиций',
            'Между всеми топиками одного брокера',
            'Только внутри одной партиции; сообщения с одним ключом попадают в одну партицию',
            'Внутри consumer group независимо от партиций',
          ],
          correctIndex: 2,
          explanation: 'Партиция — упорядоченный журнал, и только в её пределах offsets задают порядок. Между партициями порядка нет, поэтому ключ партиционирования выбирают так, чтобы события, которым важен взаимный порядок (например, события одного пользователя), попадали в одну партицию.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'В чём принципиальное отличие Kafka от Celery?',
          options: [
            'Kafka — распределённый лог: события хранятся весь retention и их можно перечитать; Celery — очередь задач: сообщение исчезает после выполнения',
            'Kafka быстрее выполняет фоновые задачи, чем Celery',
            'Kafka написана на Scala и поэтому надёжнее',
            'Celery не умеет повторять задачи, а Kafka умеет',
          ],
          correctIndex: 0,
          explanation: 'Это разные модели: очередь задач отвечает «выполни работу», лог событий — «вот факт для всех заинтересованных». В Kafka несколько независимых групп читают один поток, а новый потребитель может прочитать историю с начала — очередь задач такого не умеет. Скорость и язык реализации тут ни при чём, retry есть в обоих.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Идемпотентный consumer',
          description: 'Напишите потребителя топика `payments` для сервиса биллинга. Требования: гарантия at-least-once (ручной commit offset строго после обработки), дедупликация по `event_id` через Redis (ключ с TTL сутки, помечать только ПОСЛЕ успешной обработки), обработка — вызов `apply_payment(event["payload"])` один раз на уникальное событие.',
          language: 'python',
          starterCode: `import json
from confluent_kafka import Consumer
import redis

r = redis.Redis(decode_responses=True)

consumer = Consumer({
    "bootstrap.servers": "localhost:9092",
    "group.id": "billing-service",
    "auto.offset.reset": "earliest",
    # TODO: настройте коммит offset
})
consumer.subscribe(["payments"])

# TODO: цикл poll, дедупликация по event_id, commit после обработки`,
          solution: `import json
from confluent_kafka import Consumer
import redis

r = redis.Redis(decode_responses=True)

consumer = Consumer({
    "bootstrap.servers": "localhost:9092",
    "group.id": "billing-service",
    "auto.offset.reset": "earliest",
    "enable.auto.commit": False,   # сами решаем, когда offset обработан
})
consumer.subscribe(["payments"])

while True:
    msg = consumer.poll(timeout=1.0)
    if msg is None:
        continue
    if msg.error():
        log.error(msg.error())
        continue

    event = json.loads(msg.value())
    event_id = event["event_id"]
    # партицию внутри группы читает один consumer, гонки exists/set нет
    if not r.exists(f"processed:{event_id}"):
        apply_payment(event["payload"])    # бизнес-логика
        # помечаем ТОЛЬКО после успешной обработки: если упадём раньше,
        # offset не закоммичен — событие перечитается и обработается снова
        r.set(f"processed:{event_id}", "1", ex=86400)

    # commit после обработки: at-least-once без потерь
    consumer.commit(msg, asynchronous=False)`,
          hints: [
            'Отключите `enable.auto.commit` и вызывайте `consumer.commit(msg)` только после успешной обработки — если воркер упадёт раньше, сообщение прочитается снова.',
            'At-least-once означает возможные дубли. Помечайте обработанные события в Redis: ключ `processed:<event_id>` с TTL.',
            'Порядок критичен: сначала проверка `r.exists(f"processed:{event_id}")`, потом `apply_payment`, и только ПОСЛЕ успешной обработки — `r.set(..., ex=86400)` и commit. Если пометить событие до обработки и упасть между ними, при перечитывании оно будет пропущено — платёж молча потеряется. Редкий дубль в окне «обработал, но не успел пометить» — нормальная плата за at-least-once.',
          ],
        },
      ],
    },
    {
      slug: 'websockets',
      title: 'WebSockets',
      description: 'Real-time поверх HTTP: handshake, WebSocket в FastAPI, масштабирование через Redis pub/sub и SSE как альтернатива.',
      duration: 28,
      blocks: [
        { type: 'text', text: 'Чат, курс валют, статус доставки, совместное редактирование — везде сервер должен сообщать клиенту о событиях **в момент их появления**. HTTP так не умеет: связь всегда инициирует клиент. Классический костыль — polling: опрашивать API каждые 2 секунды. При 10 000 открытых вкладок это 5 000 RPS впустую, ведь в 99% ответов ничего нового. **WebSocket** решает проблему: одно постоянное двунаправленное соединение, по которому обе стороны шлют сообщения когда угодно.' },
        { type: 'heading', text: 'Handshake: Upgrade из HTTP' },
        { type: 'text', text: 'WebSocket начинается как обычный HTTP-запрос — поэтому он проходит через те же порты 80/443, прокси и балансировщики. Клиент присылает заголовок `Upgrade: websocket`, сервер отвечает статусом `101 Switching Protocols`, и с этого момента то же TCP-соединение говорит уже по протоколу WebSocket: фреймы вместо запросов и ответов, без повторных заголовков и рукопожатий.' },
        { type: 'code', language: 'http', filename: 'handshake.http', code: `GET /ws/chat/42 HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=` },
        { type: 'heading', text: 'WebSocket в FastAPI' },
        { type: 'code', language: 'python', filename: 'echo.py', code: `from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws/echo")
async def echo(ws: WebSocket):
    await ws.accept()                      # завершить handshake
    try:
        while True:
            data = await ws.receive_text()  # ждём сообщение клиента
            await ws.send_text(f"echo: {data}")
    except WebSocketDisconnect:
        pass                                # клиент закрыл соединение` },
        { type: 'code', language: 'python', filename: 'chat.py', code: `from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

class ConnectionManager:
    def __init__(self) -> None:
        self.rooms: dict[str, set[WebSocket]] = {}

    async def connect(self, room: str, ws: WebSocket) -> None:
        await ws.accept()
        self.rooms.setdefault(room, set()).add(ws)

    def disconnect(self, room: str, ws: WebSocket) -> None:
        self.rooms.get(room, set()).discard(ws)

    async def broadcast(self, room: str, message: str) -> None:
        dead = []
        # Снимок множества: пока корутина ждёт send_text, другая может
        # изменить rooms — итерация по «живому» set упадёт с RuntimeError
        for ws in list(self.rooms.get(room, ())):
            try:
                await ws.send_text(message)
            except RuntimeError:            # соединение уже закрыто
                dead.append(ws)
        for ws in dead:
            self.disconnect(room, ws)

manager = ConnectionManager()

@app.websocket("/ws/chat/{room}")
async def chat(ws: WebSocket, room: str):
    await manager.connect(room, ws)
    try:
        while True:
            text = await ws.receive_text()
            await manager.broadcast(room, text)
    except WebSocketDisconnect:
        manager.disconnect(room, ws)` },
        { type: 'text', text: 'В Django та же задача решается через **Django Channels**: ASGI-приложение, классы-consumers вместо views и **channel layer** (обычно на Redis) для передачи сообщений между процессами. Идея та же, что и у `ConnectionManager`, но групповая рассылка (`group_send`) из коробки работает между несколькими серверами.' },
        { type: 'heading', text: 'Масштабирование и надёжность' },
        { type: 'text', text: '`ConnectionManager` из примера хранит соединения в памяти процесса — а в продакшене за балансировщиком крутится 4 инстанса, и участники одной комнаты подключены к разным. Решение — **Redis pub/sub**: каждый инстанс подписан на канал комнаты; получив сообщение от своего клиента, он публикует его в Redis, а все инстансы рассылают своим локальным подключениям. Так соединения остаются локальными, а шина событий — общей.' },
        { type: 'note', variant: 'tip', text: 'Соединения рвутся молча: NAT и балансировщики убивают «тихие» TCP-сессии. Настройте heartbeat — ping/pong кадры раз в 20-30 секунд (в uvicorn есть `--ws-ping-interval`), и клиентский reconnect с экспоненциальной задержкой и повторной подпиской на нужные каналы. Считайте разрыв соединения нормой, а не аварией.' },
        { type: 'heading', text: 'SSE как простая альтернатива' },
        { type: 'text', text: '**Server-Sent Events** — односторонний поток событий от сервера поверх обычного HTTP (`Content-Type: text/event-stream`). Не нужен Upgrade, работает через любые прокси, в браузере есть `EventSource` с автоматическим reconnect из коробки. Если клиент только **получает** обновления (уведомления, лента, прогресс задачи), а команды отправляет обычными POST-запросами — SSE проще и надёжнее. WebSocket оправдан, когда нужен настоящий двунаправленный обмен с низкой задержкой: чат, игры, совместное редактирование. И честно: если данные обновляются раз в минуту, хватит и обычного polling.' },
        { type: 'table', headers: ['Критерий', 'Polling', 'SSE', 'WebSocket'], rows: [
          ['Направление', 'клиент → сервер', 'только сервер → клиент', 'двунаправленный'],
          ['Задержка доставки', 'до интервала опроса', 'мгновенно', 'мгновенно'],
          ['Reconnect', 'не нужен', 'встроен в EventSource', 'пишем сами'],
          ['Инфраструктура', 'обычный HTTP', 'обычный HTTP', 'нужна поддержка Upgrade везде'],
          ['Типичный случай', 'редкие обновления', 'уведомления, прогресс, лента', 'чат, игры, совместное редактирование'],
        ] },
        { type: 'heading', text: 'Итоги' },
        { type: 'list', items: [
          'HTTP не умеет пушить с сервера; polling расточителен при частых обновлениях и множестве клиентов.',
          'WebSocket начинается с HTTP-запроса Upgrade и ответа 101, дальше — постоянное двунаправленное соединение.',
          'В FastAPI: `accept`, цикл `receive`/`send`, обработка `WebSocketDisconnect`; рассылка — через ConnectionManager.',
          'Несколько инстансов объединяются шиной Redis pub/sub (в Django Channels это channel layer).',
          'Heartbeat и клиентский reconnect обязательны: разрыв соединения — норма.',
          'Если поток данных односторонний — начните с SSE; WebSocket только для настоящего двунаправленного обмена.',
        ] },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Как устанавливается WebSocket-соединение?',
          options: [
            'Отдельным бинарным протоколом поверх TCP без участия HTTP',
            'Обычным HTTP-запросом с заголовком Upgrade: websocket, на который сервер отвечает 101 Switching Protocols',
            'POST-запросом на специальный endpoint с токеном в теле',
            'Через DNS-запись специального типа WS',
          ],
          correctIndex: 1,
          explanation: 'Handshake — это HTTP-запрос с заголовками Upgrade и Sec-WebSocket-Key; после ответа 101 то же TCP-соединение переключается на протокол WebSocket. Именно поэтому WebSocket работает через стандартные порты 80/443 и существующие балансировщики.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'В каком случае SSE предпочтительнее WebSocket?',
          options: [
            'Когда нужен двунаправленный бинарный обмен с минимальной задержкой',
            'Когда нужно передавать большие файлы',
            'Когда сервер только пушит события, а клиент отправляет команды обычными HTTP-запросами',
            'Когда клиентов больше тысячи',
          ],
          correctIndex: 2,
          explanation: 'SSE — односторонний поток поверх обычного HTTP: не нужен Upgrade, EventSource сам переподключается, инфраструктура не требует доработок. Для уведомлений, прогресса и лент этого достаточно. Двунаправленность и бинарные данные — как раз аргументы в пользу WebSocket, а число клиентов само по себе выбор не определяет.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'SSE-endpoint уведомлений',
          description: 'Реализуйте на FastAPI endpoint `GET /events`, отдающий поток Server-Sent Events. Требования: каждому подключению — своя `asyncio.Queue`, зарегистрированная в общем множестве `subscribers`; события сериализуются в JSON и отправляются в формате `data: ...`; каждые 15 секунд без событий отправляется комментарий keep-alive; при отключении клиента очередь удаляется из `subscribers`.',
          language: 'python',
          starterCode: `import asyncio
import json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

app = FastAPI()
subscribers: set[asyncio.Queue] = set()

def publish(event: dict) -> None:
    for queue in subscribers:
        queue.put_nowait(event)

# TODO: генератор event_stream и endpoint GET /events`,
          solution: `import asyncio
import json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

app = FastAPI()
subscribers: set[asyncio.Queue] = set()

def publish(event: dict) -> None:
    for queue in subscribers:
        queue.put_nowait(event)

async def event_stream(request: Request):
    queue: asyncio.Queue = asyncio.Queue()
    subscribers.add(queue)
    try:
        while True:
            if await request.is_disconnected():
                break
            try:
                event = await asyncio.wait_for(queue.get(), timeout=15)
                yield f"data: {json.dumps(event)}\\n\\n"
            except asyncio.TimeoutError:
                yield ": keep-alive\\n\\n"   # комментарий, клиент его игнорирует
    finally:
        subscribers.discard(queue)          # уборка при любом исходе

@app.get("/events")
async def sse(request: Request):
    return StreamingResponse(
        event_stream(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )`,
          hints: [
            'Формат SSE: строка `data: <текст>` и пустая строка-разделитель, то есть каждое событие заканчивается двумя символами перевода строки. Строки, начинающиеся с двоеточия, — комментарии.',
            'Оберните `queue.get()` в `asyncio.wait_for(..., timeout=15)`: по таймауту отправляйте keep-alive комментарий, чтобы прокси не закрыл «тихое» соединение.',
            'Регистрируйте очередь в `subscribers` до цикла, а удаляйте в `finally` — так очередь не утечёт ни при разрыве соединения, ни при исключении. Проверяйте `await request.is_disconnected()`.',
          ],
        },
      ],
    },
    {
      slug: 'microservices',
      title: 'Микросервисы',
      description: 'Честные трейдоффы микросервисов: границы сервисов, database per service, saga и API Gateway.',
      duration: 32,
      blocks: [
        { type: 'text', text: 'Интернет-магазин вырос: 40 разработчиков в одном репозитории, релиз раз в месяц, потому что «поезд» собирает изменения всех команд, а падение модуля рекомендаций роняет и оформление заказа. Это реальные боли, которые толкают к микросервисам. Но у микросервисов своя цена, и платить её имеет смысл далеко не всем. Этот урок — про честные трейдоффы, а не про моду.' },
        { type: 'heading', text: 'Монолит vs модульный монолит vs микросервисы' },
        { type: 'table', headers: ['Критерий', 'Монолит', 'Модульный монолит', 'Микросервисы'], rows: [
          ['Деплой', 'один артефакт', 'один артефакт', 'независимый у каждого сервиса'],
          ['Транзакции', 'ACID в одной БД', 'ACID в одной БД', 'распределённые: saga, eventual consistency'],
          ['Вызов между модулями', 'вызов функции', 'вызов функции через явный интерфейс', 'сеть: таймауты, ретраи, недоступность'],
          ['Сложность инфраструктуры', 'низкая', 'низкая', 'высокая: оркестрация, tracing, gateway'],
          ['Автономия команд', 'низкая', 'средняя', 'высокая'],
          ['Рефакторинг границ', 'простой', 'простой', 'очень дорогой'],
        ] },
        { type: 'text', text: 'Микросервисы покупают **независимость деплоя и автономию команд**, а платят **сетевыми вызовами вместо вызовов функций** и потерей ACID-транзакций между модулями. **Модульный монолит** — часто недооценённая середина: один деплой и одна БД, но код разбит на модули с явными интерфейсами и запретом лезть в чужие таблицы. Такой монолит и жить проще, и распилить на сервисы потом дешевле, потому что границы уже проведены. Микросервисы не нужны, когда: команда меньше 15-20 человек, продукт ещё ищет product-market fit и границы доменов меняются каждый месяц, нагрузка спокойно живёт на нескольких инстансах монолита.' },
        { type: 'note', variant: 'warning', text: 'Не начинайте новый продукт с микросервисов. Ошибка в границах сервисов стоит на порядок дороже, чем ошибка в границах модулей: переносить логику между сервисами — значит менять API, схемы БД, деплой и владение командами. Сначала модульный монолит, выделение сервисов — по мере реальной боли (независимый деплой, разное масштабирование, разные команды).' },
        { type: 'heading', text: 'Границы сервисов: bounded context' },
        { type: 'text', text: 'Главный вопрос — не «какого размера должен быть сервис», а «где проходят границы». Ответ даёт **bounded context** из Domain-Driven Design: граница, внутри которой термины бизнеса имеют единое значение. «Товар» для каталога — это описание и картинки, для склада — остатки и ячейки хранения, для доставки — вес и габариты: это три разных контекста. Признаки правильной границы: сервис выполняет бизнес-операцию целиком, не гоняя данные туда-сюда с соседями; изменения одной фичи затрагивают один сервис; командой сервиса владеет одна команда людей. Если два сервиса всегда деплоятся вместе — это один сервис, разрезанный по ошибке.' },
        { type: 'heading', text: 'Взаимодействие: sync vs async' },
        { type: 'code', language: 'python', filename: 'orders/warehouse_client.py', code: `import httpx

# Синхронное взаимодействие: REST-вызов сервиса склада.
# Годится, когда ответ нужен прямо сейчас, в рамках запроса пользователя.
client = httpx.Client(
    base_url="http://warehouse-service:8000",
    timeout=httpx.Timeout(3.0, connect=1.0),   # таймауты обязательны
    transport=httpx.HTTPTransport(retries=2),  # ретраи сетевых ошибок
)

def check_stock(sku: str) -> int:
    resp = client.get(f"/stock/{sku}")
    resp.raise_for_status()
    return resp.json()["quantity"]
# Для внутренних вызовов с жёсткими требованиями к латентности
# и строгими контрактами берут gRPC (protobuf, HTTP/2, кодогенерация).` },
        { type: 'code', language: 'json', filename: 'order.confirmed.json', code: `{
  "event_type": "order.confirmed",
  "event_id": "3d1f7a9c-8b21-4f0e-a7b3-5c9d2e8f1a42",
  "occurred_at": "2026-07-06T14:05:00Z",
  "version": 1,
  "payload": { "order_id": 1042, "user_id": 7, "total": "4990.00" }
}` },
        { type: 'text', text: 'Синхронные вызовы (REST, gRPC) просты, но создают **временную связность**: заказ не оформится, пока жив сервис бонусов, а цепочка из пяти сервисов перемножает их недоступности. Поэтому всё, что не нужно для ответа пользователю, уводят в **асинхронные события** через Kafka: заказы публикуют `order.confirmed`, а бонусы, письма и аналитика реагируют в своём темпе. Снаружи систему прикрывает **API Gateway** — единая точка входа: маршрутизация по сервисам, TLS, аутентификация, rate limiting, агрегация ответов. Клиент не должен знать внутреннюю топологию.' },
        { type: 'heading', text: 'Database per service и saga' },
        { type: 'text', text: 'Канон: **у каждого сервиса своя БД**, чужие таблицы недоступны — иначе схемы сцепляются и независимый деплой умирает. Следствия серьёзные: JOIN между данными разных сервисов невозможен (данные дублируют через события или собирают на gateway), а ACID-транзакция через два сервиса не существует. Классическое «решение» — двухфазный коммит (2PC) — в микросервисах избегают: координатор блокирует участников и становится точкой отказа, а падение координатора оставляет всех в подвешенном состоянии. Вместо него — **saga**: цепочка локальных транзакций, где у каждого шага есть **компенсирующее действие**, и при сбое выполненные шаги откатываются компенсациями в обратном порядке. Система получается eventually consistent — и с этим учатся жить. Saga бывает с **оркестратором** (один компонент явно ведёт сценарий, как в примере ниже) или в виде **хореографии** — сервисы реагируют на события друг друга без координатора: связность меньше, но сценарий размазан по системе, и отлаживать его труднее. И про отладку: запрос теперь проходит через 5-7 сервисов, поэтому обязателен **distributed tracing** (OpenTelemetry + Jaeger/Tempo) — сквозной `trace_id` пробрасывается через все вызовы и события и показывает весь путь запроса с таймингами каждого шага.' },
        { type: 'code', language: 'python', filename: 'orders/saga.py', code: `class SagaError(Exception):
    pass

def create_order_saga(order: dict) -> None:
    steps = [
        (reserve_stock,   release_stock),    # шаг и его компенсация
        (charge_payment,  refund_payment),
        (create_shipment, cancel_shipment),
    ]
    completed: list = []
    try:
        for action, compensation in steps:
            action(order)                 # локальная транзакция сервиса
            completed.append(compensation)
    except Exception as exc:
        # Откат: компенсации выполненных шагов в обратном порядке
        for compensation in reversed(completed):
            try:
                compensation(order)
            except Exception:
                log.exception("compensation failed, manual intervention")
        raise SagaError(f"order saga failed: {exc}") from exc` },
        { type: 'heading', text: 'Итоги' },
        { type: 'list', items: [
          'Микросервисы покупают автономию команд и независимый деплой ценой сетевых вызовов и потери ACID между модулями.',
          'Начинайте с модульного монолита; выделяйте сервисы по реальной боли, а не по моде.',
          'Границы — по bounded context: внутри границы термины бизнеса однозначны, фича меняет один сервис.',
          'Sync (REST/gRPC) — когда ответ нужен сейчас; async (события) — для всего остального, меньше временной связности.',
          'Database per service: никаких JOIN между сервисами; вместо 2PC — saga с компенсирующими действиями.',
          'API Gateway прячет топологию от клиентов; distributed tracing обязателен с первого дня.',
        ] },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Каково главное следствие принципа database per service?',
          options: [
            'Каждый сервис обязан использовать PostgreSQL',
            'SQL JOIN между данными разных сервисов и ACID-транзакции через границы сервисов становятся невозможными',
            'Все сервисы читают одну общую БД, но пишут каждый в свою',
            'Схема БД должна быть одинаковой во всех сервисах',
          ],
          correctIndex: 1,
          explanation: 'Своя БД у каждого сервиса даёт независимость схем и деплоя, но данные оказываются физически разнесены: JOIN на уровне SQL исчезает (данные дублируют через события или агрегируют в API), а транзакции через сервисы заменяются паттернами вроде saga с eventual consistency.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Что такое saga в контексте микросервисов?',
          options: [
            'Распределённая транзакция, блокирующая всех участников до общего commit (2PC)',
            'Синхронная цепочка вызовов сервисов через API Gateway',
            'Паттерн репликации данных между базами сервисов',
            'Последовательность локальных транзакций, где у каждого шага есть компенсирующее действие на случай сбоя',
          ],
          correctIndex: 3,
          explanation: 'Saga не блокирует участников: каждый шаг — обычная локальная транзакция своего сервиса, а атомарность имитируется компенсациями — при сбое выполненные шаги откатываются в обратном порядке (вернуть деньги, снять резерв). Это осознанный отказ от 2PC с его блокировками и хрупким координатором.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Оркестратор saga',
          description: 'Реализуйте класс `SagaOrchestrator`: метод `add_step(action, compensation)` регистрирует шаг и его компенсацию, метод `run(ctx)` выполняет шаги по порядку, передавая каждому общий словарь контекста. При исключении в любом шаге оркестратор вызывает компенсации всех уже выполненных шагов в обратном порядке (ошибки компенсаций не прерывают откат) и пробрасывает исходное исключение. Соберите на нём saga оформления заказа: резерв товара, оплата, доставка.',
          language: 'python',
          starterCode: `from typing import Any, Callable

Step = Callable[[dict], Any]

class SagaOrchestrator:
    def __init__(self) -> None:
        self.steps: list[tuple[Step, Step]] = []

    def add_step(self, action: Step, compensation: Step) -> "SagaOrchestrator":
        # TODO: сохраните пару и верните self для чейнинга
        ...

    def run(self, ctx: dict) -> dict:
        # TODO: выполняйте шаги, при сбое откатите выполненные
        ...`,
          solution: `from typing import Any, Callable

Step = Callable[[dict], Any]

class SagaOrchestrator:
    def __init__(self) -> None:
        self.steps: list[tuple[Step, Step]] = []

    def add_step(self, action: Step, compensation: Step) -> "SagaOrchestrator":
        self.steps.append((action, compensation))
        return self  # позволяет чейнить add_step

    def run(self, ctx: dict) -> dict:
        completed: list[Step] = []
        try:
            for action, compensation in self.steps:
                action(ctx)               # локальная транзакция шага
                completed.append(compensation)
            return ctx
        except Exception:
            for compensation in reversed(completed):
                try:
                    compensation(ctx)     # откат в обратном порядке
                except Exception:
                    log.exception("compensation failed")
            raise                         # исходная ошибка не глотается

saga = (
    SagaOrchestrator()
    .add_step(reserve_stock, release_stock)
    .add_step(charge_payment, refund_payment)
    .add_step(create_shipment, cancel_shipment)
)
saga.run({"order_id": 1042, "user_id": 7})`,
          hints: [
            'Храните шаги списком пар `(action, compensation)`; `add_step` возвращает `self`, чтобы вызовы можно было чейнить.',
            'В `run` ведите список компенсаций уже выполненных шагов: компенсацию добавляйте только ПОСЛЕ успешного `action(ctx)` — упавший шаг компенсировать не нужно.',
            'В блоке `except` пройдите `reversed(completed)`, каждую компенсацию оберните в собственный try/except, а в конце сделайте голый `raise`, чтобы вызывающий код узнал о сбое saga.',
          ],
        },
      ],
    },
    {
      slug: 'performance',
      title: 'Оптимизация производительности',
      description: 'Профилирование, медленные запросы PostgreSQL, GIL, connection pooling и нагрузочное тестирование.',
      duration: 30,
      blocks: [
        { type: 'text', text: 'Разработчик неделю ускорял сериализацию в 10 раз — а endpoint стал быстрее на 3%: время уходило на четыре SQL-запроса и вызов внешнего API. Это самая частая ошибка в оптимизации: чинить то, что *кажется* медленным. Правило номер один: **сначала измерь**. Интуиция о узких местах ошибается постоянно, а по закону Амдала ускорение части, занимающей 5% времени, даёт максимум 5% выигрыша — сколько бы усилий вы ни вложили.' },
        { type: 'heading', text: 'Сначала измерь: py-spy и cProfile' },
        { type: 'code', language: 'bash', filename: 'profiling.sh', code: `# py-spy: сэмплирующий профилировщик, цепляется к работающему
# процессу без его перезапуска и почти без накладных расходов
pip install py-spy
py-spy top --pid 12345                # топ функций в реальном времени
py-spy record -o profile.svg --pid 12345 --duration 30   # flame graph
py-spy dump --pid 12345               # стеки всех потоков: где висим?

# cProfile: детерминированный профилировщик для скриптов и тестов
python -m cProfile -o out.prof manage.py import_catalog
python -m pstats out.prof             # sort cumtime, stats 20` },
        { type: 'heading', text: 'Узкое место обычно в БД' },
        { type: 'code', language: 'sql', filename: 'pg_stat_statements.sql', code: `-- В postgresql.conf: shared_preload_libraries = 'pg_stat_statements'
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Топ-10 запросов, съедающих больше всего времени БД
SELECT
    round(total_exec_time::numeric, 0) AS total_ms,
    calls,
    round(mean_exec_time::numeric, 2)  AS mean_ms,
    rows,
    left(query, 80)                    AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;` },
        { type: 'text', text: 'В типичном веб-приложении процессор почти не занят — время уходит на ожидание БД и внешних API. `pg_stat_statements` агрегирует статистику по всем запросам и сразу показывает две категории проблем: тяжёлые запросы (большой `mean_ms` — лечится `EXPLAIN ANALYZE` и индексами) и **N+1** (безобидный `mean_ms`, но десятки тысяч `calls` — лечится `select_related`/`prefetch_related` в Django или `selectinload` в SQLAlchemy). И смотрите на **p95/p99**, а не на среднее: среднее в 50 мс легко прячет 5% запросов по 2 секунды.' },
        { type: 'note', variant: 'tip', text: 'Кэшируйте на нескольких уровнях, от дешёвого к дорогому: CDN и HTTP-кэш для статики и анонимных страниц, Redis для горячих данных приложения, локальный in-process кэш (например, TTLCache) для справочников, которые дёргаются тысячи раз в секунду. Каждый уровень снимает нагрузку со следующего — но помните про инвалидацию из урока о Redis.' },
        { type: 'heading', text: 'GIL: threads vs asyncio vs multiprocessing' },
        { type: 'table', headers: ['Тип нагрузки', 'Инструмент', 'Почему'], rows: [
          ['CPU-bound: парсинг, обработка изображений, криптография', 'multiprocessing, ProcessPoolExecutor', 'У каждого процесса свой интерпретатор и свой GIL — задействуются все ядра'],
          ['IO-bound, тысячи одновременных соединений', 'asyncio', 'Один поток и event loop; переключение на await почти бесплатно, нет цены контекст-свитчей'],
          ['IO-bound с блокирующими библиотеками (requests, старые драйверы)', 'threads, ThreadPoolExecutor', 'GIL освобождается на время системных вызовов и ожидания сети — потоки реально параллелят ожидание'],
          ['Веб-приложение целиком', 'несколько воркеров gunicorn/uvicorn', 'Процессы дают параллелизм по ядрам, asyncio внутри каждого — конкурентный IO'],
        ] },
        { type: 'heading', text: 'Connection pooling' },
        { type: 'code', language: 'python', filename: 'db.py', code: `from sqlalchemy import create_engine

# Открытие соединения к PostgreSQL стоит десятки миллисекунд
# (TCP + TLS + fork backend-процесса). Пул делает это один раз.
engine = create_engine(
    "postgresql+psycopg://app:secret@db:5432/shop",
    pool_size=10,        # постоянные соединения на процесс
    max_overflow=5,      # временные сверх пула при пике
    pool_timeout=5,      # ждать свободное соединение не дольше 5 с
    pool_pre_ping=True,  # проверять соединение перед выдачей
    pool_recycle=1800,   # пересоздавать раз в 30 минут
)

# Арифметика: workers * (pool_size + max_overflow) должно быть
# меньше max_connections PostgreSQL. При сотнях соединений ставьте
# PgBouncer между приложением и БД.` },
        { type: 'heading', text: 'Нагрузочное тестирование и масштабирование' },
        { type: 'code', language: 'python', filename: 'locustfile.py', code: `from locust import HttpUser, task, between

class ShopUser(HttpUser):
    wait_time = between(1, 3)   # пауза «человека» между действиями

    @task(3)                    # каталог смотрят в 3 раза чаще
    def browse_catalog(self):
        self.client.get("/api/products?page=1")

    @task(1)
    def checkout(self):
        self.client.post(
            "/api/orders",
            json={"items": [{"sku": "AB-100", "qty": 1}]},
        )

# Запуск: locust -f locustfile.py --host https://staging.shop.dev
# Поднимайте нагрузку ступенями и найдите точку, где p95 ломается.` },
        { type: 'text', text: 'Когда один сервер упирается в потолок, масштабируются **горизонтально**: N одинаковых инстансов за балансировщиком. Обязательное условие — **stateless-приложение**: никакого состояния в памяти или на диске инстанса; сессии — в Redis, файлы — в S3, фоновая работа — в очередь. Тогда инстансы взаимозаменяемы, их количество меняется автоскейлером, а падение одного никого не волнует. И зафиксируйте **перф-бюджеты**: например, «p95 ключевых endpoint меньше 300 мс при 500 RPS», проверяемые нагрузочным прогоном в CI по расписанию. Бюджет превращает «стало как-то медленно» в конкретный сломанный тест — деградацию ловят до продакшена.' },
        { type: 'heading', text: 'Итоги' },
        { type: 'list', items: [
          'Сначала измерь: py-spy для живого процесса, cProfile для сценариев; оптимизация без данных — лотерея.',
          'Узкое место чаще всего в БД: pg_stat_statements находит и тяжёлые запросы, и N+1.',
          'Смотрите p95/p99, а не среднее.',
          'GIL: multiprocessing — для CPU-bound, asyncio — для массового IO, threads — для блокирующих библиотек.',
          'Connection pool обязателен; следите, чтобы сумма пулов не превысила max_connections, дальше — PgBouncer.',
          'Stateless-инстансы + балансировщик = горизонтальное масштабирование; перф-бюджеты в CI ловят деградации до продакшена.',
        ] },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Профилирование показало: приложение 80% времени ждёт ответов внешних HTTP API. Что даст наибольший прирост пропускной способности?',
          options: [
            'Перейти на multiprocessing — больше процессов обработают больше запросов',
            'Конкурентный IO: asyncio или пул потоков, чтобы ожидание ответов шло параллельно',
            'Сервер с более мощным CPU',
            'Переписать горячие функции на Cython',
          ],
          correctIndex: 1,
          explanation: 'Задача IO-bound: процессор простаивает, пока приложение ждёт сеть. Asyncio или потоки позволяют держать сотни ожиданий одновременно в одном процессе — GIL этому не мешает, он освобождается на время IO. Multiprocessing и мощный CPU ускоряют вычисления, которых здесь всего 20%, Cython — тем более.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Что показывает расширение pg_stat_statements?',
          options: [
            'Текущие активные запросы и их блокировки',
            'План выполнения конкретного запроса с таймингами',
            'Агрегированную статистику по нормализованным запросам: calls, total_exec_time, mean_exec_time',
            'Список медленных запросов в реальном времени с полными параметрами',
          ],
          correctIndex: 2,
          explanation: 'pg_stat_statements копит статистику по каждому нормализованному запросу (параметры заменены плейсхолдерами): сколько раз вызывался, сколько времени съел суммарно и в среднем. Текущие запросы показывает pg_stat_activity, план конкретного запроса — EXPLAIN ANALYZE: это другие инструменты.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Почему оптимизацию начинают с профилирования, а не с переписывания подозрительного кода?',
          options: [
            'Профилировщик сам ускоряет код на 10-20%',
            'Интуиция о узких местах часто ошибается, а ускорение части, занимающей малую долю времени, почти не влияет на итог',
            'Без профилирования приложение нельзя выкатывать в продакшен',
            'Профилирование обязательно для настройки CI',
          ],
          correctIndex: 1,
          explanation: 'По закону Амдала выигрыш ограничен долей оптимизируемой части в общем времени: ускорив в 100 раз то, что занимает 5%, вы получите меньше 5% итогового прироста. Профилировщик заменяет догадки данными и направляет усилия туда, где время реально тратится — чаще всего это оказывается БД или сеть.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Нагрузочный сценарий с перф-бюджетом',
          description: 'Напишите locustfile для API магазина: в `on_start` пользователь логинится через `POST /api/auth/login` и сохраняет Bearer-токен в заголовки клиента; таск `list_products` (вес 5) запрашивает `GET /api/products` и помечает ответ проваленным, если он шёл дольше 500 мс (перф-бюджет); таск `create_order` (вес 1) отправляет `POST /api/orders`. Пауза между действиями 1-2 секунды.',
          language: 'python',
          starterCode: `from locust import HttpUser, task, between

class ApiUser(HttpUser):
    wait_time = between(1, 2)

    def on_start(self):
        # TODO: логин и заголовок Authorization
        ...

    # TODO: таски list_products (вес 5, бюджет 500 мс)
    # и create_order (вес 1)`,
          solution: `from locust import HttpUser, task, between

class ApiUser(HttpUser):
    wait_time = between(1, 2)

    def on_start(self):
        resp = self.client.post(
            "/api/auth/login",
            json={"email": "load@test.dev", "password": "secret"},
        )
        token = resp.json()["access_token"]
        self.client.headers.update({"Authorization": f"Bearer {token}"})

    @task(5)
    def list_products(self):
        with self.client.get("/api/products", catch_response=True) as resp:
            if resp.elapsed.total_seconds() > 0.5:
                resp.failure("slower than 500ms budget")
            elif resp.status_code != 200:
                resp.failure(f"unexpected status {resp.status_code}")
            else:
                resp.success()

    @task(1)
    def create_order(self):
        self.client.post(
            "/api/orders",
            json={"items": [{"sku": "AB-100", "qty": 1}]},
        )`,
          hints: [
            '`on_start` вызывается один раз на виртуального пользователя — логиньтесь там и положите токен в `self.client.headers`, тогда все таски пойдут авторизованными.',
            'Вес задаётся аргументом декоратора: `@task(5)` выполняется в 5 раз чаще, чем `@task(1)`.',
            'Для перф-бюджета используйте `catch_response=True`: внутри `with`-блока проверьте `resp.elapsed.total_seconds()` и вызовите `resp.failure(...)` или `resp.success()` — так медленные ответы попадут в статистику отказов.',
          ],
        },
      ],
    },
  ],
}
