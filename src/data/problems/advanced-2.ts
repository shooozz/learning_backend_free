import type { Problem } from '@/types/course'

// Сборник задач: Продвинутые темы, часть 2
export const problems: Problem[] = [
  {
    type: 'quiz',
    id: 'b1',
    difficulty: 'medium',
    question: 'Ключу `session:42` поставили TTL 60 секунд через EXPIRE. Через 10 секунд выполнили обычный `SET session:42 <новое значение>` без параметра ex. Что произойдёт со сроком жизни ключа?',
    options: [
      'TTL сохранится: срок жизни привязан к ключу до его явного удаления',
      'TTL сбросится: SET перезаписывает ключ «начисто», и он станет вечным; сохранить срок можно опцией keepttl или повторным EXPIRE',
      'SET на ключ с TTL вернёт ошибку — сначала нужно вызвать PERSIST',
      'Отсчёт TTL начнётся заново — снова с 60 секунд',
    ],
    correctIndex: 1,
    explanation: 'SET заменяет ключ целиком вместе с метаданными: старый TTL стирается, и ключ становится вечным — частая причина «кэша, который никогда не протухает». Сохранить срок жизни можно опцией keepttl (`r.set(key, value, keepttl=True)`) или повторным EXPIRE после записи. А вот команды, изменяющие значение на месте — INCR, HSET, ZADD, — TTL не трогают.',
  },
  {
    type: 'quiz',
    id: 'b2',
    difficulty: 'medium',
    question: 'Продюсер Kafka отправляет платёжные события с `acks=1`. Лидер партиции подтвердил запись и через мгновение вышел из строя — реплики скопировать сообщение не успели. Что произойдёт?',
    options: [
      'Ничего не потеряется: продюсер сам повторит отправку после выбора нового лидера',
      'Kafka перестанет принимать записи в партицию до возвращения старого лидера',
      'Сообщение сохранится: подтверждение лидера означает, что запись легла на диск всех реплик',
      'Сообщение может исчезнуть: acks=1 подтверждает запись только на лидере, а новым лидером станет реплика без него; для критичных данных нужен acks=all с min.insync.replicas >= 2',
    ],
    correctIndex: 3,
    explanation: 'acks=1 означает «лидер записал — продюсер свободен»: до репликации сообщение существует в единственной копии. Умер лидер — лидером становится реплика, где сообщения нет, и оно тихо теряется. Продюсер повторять отправку не будет: подтверждение он уже получил. acks=all заставляет дождаться in-sync реплик — медленнее, но для платежей это правильная цена.',
  },
  {
    type: 'code',
    id: 'b3',
    difficulty: 'medium',
    title: 'Топ страниц на sorted set',
    description: 'Реализуйте счётчик популярности страниц за день: `register_view(path)` увеличивает счётчик просмотров страницы в sorted set с ключом вида `pageviews:2026-07-17`, `get_top(n)` возвращает n самых просматриваемых страниц в виде пар `(path, views)`. Ключ дня должен автоматически удаляться через 48 часов.',
    language: 'python',
    starterCode: `import time
import redis

r = redis.Redis(decode_responses=True)

def day_key() -> str:
    return 'pageviews:' + time.strftime('%Y-%m-%d')

def register_view(path: str) -> None:
    # TODO: увеличьте счётчик страницы в sorted set
    # и поставьте ключу TTL 48 часов (одним pipeline)
    ...

def get_top(n: int) -> list[tuple[str, float]]:
    # TODO: верните n страниц с наибольшим числом просмотров
    ...`,
    solution: `import time
import redis

r = redis.Redis(decode_responses=True)

def day_key() -> str:
    return 'pageviews:' + time.strftime('%Y-%m-%d')

def register_view(path: str) -> None:
    key = day_key()
    pipe = r.pipeline()               # одна сетевая поездка
    pipe.zincrby(key, 1, path)        # score страницы +1
    pipe.expire(key, 48 * 3600)       # ключ дня умрёт сам
    pipe.execute()

def get_top(n: int) -> list[tuple[str, float]]:
    # zrevrange отдаёт элементы по убыванию score
    return r.zrevrange(day_key(), 0, n - 1, withscores=True)`,
    hints: [
      'Sorted set идеально подходит: элемент — путь страницы, score — число просмотров. Ключ включает дату, поэтому каждый день начинается с чистого листа.',
      '`zincrby(key, 1, path)` увеличивает score элемента; объедините его с `expire(key, 48 * 3600)` в pipeline — одна сетевая поездка.',
      '`r.zrevrange(day_key(), 0, n - 1, withscores=True)` вернёт готовый список пар (path, score) по убыванию просмотров.',
    ],
  },
  {
    type: 'quiz',
    id: 'b4',
    difficulty: 'medium',
    question: 'Redis с `maxmemory 2gb` используется как кэш, политика вытеснения осталась по умолчанию — `noeviction`. Память заполнилась до предела. Что начнёт происходить?',
    options: [
      'Команды записи начнут падать с ошибкой OOM, чтение продолжит работать; для кэша нужно включить вытеснение, например allkeys-lru',
      'Redis сам удалит самые давние ключи и продолжит принимать записи',
      'Redis начнёт сбрасывать редко используемые данные на диск и замедлится',
      'Процесс Redis аварийно завершится, и супервизор его перезапустит',
    ],
    correctIndex: 0,
    explanation: 'noeviction буквально означает «ничего не вытеснять»: при достижении maxmemory команды записи отклоняются с ошибкой OOM command not allowed, а чтение работает как раньше. Сам Redis ключи не удаляет (кроме истёкших по TTL) и данные на диск не «свопит». Для кэша правильная политика — allkeys-lru или allkeys-lfu: под давлением памяти вытесняются наименее востребованные ключи.',
  },
  {
    type: 'quiz',
    id: 'b5',
    difficulty: 'medium',
    question: 'Пользователи жалуются: чат «замирает» после пары минут бездействия, ошибок в логах нет. Соединения проходят через корпоративные прокси и NAT. Какое решение правильное?',
    options: [
      'Увеличить таймауты HTTP-запросов на клиенте',
      'Перейти с WebSocket на polling каждые 100 мс',
      'Настроить heartbeat: ping/pong кадры каждые 20-30 секунд плюс клиентский reconnect с экспоненциальной задержкой',
      'Хранить недоставленные сообщения в Redis',
    ],
    correctIndex: 2,
    explanation: 'NAT и балансировщики молча убивают «тихие» TCP-сессии, поэтому heartbeat держит соединение живым, а reconnect восстанавливает его после разрыва. Учащённый polling вернул бы все недостатки, от которых уходили к WebSocket, а таймауты HTTP на уже установленное WebSocket-соединение не влияют.',
  },
  {
    type: 'code',
    id: 'b6',
    difficulty: 'medium',
    title: 'Шина уведомлений на Redis pub/sub',
    description: 'Инстансы приложения должны обмениваться уведомлениями: событие, произошедшее на одном, доставляется всем остальным. Напишите `notify(channel, event)` — публикует словарь события как JSON в канал, и `listen(channel, handler)` — подписывается на канал и для каждого настоящего сообщения (служебные — пропускать) вызывает `handler` с распарсенным словарём.',
    language: 'python',
    starterCode: `import json
import redis

r = redis.Redis(decode_responses=True)

def notify(channel: str, event: dict) -> None:
    # TODO: опубликуйте событие как JSON-строку
    ...

def listen(channel: str, handler) -> None:
    # TODO: подпишитесь на канал; в handler передавайте только
    # сообщения с type == 'message', распарсив data из JSON
    ...`,
    solution: `import json
import redis

r = redis.Redis(decode_responses=True)

def notify(channel: str, event: dict) -> None:
    # Сообщение получат только ТЕКУЩИЕ подписчики: pub/sub
    # ничего не хранит — кто не слушал в этот момент, не узнает
    r.publish(channel, json.dumps(event))

def listen(channel: str, handler) -> None:
    pubsub = r.pubsub()
    pubsub.subscribe(channel)
    for message in pubsub.listen():   # блокирующий генератор
        # В потоке есть служебные записи (подтверждение подписки)
        if message['type'] != 'message':
            continue
        handler(json.loads(message['data']))`,
    hints: [
      '`r.publish(channel, json.dumps(event))` рассылает сообщение всем, кто подписан прямо сейчас: истории у pub/sub нет — этим он и отличается от очередей и Kafka.',
      'Для подписки создайте объект `r.pubsub()`, вызовите `subscribe(channel)` и итерируйте `pubsub.listen()` — это бесконечный блокирующий генератор словарей.',
      'Первым приходит служебное сообщение с type == \'subscribe\' — фильтруйте по `message[\'type\'] == \'message\'`, а полезные данные парсите из `message[\'data\']`.',
    ],
  },
  {
    type: 'quiz',
    id: 'b7',
    difficulty: 'medium',
    question: 'Лента уведомлений в личном кабинете: сервер шлёт клиенту события несколько раз в минуту, клиент серверу не отправляет ничего. Нужны минимальная сложность и автоматическое восстановление после обрыва. Что выбрать?',
    options: [
      'WebSocket: двунаправленный канал покрывает и односторонний случай, запас не помешает',
      'Long polling: браузерные API потоков событий слишком ненадёжны для продакшена',
      'SSE: односторонний поток поверх обычного HTTP, EventSource сам переподключается и досылает пропущенное через Last-Event-ID',
      'Вкладывать накопившиеся уведомления в тело каждого обычного API-ответа',
    ],
    correctIndex: 2,
    explanation: 'Когда трафик идёт только от сервера к клиенту, SSE закрывает задачу минимальными средствами: обычный HTTP (дружит с прокси и балансировщиками), встроенный reconnect у EventSource и Last-Event-ID для доставки пропущенных событий. WebSocket даёт двунаправленность, которая здесь не нужна, а стоит отдельного протокола, ручного reconnect и heartbeat.',
  },
  {
    type: 'quiz',
    id: 'b8',
    difficulty: 'medium',
    question: 'Мониторинг показывает среднее время ответа API 60 мс, но пользователи жалуются на регулярные «зависания». Куда смотреть в первую очередь?',
    options: [
      'На перцентили p95/p99: среднее легко прячет небольшой процент очень медленных запросов, которые и ловят пользователи',
      'На загрузку CPU серверов: жалобы при быстром среднем означают нехватку ядер',
      'Никуда: среднее 60 мс — отличный показатель, проблема на стороне пользователей',
      'На количество запросов в секунду: при росте RPS среднее всегда растёт первым',
    ],
    correctIndex: 0,
    explanation: 'Среднее 60 мс легко складывается из 95% быстрых ответов и 5% ответов по 2-3 секунды — именно эти хвосты и ощущаются как «зависания». p95/p99 показывают опыт худших запросов. CPU и RPS смотреть полезно, но сначала перцентили должны подтвердить саму проблему.',
  },
  {
    type: 'code',
    id: 'b9',
    difficulty: 'medium',
    title: 'Поиск неиспользуемых индексов',
    description: 'Каждый индекс замедляет INSERT/UPDATE и занимает место — даже если ни один запрос его не читает. Напишите запрос к `pg_stat_user_indexes`, находящий кандидатов на удаление: индексы с нулём сканирований (`idx_scan = 0`), исключая уникальные — они охраняют целостность и без чтений (присоедините `pg_index` и проверьте `indisunique`). Выведите таблицу, имя индекса и его размер через `pg_size_pretty`; крупнейшие — сверху.',
    language: 'sql',
    starterCode: `-- TODO: неиспользуемые индексы: idx_scan = 0 и не уникальные
-- колонки: table_name, index_name, index_size
-- сортировка: по размеру индекса по убыванию
SELECT
    ...
FROM pg_stat_user_indexes`,
    solution: `SELECT
    s.relname                                      AS table_name,
    s.indexrelname                                 AS index_name,
    pg_size_pretty(pg_relation_size(s.indexrelid)) AS index_size
FROM pg_stat_user_indexes s
JOIN pg_index i ON i.indexrelid = s.indexrelid
WHERE s.idx_scan = 0     -- ни одного чтения со сброса статистики
  AND NOT i.indisunique  -- уникальные охраняют целостность: не трогаем
ORDER BY pg_relation_size(s.indexrelid) DESC;`,
    hints: [
      '`pg_stat_user_indexes` считает обращения к каждому индексу: `idx_scan = 0` означает, что планировщик ни разу им не воспользовался со времени сброса статистики.',
      'Уникальные индексы удалять нельзя даже «неиспользуемые» — они обеспечивают констрейнты. Присоедините `pg_index` по `indexrelid` и добавьте условие `NOT indisunique`.',
      'Размер в байтах даёт `pg_relation_size(indexrelid)`, человекочитаемый вид — `pg_size_pretty(...)`. Сортируйте по «сырому» числу байт DESC, а не по строке из pg_size_pretty.',
    ],
  },
  {
    type: 'quiz',
    id: 'b10',
    difficulty: 'medium',
    question: 'Пользователь оформил бронь; ровно через 24 часа нужно прислать ему напоминание. Как правильно сделать это в Celery?',
    options: [
      'Вызвать задачу через `delay()`, а внутри неё выполнить `time.sleep(86400)`',
      'Поставить задачу через `apply_async(args=[booking_id], countdown=86400)` — брокер доставит её воркеру через сутки',
      'Добавить задачу в `beat_schedule` с запуском раз в сутки',
      'Запустить в веб-процессе отдельный поток с таймером',
    ],
    correctIndex: 1,
    explanation: '`countdown` (или `eta`) поручает отложенную доставку брокеру: веб-процесс отвечает сразу, воркер получит задачу через сутки. `time.sleep` занял бы воркера на 24 часа впустую, а beat — это периодические задачи для всех сразу, а не разовое напоминание конкретной брони.',
  },
  {
    type: 'code',
    id: 'b11',
    difficulty: 'medium',
    title: 'Расписание celery beat',
    description: 'Настройте `beat_schedule` для трёх периодических задач: `sessions.tasks.cleanup_expired` — каждый час в 30 минут; `reports.tasks.weekly_summary` — по понедельникам в 09:00; `health.tasks.ping_partners` — каждые 30 секунд.',
    language: 'python',
    starterCode: `from celery.schedules import crontab

app.conf.beat_schedule = {
    # TODO: три записи расписания
    # (помните: beat запускается строго в одном экземпляре)
}`,
    solution: `from celery.schedules import crontab

app.conf.beat_schedule = {
    'cleanup-expired-sessions': {
        'task': 'sessions.tasks.cleanup_expired',
        'schedule': crontab(minute=30),      # каждый час в :30
    },
    'weekly-summary': {
        'task': 'reports.tasks.weekly_summary',
        # понедельник, 09:00
        'schedule': crontab(minute=0, hour=9, day_of_week=1),
    },
    'ping-partners': {
        'task': 'health.tasks.ping_partners',
        'schedule': 30.0,                    # интервал в секундах
    },
}`,
    hints: [
      '`crontab(minute=30)` без указания hour означает «каждый час в 30 минут»; для интервала в секундах crontab не нужен — подойдёт обычное число.',
      'Понедельник в crontab — `day_of_week=1`; полное расписание еженедельного отчёта: `crontab(minute=0, hour=9, day_of_week=1)`.',
      'Каждая запись — ключ-имя и словарь с `task` (полный путь до задачи) и `schedule`; для пинга каждые 30 секунд достаточно `30.0`.',
    ],
  },
  {
    type: 'code',
    id: 'b12',
    difficulty: 'medium',
    title: 'Замена KEYS на SCAN',
    description: 'Код очистки использует `r.keys(\'temp:*\')` и подвешивает прод: KEYS блокирует однопоточный Redis на всё время обхода. Перепишите функцию `purge_temp()` на неблокирующий `scan_iter`, удаляя ключи пачками по 500 штук, и верните число удалённых ключей.',
    language: 'python',
    starterCode: `import redis

r = redis.Redis(decode_responses=True)

def purge_temp() -> int:
    keys = r.keys('temp:*')      # блокирует Redis: так нельзя
    if keys:
        r.delete(*keys)
    return len(keys)

# TODO: перепишите на scan_iter с удалением пачками по 500`,
    solution: `import redis

r = redis.Redis(decode_responses=True)

def purge_temp() -> int:
    deleted = 0
    batch: list[str] = []
    # scan_iter обходит ключи порциями и не блокирует сервер
    for key in r.scan_iter(match='temp:*', count=500):
        batch.append(key)
        if len(batch) >= 500:
            r.delete(*batch)     # один DEL на пачку дешевле 500 вызовов
            deleted += len(batch)
            batch = []
    if batch:                    # неполный «хвост» после цикла
        r.delete(*batch)
        deleted += len(batch)
    return deleted`,
    hints: [
      '`scan_iter(match=..., count=...)` обходит ключи порциями, не блокируя Redis: это итератор, который сам управляет курсором SCAN.',
      'Копите ключи в список и вызывайте `r.delete(*batch)`, когда набралось 500 — один DEL со множеством ключей дешевле пятисот отдельных вызовов.',
      'Не забудьте удалить «хвост» — неполную последнюю пачку после цикла — и вернуть суммарный счётчик удалённых ключей.',
    ],
  },
  {
    type: 'quiz',
    id: 'b13',
    difficulty: 'hard',
    question: 'Сервис заказов в одной функции сохраняет заказ в PostgreSQL и публикует событие `order_created` в Kafka. Изредка заказ есть в БД, а события нет (Kafka была недоступна) — или событие ушло, а транзакция БД откатилась. Как гарантировать согласованность?',
    options: [
      'Обернуть запись в БД и produce в общий try/except и повторять пару целиком до успеха',
      'Transactional outbox: событие пишется в таблицу outbox той же транзакцией БД, что и заказ, а отдельный relay-процесс читает таблицу и публикует события в Kafka с ретраями',
      'Публиковать событие до записи в БД: брокер надёжнее базы данных',
      'Настроить в PostgreSQL синхронную репликацию прямо в брокер Kafka',
    ],
    correctIndex: 1,
    explanation: 'БД и Kafka — независимые системы, общей транзакции между ними нет: любой порядок «записал туда, потом сюда» оставляет окно сбоя (процесс может умереть между двумя записями — try/except это окно не закрывает). Outbox убирает окно: заказ и событие фиксируются атомарно одной транзакцией в одной БД, а relay доводит события до Kafka с повторами. Итог — at-least-once, поэтому потребители дедуплицируют по event_id.',
  },
  {
    type: 'quiz',
    id: 'b14',
    difficulty: 'hard',
    question: 'Команда включила транзакции Kafka и заявляет: «теперь письмо о заказе гарантированно отправится ровно один раз». Что не так в этом утверждении?',
    options: [
      'Транзакции Kafka работают только в связке с RabbitMQ',
      'Exactly-once действует только внутри экосистемы Kafka; отправка письма — внешний побочный эффект, для него достижим лишь at-least-once плюс идемпотентность и дедупликация',
      'Всё верно: транзакции Kafka дают exactly-once для любых действий потребителя',
      'Транзакции нужно включать не в Kafka, а на SMTP-сервере',
    ],
    correctIndex: 1,
    explanation: 'Транзакции Kafka покрывают чтение и запись внутри Kafka (например, в Kafka Streams). SMTP-сервер в транзакции не участвует: при сбое между отправкой письма и коммитом offset сообщение перечитается и письмо уйдёт повторно. Реалистичная цель — at-least-once плюс дедупликация по event_id.',
  },
  {
    type: 'code',
    id: 'b15',
    difficulty: 'hard',
    title: 'Consumer с dead letter queue',
    description: 'Одно «ядовитое» сообщение с битым JSON раз за разом роняет обработчик и блокирует партицию: consumer падает, перечитывает то же сообщение и падает снова. Напишите цикл потребителя топика `orders`, который: пытается обработать сообщение (`json.loads` плюс `handle(event)`); при любой ошибке обработки публикует исходное сообщение в топик `orders.dlq` с текстом ошибки в заголовке; в обоих случаях коммитит offset, чтобы партиция двигалась дальше.',
    language: 'python',
    starterCode: `import json
from confluent_kafka import Consumer, Producer

consumer = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'orders-service',
    'enable.auto.commit': False,
})
consumer.subscribe(['orders'])
dlq = Producer({'bootstrap.servers': 'localhost:9092'})

# TODO: цикл poll: обработка, при ошибке — в orders.dlq,
# commit offset в обоих случаях`,
    solution: `import json
from confluent_kafka import Consumer, Producer

consumer = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'orders-service',
    'enable.auto.commit': False,
})
consumer.subscribe(['orders'])
dlq = Producer({'bootstrap.servers': 'localhost:9092'})

while True:
    msg = consumer.poll(timeout=1.0)
    if msg is None:
        continue
    if msg.error():
        log.error(msg.error())
        continue

    try:
        event = json.loads(msg.value())
        handle(event)
    except Exception as exc:
        # Ядовитое сообщение уходит в DLQ и не блокирует партицию;
        # публикуем сырые байты: JSON мог вообще не распарситься
        dlq.produce(
            topic='orders.dlq',
            key=msg.key(),
            value=msg.value(),
            headers={'error': str(exc)[:200]},
        )
        dlq.flush()

    # Коммит в обоих случаях: сообщение либо обработано, либо в DLQ
    consumer.commit(msg, asynchronous=False)`,
    hints: [
      'Оберните `json.loads` и `handle` в try/except: ошибка обработки не должна прерывать цикл — иначе одно битое сообщение навсегда заблокирует партицию.',
      'В except публикуйте исходные `msg.key()` и `msg.value()` (сырые байты, а не распарсенный JSON — он мог не распарситься) в топик `orders.dlq`, текст ошибки — в headers.',
      '`consumer.commit(msg)` вызывайте после try/except в обоих случаях: сообщение либо обработано, либо сохранено в DLQ — партиция может двигаться. Содержимое DLQ разбирается отдельным процессом.',
    ],
  },
  {
    type: 'quiz',
    id: 'b16',
    difficulty: 'hard',
    question: 'WebSocket-сервер котировок шлёт каждому клиенту ~50 сообщений в секунду. У части клиентов медленный интернет, и память сервера постепенно растёт до OOM — при этом ошибок в логах нет. Что происходит и как это лечится?',
    options: [
      'Утечка памяти в библиотеке WebSocket — поможет обновление зависимости',
      'Сообщения слишком часто сериализуются в JSON — нужен бинарный формат',
      'Клиенты держат открытыми старые вкладки — нужно ограничить число соединений с одного IP',
      'Нет backpressure: сервер производит сообщения быстрее, чем медленный клиент их вычитывает, и кадры копятся в буфере отправки соединения; нужен лимит очереди — при переполнении выбрасывать устаревшие сообщения или отключать клиента',
    ],
    correctIndex: 3,
    explanation: 'TCP медленного клиента не успевает принимать, и неотправленные кадры накапливаются в буфере соединения на стороне сервера — по буферу на каждого отстающего клиента, память растёт тихо и без ошибок. Лечение — ограничение очереди на соединение: для котировок старые значения можно смело выбрасывать (важно только последнее), а безнадёжно отстающих — отключать. Смена формата и лимит соединений разрыв скоростей не устраняют.',
  },
  {
    type: 'code',
    id: 'b17',
    difficulty: 'hard',
    title: 'Reconnect с экспоненциальной задержкой',
    description: 'Напишите асинхронного WebSocket-клиента `listen_forever(url)`: он подключается, подписывается на канал заказов сообщением `{"action": "subscribe", "channel": "orders"}`, читает сообщения и передаёт их в `handle(msg)`. При разрыве соединения — переподключение с экспоненциальной задержкой (1, 2, 4... секунд, максимум 30) и случайным джиттером; после успешного подключения задержка сбрасывается, подписка оформляется заново.',
    language: 'python',
    starterCode: `import asyncio
import json
import random
import websockets

async def listen_forever(url: str) -> None:
    # TODO: бесконечный цикл подключения с экспоненциальным
    # backoff, джиттером и повторной подпиской после reconnect
    ...`,
    solution: `import asyncio
import json
import random
import websockets

async def listen_forever(url: str) -> None:
    delay = 1.0
    while True:
        try:
            async with websockets.connect(url) as ws:
                delay = 1.0  # успешное подключение сбрасывает backoff
                # Подписка оформляется заново после каждого reconnect:
                # сервер о старых подписках ничего не помнит
                await ws.send(json.dumps(
                    {'action': 'subscribe', 'channel': 'orders'}
                ))
                async for raw in ws:
                    handle(json.loads(raw))
        except (OSError, websockets.ConnectionClosed):
            wait = delay + random.uniform(0, delay / 2)  # джиттер
            await asyncio.sleep(wait)
            delay = min(delay * 2, 30.0)`,
    hints: [
      'Внешний `while True` переустанавливает соединение; `async with websockets.connect(url)` сам закроет сокет при выходе из блока.',
      'Ловите `OSError` и `websockets.ConnectionClosed`; после успешного `connect` сбрасывайте задержку до 1 секунды — иначе после долгого сбоя стабильное соединение будет «наказано» большим backoff при следующем разрыве.',
      'Формула ожидания: `delay + random.uniform(0, delay / 2)`, затем `delay = min(delay * 2, 30.0)`. Джиттер разносит по времени тысячи клиентов, которые иначе переподключались бы синхронно.',
    ],
  },
  {
    type: 'quiz',
    id: 'b18',
    difficulty: 'hard',
    question: 'Оформление заказа реализовано хореографией: шесть сервисов реагируют на события друг друга. Продакт спрашивает «на каком шаге теряются заказы?» — и никто не может ответить: сценарий размазан по шести кодовым базам. Какое изменение архитектуры адресует именно эту боль?',
    options: [
      'Перевести все шесть сервисов на синхронные REST-вызовы друг друга',
      'Слить все шесть сервисов обратно в монолит',
      'Ввести saga-оркестратор: один компонент явно ведёт сценарий по шагам и хранит его состояние — сразу видно, где застрял каждый заказ',
      'Увеличить число партиций в топиках Kafka',
    ],
    correctIndex: 2,
    explanation: 'Боль — отсутствие единой точки, знающей состояние сценария: это цена хореографии. Оркестратор централизует сценарий и его состояние, давая наблюдаемость (ценой новой зависимости). Синхронный REST добавил бы временную связность, но не наблюдаемость, а слияние в монолит — несоразмерно радикальный ответ.',
  },
  {
    type: 'quiz',
    id: 'b19',
    difficulty: 'hard',
    question: 'Парсинг больших XML-файлов переписали с последовательного цикла на `ThreadPoolExecutor` с 8 потоками — время не изменилось. При этом тот же пул отлично ускорил загрузку файлов по сети. Почему?',
    options: [
      'ThreadPoolExecutor создаёт потоки лениво, и 8 потоков не успели запуститься',
      'Парсинг XML — CPU-bound: GIL пускает к байткоду один поток за раз и потоки не параллелят вычисления; сеть — IO-bound, на время ожидания GIL освобождается',
      'Для XML нужен ProcessPoolExecutor лишь потому, что парсер не потокобезопасен',
      'Потоки в Python всегда медленнее последовательного кода',
    ],
    correctIndex: 1,
    explanation: 'Парсинг — чистые вычисления: GIL допускает к выполнению байткода один поток за раз, и 8 потоков просто ждут друг друга. При сетевом IO GIL освобождается на время ожидания — поэтому загрузки ускорились. Для CPU-bound нужен ProcessPoolExecutor: у каждого процесса свой интерпретатор и свой GIL.',
  },
  {
    type: 'code',
    id: 'b20',
    difficulty: 'hard',
    title: 'Три индекса под три запроса',
    description: 'По данным pg_stat_statements три запроса съедают почти всё время БД. Создайте под каждый подходящий индекс: 1) поиск `WHERE lower(email) = $1` — функциональный индекс; 2) выборка `WHERE status = \'pending\' AND created_at < $1`, где pending-заказов меньше 1% таблицы — частичный индекс; 3) `WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20` — составной индекс, отдающий строки сразу в нужном порядке.',
    language: 'sql',
    starterCode: `-- 1) SELECT * FROM users WHERE lower(email) = $1;
-- TODO: функциональный индекс

-- 2) SELECT * FROM orders WHERE status = 'pending' AND created_at < $1;
--    (pending — меньше 1% строк таблицы)
-- TODO: частичный индекс

-- 3) SELECT * FROM orders WHERE user_id = $1
--    ORDER BY created_at DESC LIMIT 20;
-- TODO: составной индекс под порядок сортировки`,
    solution: `-- 1) Индекс по выражению: обслуживает именно lower(email)
CREATE INDEX idx_users_email_lower ON users (lower(email));

-- 2) Частичный индекс: только pending-строки — маленький и горячий
CREATE INDEX idx_orders_pending_created
    ON orders (created_at)
    WHERE status = 'pending';

-- 3) Составной: колонка равенства первой, сортировки — второй,
--    планировщик читает индекс в нужном порядке без узла Sort
CREATE INDEX idx_orders_user_created
    ON orders (user_id, created_at DESC);`,
    hints: [
      'Обычный индекс по `email` не поможет запросу с `lower(email)` — PostgreSQL умеет индексы по выражению: `CREATE INDEX ... ON users (lower(email))`.',
      'Частичный индекс с условием `WHERE status = \'pending\'` индексирует только 1% строк: он в разы меньше и почти целиком живёт в кэше; внутри индексируйте `created_at`.',
      'Для третьего запроса — составной индекс `(user_id, created_at DESC)`: сначала колонка равенства, затем колонка сортировки — планировщик отдаст первые 20 строк без отдельной сортировки.',
    ],
  },
  {
    type: 'quiz',
    id: 'b21',
    difficulty: 'hard',
    question: 'Защита от cache stampede: процесс берёт блокировку `r.set(lock_key, \'1\', nx=True, ex=10)`, затем пересчитывает отчёт, что занимает 60-90 секунд, и в finally удаляет lock_key. Найдите ошибку.',
    options: [
      'nx=True надо заменить на xx=True, иначе блокировка не устанавливается',
      'SET с параметрами nx и ex неатомарен — нужно вызывать SETNX и EXPIRE по отдельности',
      'Блокировки в Redis ненадёжны в принципе, нужен advisory lock в PostgreSQL',
      'TTL блокировки (10 с) меньше времени пересчёта: она истечёт посреди работы, второй процесс начнёт дублирующий пересчёт, а delete в finally снимет уже чужую блокировку',
    ],
    correctIndex: 3,
    explanation: 'TTL страхует от вечной блокировки при смерти держателя, но обязан превышать worst case работы с запасом — иначе блокировка истечёт, её возьмёт другой процесс, и stampede вернётся, а finally первого процесса удалит чужую блокировку. Для честного снятия в значение кладут уникальный токен и сверяют его перед delete. SET с nx и ex как раз атомарен — в этом его преимущество перед парой SETNX + EXPIRE.',
  },
  {
    type: 'quiz',
    id: 'b22',
    difficulty: 'hard',
    question: 'В Celery часть задач — секундные письма, часть — часовые отчёты, всё в одной очереди. Письмо иногда «висит» час, хотя есть свободные воркеры. `worker_prefetch_multiplier` — по умолчанию (4). Что происходит?',
    options: [
      'Воркер заранее резервирует пачку сообщений: письмо застревает в prefetch-буфере воркера, занятого часовым отчётом; лечится prefetch_multiplier=1 и отдельной очередью для долгих задач',
      'Брокер Redis сортирует задачи по ожидаемому времени выполнения, длинные всегда идут первыми',
      'acks_late заставляет воркеров выполнять задачи строго по одной',
      'Письма и отчёты в принципе нельзя обрабатывать одним приложением Celery',
    ],
    correctIndex: 0,
    explanation: 'С prefetch по умолчанию воркер резервирует несколько сообщений заранее: письмо попадает в буфер воркера, который следующий час считает отчёт, и ждёт, хотя соседние воркеры простаивают. `worker_prefetch_multiplier=1` плюс отдельная очередь (и свои воркеры) для длинных задач решают проблему. Брокер ничего не сортирует по длительности.',
  },
  {
    type: 'code',
    id: 'b23',
    difficulty: 'hard',
    title: 'Задача под распределённой блокировкой',
    description: 'Задача `sync_inventory` запускается и по расписанию beat, и вручную из админки — а выполняясь параллельно, дублирует движения по складу. Перепишите её так, чтобы одновременно работал только один экземпляр: блокировка в Redis через SET NX с TTL 10 минут и уникальным токеном в значении; если блокировка занята — задача молча выходит; снятие блокировки — только после сверки токена, чтобы не удалить чужую.',
    language: 'python',
    starterCode: `import uuid
import redis
from celery import shared_task

r = redis.Redis(decode_responses=True)
LOCK_KEY = 'lock:sync_inventory'
LOCK_TTL = 600

@shared_task
def sync_inventory() -> None:
    # TODO: взять блокировку с токеном; занято — выйти;
    # в finally снять блокировку, только если токен наш
    do_sync()`,
    solution: `import uuid
import redis
from celery import shared_task

r = redis.Redis(decode_responses=True)
LOCK_KEY = 'lock:sync_inventory'
LOCK_TTL = 600

@shared_task
def sync_inventory() -> None:
    token = str(uuid.uuid4())
    # SET NX атомарен: блокировку получит ровно один экземпляр
    if not r.set(LOCK_KEY, token, nx=True, ex=LOCK_TTL):
        return  # уже выполняется параллельно — выходим молча

    try:
        do_sync()  # собственно синхронизация склада
    finally:
        # Сверка токена: если TTL истёк и блокировку успел взять
        # другой экземпляр, его блокировку трогать нельзя
        if r.get(LOCK_KEY) == token:
            r.delete(LOCK_KEY)`,
    hints: [
      'Токен — `str(uuid.uuid4())` в значении блокировки: он отличает вашу блокировку от чужой, взятой после истечения TTL.',
      '`r.set(LOCK_KEY, token, nx=True, ex=LOCK_TTL)` вернёт None, если ключ уже существует — в этом случае задача просто делает return.',
      'В finally сначала сверьте `r.get(LOCK_KEY) == token` и только затем удаляйте. Строго атомарно пару get+delete делает Lua-скрипт (или готовый `redis.lock`), но сверка токена уже закрывает главную опасность — удаление чужой блокировки.',
    ],
  },
  {
    type: 'quiz',
    id: 'b24',
    difficulty: 'hard',
    question: 'После увеличения числа партиций топика `orders` с 4 до 8 события одного пользователя начали приходить потребителям не по порядку, хотя ключ партиционирования — `user_id` — не менялся. Что произошло?',
    options: [
      'Новые партиции по умолчанию читаются с конца, а старые — с начала',
      'Consumer group нужно пересоздавать после любого изменения топика',
      'Партиция выбирается как hash(key) mod N: с изменением N события пользователя стали попадать в другую партицию, и его «хвост» в старой партиции читается без взаимного порядка с новыми событиями',
      'Kafka вообще не гарантирует порядок по ключу — раньше он совпадал случайно',
    ],
    correctIndex: 2,
    explanation: 'Партиция вычисляется как hash(key) mod число_партиций: при изменении N тот же user_id начинает попадать в другую партицию. Старые события пользователя остались в прежней партиции, новые пишутся в другую — а порядок Kafka гарантирует только внутри одной партиции. Поэтому число партиций планируют с запасом заранее.',
  },
  {
    type: 'code',
    id: 'b25',
    difficulty: 'hard',
    title: 'HTTP-кэширование с ETag',
    description: 'Составьте два обмена запрос-ответ для `GET /api/products/42`: первый — полный ответ 200 с заголовками `Cache-Control: max-age=60`, `ETag` и JSON-телом; второй — повторный запрос той же страницы после истечения max-age с условным заголовком, на который сервер отвечает без тела, подтверждая актуальность закэшированной копии.',
    language: 'http',
    starterCode: `GET /api/products/42 HTTP/1.1
Host: api.shop.dev

(первый ответ: 200, Cache-Control, ETag, JSON-тело)

(повторный запрос с условным заголовком)

(ответ сервера без тела)`,
    solution: `GET /api/products/42 HTTP/1.1
Host: api.shop.dev

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=60
ETag: "v7-a1b2c3"

{"id": 42, "name": "Клавиатура", "price": "4990.00"}

GET /api/products/42 HTTP/1.1
Host: api.shop.dev
If-None-Match: "v7-a1b2c3"

HTTP/1.1 304 Not Modified
Cache-Control: max-age=60
ETag: "v7-a1b2c3"`,
    hints: [
      'ETag — версия представления ресурса; клиент сохраняет её вместе с ответом и после истечения max-age шлёт `If-None-Match: <etag>`.',
      'Если ресурс не менялся, сервер отвечает `304 Not Modified` без тела — клиент продолжает использовать локальную копию.',
      'В 304 повторите `ETag` и `Cache-Control`: это продлевает свежесть кэша ещё на max-age. Экономятся трафик и генерация ответа, хотя сетевая поездка всё равно происходит.',
    ],
  },
  {
    type: 'quiz',
    id: 'b26',
    difficulty: 'hard',
    question: 'Запрос пользователя проходит через gateway и пять сервисов; p99 вырос с 300 мс до 3 секунд, но в метриках каждого отдельного сервиса всё «зелёное». Какой инструмент ответит, где именно теряется время?',
    options: [
      'Distributed tracing: сквозной `trace_id` пробрасывается через все вызовы и события, собирая путь запроса в единый trace с таймингами каждого шага',
      'Централизованный сбор логов: все логи в одном месте покажут медленный сервис',
      'py-spy на каждом инстансе каждого сервиса',
      'Алерт на длину очередей в брокере сообщений',
    ],
    correctIndex: 0,
    explanation: 'Trace показывает весь путь запроса: длительность каждого вызова и паузы между ними — видно и медленный сервис, и время, потерянное на сети или в ожидании. Логи без общего trace_id не склеить в историю одного запроса, а py-spy профилирует CPU одного процесса, тогда как время в распределённой системе обычно теряется на ожидании между сервисами.',
  },
  {
    type: 'quiz',
    id: 'b27',
    difficulty: 'hard',
    question: 'Приложение: 10 процессов gunicorn, у каждого пул SQLAlchemy с pool_size=20 и max_overflow=10. В PostgreSQL max_connections = 100. Что произойдёт под пиковой нагрузкой?',
    options: [
      'Ничего страшного: пул сам ограничит общее число соединений сотней',
      'PostgreSQL поставит лишние подключения в очередь и обслужит позже',
      'Пиковая потребность 10 x (20 + 10) = 300 соединений упрётся в лимит 100: новые подключения начнут падать с ошибкой; нужно ужать пулы или поставить PgBouncer',
      'SQLAlchemy автоматически переключится в режим работы без пула',
    ],
    correctIndex: 2,
    explanation: 'Пулы независимы в каждом процессе: суммарный потолок — workers x (pool_size + max_overflow) = 300 при лимите БД в 100. PostgreSQL не ставит лишние подключения в очередь — они падают с ошибкой too many connections. Решение: ужать пулы так, чтобы сумма была ниже лимита, либо поставить PgBouncer, мультиплексирующий сотни клиентских соединений в десятки серверных.',
  },
  {
    type: 'code',
    id: 'b28',
    difficulty: 'hard',
    title: 'Устранение N+1 в Django',
    description: 'Endpoint экспорта заказов делает 2N+1 SQL-запросов: по одному на пользователя и на позиции каждого заказа. Исправьте функцию так, чтобы запросов стало ровно два: `select_related` для FK на пользователя и `prefetch_related` для позиций. Формат результата должен остаться прежним.',
    language: 'python',
    starterCode: `def export_orders() -> list[dict]:
    result = []
    for order in Order.objects.all():           # 1 запрос
        result.append({
            'id': order.id,
            'email': order.user.email,          # +1 запрос на каждый заказ
            'items': [
                {'sku': i.sku, 'qty': i.qty}
                for i in order.items.all()      # +1 запрос на каждый заказ
            ],
        })
    return result

# TODO: перепишите выборку так, чтобы запросов стало два`,
    solution: `def export_orders() -> list[dict]:
    orders = (
        Order.objects
        .select_related('user')       # JOIN: пользователь тем же запросом
        .prefetch_related('items')    # второй запрос: WHERE order_id IN (...)
    )
    result = []
    for order in orders:              # всего 2 запроса на весь экспорт
        result.append({
            'id': order.id,
            'email': order.user.email,        # данные уже загружены
            'items': [
                {'sku': i.sku, 'qty': i.qty}
                for i in order.items.all()    # и эти тоже
            ],
        })
    return result`,
    hints: [
      '`select_related(\'user\')` разворачивается в SQL JOIN — пользователь приезжает тем же запросом, что и заказ. Работает для FK и OneToOne.',
      'Для обратной связи items нужен `prefetch_related(\'items\')`: Django выполнит второй запрос вида WHERE order_id IN (...) и раздаст позиции по заказам уже в памяти.',
      'Тело цикла не меняется: `order.user.email` и `order.items.all()` теперь читают предзагруженные данные. Закрепите результат тестом с `assertNumQueries(2)`.',
    ],
  },
  {
    type: 'quiz',
    id: 'b29',
    difficulty: 'hard',
    question: 'Нужно собирать поток кликов с сайта, отдавать его трём независимым командам (аналитика, антифрод, рекомендации), а новые потребители должны уметь перечитать последние 7 дней истории. Какой инструмент подходит и почему?',
    options: [
      'Celery: каждая команда получит собственную копию задачи',
      'Redis pub/sub: он доставляет сообщения быстрее всех',
      'RabbitMQ с fanout exchange: он создан для доставки нескольким потребителям',
      'Kafka: лог с retention хранит события 7 дней, независимые consumer groups читают один топик каждая в своём темпе, а новая группа может перечитать историю с начала',
    ],
    correctIndex: 3,
    explanation: 'Требуются сразу три свойства лога: retention (перечитать 7 дней), независимые consumer groups (три команды в своём темпе) и упорядоченный поток. Redis pub/sub доставляет только текущим подписчикам и не хранит историю, fanout в RabbitMQ раздаст копии подписанным очередям, но перечитать прошлое новый потребитель уже не сможет.',
  },
  {
    type: 'code',
    id: 'b30',
    difficulty: 'hard',
    title: 'Идемпотентный потребитель событий',
    description: 'Kafka даёт at-least-once: при ребалансировке или сбое воркера событие может прийти повторно, а обработчик начисляет бонусы — дважды начислять нельзя. Напишите `process_event(event)`: атомарно пометьте `event_id` обработанным в Redis (`SET NX` с TTL 7 дней) и вызывайте `apply_bonus(event)` только если пометка появилась впервые; если начисление упало — снимите пометку, чтобы ретрай не потерял событие. Верните True, если бонус начислен, False — если дубликат.',
    language: 'python',
    starterCode: `import redis

r = redis.Redis(decode_responses=True)
SEEN_TTL = 7 * 24 * 3600

def process_event(event: dict) -> bool:
    # event = {"event_id": "...", "user_id": 1, "amount": 100}
    # TODO: дедупликация по event_id через SET NX + TTL;
    # при ошибке apply_bonus пометку нужно снять
    ...`,
    solution: `import redis

r = redis.Redis(decode_responses=True)
SEEN_TTL = 7 * 24 * 3600

def process_event(event: dict) -> bool:
    key = f"processed:{event['event_id']}"
    # SET NX атомарен: из двух конкурентных доставок одного
    # события пометку поставит ровно одна — она и начислит бонус
    first_time = r.set(key, '1', nx=True, ex=SEEN_TTL)
    if not first_time:
        return False   # дубликат: уже обработано (или обрабатывается)

    try:
        apply_bonus(event)
    except Exception:
        # Начисление не удалось: снимаем пометку, иначе ретрай
        # сочтёт событие обработанным и бонус потеряется навсегда
        r.delete(key)
        raise

    return True`,
    hints: [
      'Ключ-пометка строится из event_id: `r.set(key, \'1\', nx=True, ex=SEEN_TTL)` вернёт True только тому, кто записал её первым, — это и есть атомарная дедупликация без гонок.',
      'TTL нужен, чтобы множество пометок не росло бесконечно: 7 дней с запасом покрывают retention топика — более старое событие просто не может прийти повторно.',
      'Оберните `apply_bonus` в try/except: при ошибке снимите пометку через `r.delete(key)` и пробросьте исключение дальше — иначе упавшее событие навсегда останется числиться «обработанным».',
    ],
  },
]
