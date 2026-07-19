import type { Problem } from '@/types/course'

// Сборник задач: Веб-фреймворки, часть 2
export const problems: Problem[] = [
  {
    type: 'quiz',
    id: 'b1',
    difficulty: 'medium',
    question:
      'API определяет для `/books` только методы `GET` и `POST`. Клиент отправил `DELETE /books`. Что должен вернуть корректно спроектированный сервер?',
    options: [
      '`404 Not Found` — ресурса для DELETE не существует',
      '`400 Bad Request` — запрос сформирован неверно',
      '`405 Method Not Allowed` с заголовком `Allow: GET, POST`',
      '`501 Not Implemented` — метод не реализован на сервере',
    ],
    correctIndex: 2,
    explanation:
      'URL существует, но метод для него не поддерживается — это ровно случай `405`, и стандарт требует перечислить допустимые методы в заголовке `Allow`. `404` неверен: ресурс есть, проблема именно в методе, и клиенту важно это различать.',
  },
  {
    type: 'quiz',
    id: 'b2',
    difficulty: 'medium',
    question:
      'SPA хранит JWT в `localStorage` и подставляет его в заголовок каждого запроса. Какой главный риск у этой схемы?',
    options: [
      '`localStorage` очищается при закрытии вкладки, и пользователь будет разлогинен',
      'Любой XSS-скрипт на странице может прочитать `localStorage` и украсть токен — в отличие от cookie с флагом `httpOnly`',
      'Браузер автоматически отправляет содержимое `localStorage` на другие сайты вместе с запросами',
      '`localStorage` ограничен 4 КБ, поэтому длинные JWT будут обрезаны',
    ],
    correctIndex: 1,
    explanation:
      '`localStorage` полностью доступен из JavaScript, поэтому одна XSS-уязвимость на странице означает кражу токена. Cookie с `httpOnly` скрипту недоступна — за это её и выбирают для хранения токенов, расплачиваясь необходимостью защиты от CSRF. «Автоматически» localStorage никуда не отправляется (это как раз свойство cookie), живёт до явной очистки (а «до закрытия вкладки» — это sessionStorage), и его лимит — порядка мегабайт, а не 4 КБ.',
  },
  {
    type: 'code',
    id: 'b3',
    difficulty: 'medium',
    title: 'Частичное обновление через PATCH и exclude_unset',
    description:
      'Реализуйте эндпоинт `PATCH /tasks/{task_id}` в FastAPI. Модель `TaskUpdate` — все поля опциональны: `title` (непустая строка), `done` (bool), `priority` (int от 1 до 5). Обновляйте только те поля, которые клиент реально прислал, чтобы запрос `{"done": true}` не затирал `title` значением `None`. Если задачи нет — верните `404`.',
    language: 'python',
    starterCode: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

tasks: dict[int, dict] = {
    1: {'id': 1, 'title': 'Написать тесты', 'done': False, 'priority': 3},
}


class TaskUpdate(BaseModel):
    # TODO: все поля опциональны (None по умолчанию), priority от 1 до 5
    ...


# TODO: PATCH /tasks/{task_id} — обновить только присланные клиентом поля`,
    solution: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

tasks: dict[int, dict] = {
    1: {'id': 1, 'title': 'Написать тесты', 'done': False, 'priority': 3},
}


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1)
    done: bool | None = None
    priority: int | None = Field(default=None, ge=1, le=5)


@app.patch('/tasks/{task_id}')
async def update_task(task_id: int, patch: TaskUpdate):
    task = tasks.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail='Task not found')
    task.update(patch.model_dump(exclude_unset=True))
    return task`,
    hints: [
      'Опциональное поле объявляется как `title: str | None = None` — тогда клиент может его не присылать вовсе.',
      '`patch.model_dump(exclude_unset=True)` вернёт словарь только из полей, которые пришли в запросе, — значения по умолчанию в него не попадут.',
      'Достаньте задачу через `tasks.get(task_id)`, при `None` бросьте `HTTPException(status_code=404)`, затем `task.update(patch.model_dump(exclude_unset=True))` и верните задачу.',
    ],
  },
  {
    type: 'quiz',
    id: 'b4',
    difficulty: 'medium',
    question:
      'В DRF для модели пользователя написали `ModelSerializer` с `fields = \'__all__\'`. Какую проблему это создаёт в первую очередь?',
    options: [
      'Сериализатор станет заметно медленнее из-за обработки лишних полей',
      '`__all__` не работает с `ModelSerializer` — поля нужно перечислять только явно',
      'Клиент не сможет создавать пользователей: поле `id` станет обязательным',
      'В ответы API утекут служебные поля вроде хэша пароля, а при записи клиент сможет менять `is_staff`',
    ],
    correctIndex: 3,
    explanation:
      '`__all__` включает в API все поля модели — и на чтение (утечка `password`), и на запись (массовое присваивание `is_staff`). Замедление здесь второстепенно: главная проблема — безопасность, поэтому поля перечисляют явно и помечают служебные как `read_only`.',
  },
  {
    type: 'code',
    id: 'b5',
    difficulty: 'medium',
    title: 'Условный GET с ETag: экономим трафик',
    description:
      'Запишите HTTP-обмен из четырёх сообщений: 1) первый `GET /api/articles/7` и ответ `200` с заголовком `ETag: "v3"` и небольшим JSON-телом; 2) повторный `GET` того же ресурса, в котором клиент присылает сохранённый ETag в условном заголовке, и ответ сервера **без тела**, раз ресурс не изменился. Укажите правильные заголовки и статус-коды.',
    language: 'http',
    starterCode: `GET /api/articles/7 HTTP/1.1
Host: api.example.com
Accept: application/json

# TODO: ответ 200 с ETag, повторный запрос с условным заголовком и ответ без тела`,
    solution: `GET /api/articles/7 HTTP/1.1
Host: api.example.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json
ETag: "v3"

{"id": 7, "title": "HTTP-кэширование", "version": 3}

GET /api/articles/7 HTTP/1.1
Host: api.example.com
Accept: application/json
If-None-Match: "v3"

HTTP/1.1 304 Not Modified
ETag: "v3"`,
    hints: [
      'Сервер отдаёт версию ресурса в заголовке `ETag`, а клиент сохраняет её и присылает обратно в заголовке `If-None-Match`.',
      'Если ETag совпал, серверу незачем слать тело: клиент использует свою закэшированную копию.',
      'Последний ответ — `304 Not Modified` без тела; в повторном запросе должно быть `If-None-Match: "v3"`.',
    ],
  },
  {
    type: 'quiz',
    id: 'b6',
    difficulty: 'medium',
    question:
      'В FastAPI зависимость-генератор выдаёт сессию БД через `yield`, а в блоке `finally` закрывает её. Когда выполнится код после `yield`?',
    options: [
      'После того как эндпоинт отработал — даже если он бросил исключение',
      'Сразу после того, как значение зависимости передано в эндпоинт',
      'Только при остановке приложения, вместе с lifespan',
      'Никогда: FastAPI игнорирует код после `yield` в зависимостях',
    ],
    correctIndex: 0,
    explanation:
      'Код после `yield` — это teardown: FastAPI выполняет его после завершения эндпоинта, а `finally` гарантирует закрытие сессии даже при исключении. Вариант «сразу после передачи значения» сломал бы саму идею: сессия закрылась бы до того, как эндпоинт ей воспользовался.',
  },
  {
    type: 'quiz',
    id: 'b7',
    difficulty: 'medium',
    question:
      'В Django-вью выполняется цикл: `for a in Article.objects.all(): print(a.author.name)`. В таблице 100 статей разных авторов. Сколько SQL-запросов уйдёт в базу?',
    options: [
      '1 — Django автоматически сделает JOIN с таблицей авторов',
      '2 — один за статьями и один за всеми авторами сразу',
      '101 — один за статьями и по одному за автором каждой статьи',
      '100 — по одному запросу на каждую статью вместе с её автором',
    ],
    correctIndex: 2,
    explanation:
      'ORM ленив: `objects.all()` — один запрос, а каждое обращение к `a.author` вынуждает отдельный запрос за связанным объектом — это и есть проблема N+1. Автоматического JOIN нет: его нужно попросить явно через `select_related(\'author\')`, только тогда запрос станет один.',
  },
  {
    type: 'code',
    id: 'b8',
    difficulty: 'medium',
    title: 'Право доступа IsOwnerOrReadOnly для DRF',
    description:
      'Напишите класс разрешения `IsOwnerOrReadOnly` для Django REST Framework: безопасные методы (`GET`, `HEAD`, `OPTIONS`) разрешены всем, а изменять или удалять объект может только его владелец (`obj.owner == request.user`). Подключите его к `ArticleViewSet` вместе с `IsAuthenticatedOrReadOnly` и позаботьтесь, чтобы при создании статьи владелец проставлялся автоматически.',
    language: 'python',
    starterCode: `from rest_framework import permissions, viewsets

from .models import Article
from .serializers import ArticleSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    # TODO: has_object_permission — чтение всем, запись только владельцу
    ...


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related('owner')
    serializer_class = ArticleSerializer
    # TODO: permission_classes и автопростановка владельца`,
    solution: `from rest_framework import permissions, viewsets

from .models import Article
from .serializers import ArticleSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    message = 'Изменять статью может только её автор.'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related('owner')
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)`,
    hints: [
      'Наследуйтесь от `permissions.BasePermission` и переопределите `has_object_permission(self, request, view, obj)`.',
      'Безопасные методы уже собраны в наборе `permissions.SAFE_METHODS` — если метод в нём, сразу верните `True`; иначе верните `obj.owner == request.user`.',
      'В `permission_classes` перечислите оба класса, а владельца проставляйте в `perform_create`: `serializer.save(owner=self.request.user)`.',
    ],
  },
  {
    type: 'quiz',
    id: 'b9',
    difficulty: 'medium',
    question:
      'Вам нужно добавить в REST API операцию «опубликовать черновик статьи». Какой дизайн эндпоинта лучший?',
    options: [
      '`POST /articles/42/publish` — действие оформлено как под-ресурс статьи',
      '`GET /articles/publish?id=42` — просто и легко проверить из браузера',
      '`POST /publishArticle` с `{"id": 42}` в теле — имя сразу говорит, что делает эндпоинт',
      '`DELETE /drafts/42` — публикация означает, что черновик исчезает',
    ],
    correctIndex: 0,
    explanation:
      '`POST /articles/42/publish` сохраняет ресурсную структуру URL и честно использует небезопасный метод для действия с побочным эффектом. `GET` для публикации — худший вариант: GET обязан быть безопасным, иначе статью «опубликует» прокси-кэш или префетчер браузера.',
  },
  {
    type: 'code',
    id: 'b10',
    difficulty: 'medium',
    title: 'JSON-ответ списка с cursor-пагинацией',
    description:
      'Составьте JSON-ответ эндпоинта `GET /api/orders?limit=2&cursor=abc123`: массив `items` из двух заказов (у каждого поля `id` — число, `status` — строка, `total` — число) и объект `page_info` с полями `next_cursor` (непрозрачная строка для запроса следующей страницы) и `has_next` со значением `true`. Следите за валидностью JSON: двойные кавычки, без завершающих запятых и комментариев.',
    language: 'json',
    starterCode: `{
  "items": [
    { "id": 101, "status": "paid", "total": 4990 }
  ]
}`,
    solution: `{
  "items": [
    { "id": 101, "status": "paid", "total": 4990 },
    { "id": 102, "status": "pending", "total": 1250 }
  ],
  "page_info": {
    "next_cursor": "b3JkZXI6MTAy",
    "has_next": true
  }
}`,
    hints: [
      'Верхний уровень — объект с двумя ключами: `items` (массив из двух объектов) и `page_info` (объект).',
      'В JSON ключи и строки только в двойных кавычках, `true` пишется без кавычек, а запятая после последнего элемента — синтаксическая ошибка.',
      '`next_cursor` — любая непрозрачная строка (на практике часто base64 от id последнего элемента), а `has_next: true` говорит клиенту, что можно запрашивать дальше.',
    ],
  },
  {
    type: 'quiz',
    id: 'b11',
    difficulty: 'medium',
    question:
      'SPA делает `fetch` с `credentials: \'include\'` на API другого домена. Сервер отвечает `Access-Control-Allow-Origin: *`, но браузер всё равно блокирует ответ. В чём дело?',
    options: [
      'Нужно добавить `Access-Control-Allow-Credentials: true`, а `*` в Allow-Origin можно оставить',
      'CORS с куками невозможен в принципе — придётся переносить API на тот же домен',
      'Браузер блокирует любые кросс-доменные запросы с куками, пока пользователь их не разрешит',
      'При запросах с credentials wildcard запрещён: сервер должен вернуть конкретный Origin и `Access-Control-Allow-Credentials: true`',
    ],
    correctIndex: 3,
    explanation:
      'Спецификация CORS запрещает сочетание credentials и `Allow-Origin: *`: сервер обязан отразить конкретный Origin (например, `https://app.example.com`) и добавить `Access-Control-Allow-Credentials: true`. Первый вариант не сработает именно потому, что wildcard останется.',
  },
  {
    type: 'quiz',
    id: 'b12',
    difficulty: 'medium',
    question:
      'Тест FastAPI падает: `client.post(\'/items\', data={\'name\': \'Кофе\'})` возвращает `422`, хотя эндпоинт принимает Pydantic-модель с единственным полем `name`. Найдите ошибку.',
    options: [
      'Не хватает вызова `client.headers.update({\'Accept\': \'application/json\'})` перед запросом',
      '`data=` отправляет тело как HTML-форму, а эндпоинт ждёт JSON — нужно передать `json={\'name\': \'Кофе\'}`',
      'TestClient не умеет POST-запросы с телом — нужен `httpx.AsyncClient`',
      'Pydantic-модель требует передать все поля, включая необязательные',
    ],
    correctIndex: 1,
    explanation:
      'Параметр `data=` кодирует тело как `application/x-www-form-urlencoded`, и FastAPI не находит ожидаемый JSON-объект — отсюда `422`. Параметр `json=` сам сериализует словарь и поставит `Content-Type: application/json`; заголовок `Accept` на разбор тела запроса вообще не влияет.',
  },
  {
    type: 'quiz',
    id: 'b13',
    difficulty: 'hard',
    question:
      'Пользователя нужно заблокировать немедленно, но ваши access-JWT живут 24 часа и нигде не хранятся на сервере. Какое решение проблемы отзыва выбрать на будущее?',
    options: [
      'Сменить секрет подписи JWT — скомпрометированные токены сразу станут недействительными',
      'Хранить все выданные JWT в базе и сверять каждый запрос с этим списком',
      'Сократить срок жизни access-токена до минут и выдавать refresh-токен, который хранится на сервере и может быть отозван',
      'Добавить в payload токена поле `revoked: false` и менять его при блокировке',
    ],
    correctIndex: 2,
    explanation:
      'Короткоживущий access плюс отзываемый серверный refresh — стандартный компромисс: окно уязвимости сжимается до минут, а блокировка — это удаление refresh-токена. Смена секрета «разлогинит» всех пользователей сразу, а поменять payload уже выданного токена невозможно — он подписан.',
  },
  {
    type: 'code',
    id: 'b14',
    difficulty: 'hard',
    title: 'Middleware: время обработки и X-Request-ID',
    description:
      'Напишите HTTP-middleware для FastAPI через декоратор `@app.middleware(\'http\')`: 1) если клиент не прислал заголовок `X-Request-ID`, сгенерируйте его через `uuid4`; 2) замерьте время обработки запроса и добавьте в ответ заголовки `X-Process-Time` (секунды, 4 знака после запятой) и `X-Request-ID`. Middleware должен просто передавать запрос дальше, ничего не ломая в обработке ошибок.',
    language: 'python',
    starterCode: `import time
import uuid

from fastapi import FastAPI, Request

app = FastAPI()


# TODO: @app.middleware('http') — добавить X-Request-ID и X-Process-Time


@app.get('/ping')
async def ping():
    return {'status': 'ok'}`,
    solution: `import time
import uuid

from fastapi import FastAPI, Request

app = FastAPI()


@app.middleware('http')
async def add_observability_headers(request: Request, call_next):
    request_id = request.headers.get('X-Request-ID') or str(uuid.uuid4())
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    response.headers['X-Process-Time'] = f'{elapsed:.4f}'
    response.headers['X-Request-ID'] = request_id
    return response


@app.get('/ping')
async def ping():
    return {'status': 'ok'}`,
    hints: [
      'Сигнатура middleware: `async def mw(request: Request, call_next)` — внутри обязательно `await call_next(request)`, и полученный response нужно вернуть.',
      'Для замера времени берите `time.perf_counter()` до и после `call_next` — в отличие от `time.time()` он монотонный.',
      'Заголовки дописываются в `response.headers[...]` после `call_next`; request id: `request.headers.get(\'X-Request-ID\') or str(uuid.uuid4())`.',
    ],
  },
  {
    type: 'quiz',
    id: 'b15',
    difficulty: 'hard',
    question:
      'Эндпоинт FastAPI объявлен обычной `def`-функцией (без `async`) и внутри делает блокирующий `requests.get` на 2 секунды. Почему под нагрузкой event loop не «замерзает», как это случилось бы с `async def`?',
    options: [
      'FastAPI автоматически подменяет requests на асинхронный httpx',
      '`def`-эндпоинты FastAPI выполняет в пуле потоков, поэтому event loop продолжает обслуживать другие запросы',
      'Блокирующие вызовы внутри `def` FastAPI прерывает по собственному таймауту',
      'Event loop замерзает в обоих случаях — разницы между `def` и `async def` нет',
    ],
    correctIndex: 1,
    explanation:
      'Синхронные эндпоинты Starlette отправляет в threadpool (`run_in_threadpool`), так что блокировка занимает поток из пула, а не сам event loop. Никакой подмены библиотек не происходит — и помните, что пул ограничен: при десятках одновременных блокирующих запросов упрётесь уже в него.',
  },
  {
    type: 'code',
    id: 'b16',
    difficulty: 'hard',
    title: 'Идемпотентный POST с Idempotency-Key',
    description:
      'Клиент создаёт платёж, но ответ теряется из-за обрыва сети, и клиент повторяет запрос. Запишите HTTP-обмен: 1) `POST /api/payments` с заголовком `Idempotency-Key` и JSON-телом (`amount`, `currency`), ответ `201 Created` с заголовком `Location` и телом платежа; 2) повторный точно такой же запрос с тем же ключом — сервер не создаёт второй платёж, а возвращает сохранённый результат с тем же `id`.',
    language: 'http',
    starterCode: `POST /api/payments HTTP/1.1
Host: api.example.com
Content-Type: application/json

# TODO: заголовок Idempotency-Key, тело, ответ 201, повторный запрос и его ответ`,
    solution: `POST /api/payments HTTP/1.1
Host: api.example.com
Content-Type: application/json
Idempotency-Key: 3f2a9c4e-8b1d-4f6a-9e0c-5d7b2a1c8e4f

{"amount": 4990, "currency": "RUB"}

HTTP/1.1 201 Created
Location: /api/payments/551
Content-Type: application/json

{"id": 551, "amount": 4990, "currency": "RUB", "status": "created"}

POST /api/payments HTTP/1.1
Host: api.example.com
Content-Type: application/json
Idempotency-Key: 3f2a9c4e-8b1d-4f6a-9e0c-5d7b2a1c8e4f

{"amount": 4990, "currency": "RUB"}

HTTP/1.1 200 OK
Content-Type: application/json
Idempotency-Replayed: true

{"id": 551, "amount": 4990, "currency": "RUB", "status": "created"}`,
    hints: [
      '`Idempotency-Key` — уникальный ключ операции: клиент генерирует его один раз (обычно UUID) и повторяет при ретраях того же действия.',
      'Первый ответ — `201 Created` с заголовком `Location: /api/payments/<id>` и телом созданного платежа.',
      'На повтор с тем же ключом сервер возвращает сохранённый результат с тем же `id` (обычно со статусом `200`) — второй платёж не создаётся.',
    ],
  },
  {
    type: 'quiz',
    id: 'b17',
    difficulty: 'hard',
    question:
      'Django-вью читает кошелёк (`Wallet.objects.get(...)`), проверяет `wallet.balance >= amount` и сохраняет уменьшенный баланс. Два параллельных запроса иногда списывают больше, чем есть на счёте. Какое исправление правильное?',
    options: [
      'Обернуть операцию в `transaction.atomic()` и читать кошелёк через `select_for_update()`, чтобы вторая транзакция ждала первую',
      'Достаточно обернуть код в `transaction.atomic()` — транзакция сама изолирует параллельные запросы',
      'Добавить случайную задержку `time.sleep` перед сохранением, чтобы запросы не совпадали по времени',
      'Вынести проверку баланса на фронтенд, чтобы второй запрос вообще не отправлялся',
    ],
    correctIndex: 0,
    explanation:
      '`select_for_update()` берёт блокировку строки до конца транзакции: второй запрос дождётся коммита первого и увидит уже обновлённый баланс. Один `atomic()` не спасает — на уровне изоляции READ COMMITTED обе транзакции спокойно прочитают старое значение, и обе проверки пройдут.',
  },
  {
    type: 'quiz',
    id: 'b18',
    difficulty: 'hard',
    question:
      'После оформления заказа нужно сгенерировать PDF-счёт (около 30 секунд CPU) и отправить его на почту. Кандидаты: FastAPI `BackgroundTasks` или отдельная очередь задач (Celery/RQ). Что выбрать и почему?',
    options: [
      '`BackgroundTasks` — он ровно для того и создан, чтобы выполнять фоновую работу после ответа',
      'Ни то ни другое: тяжёлую работу нужно делать прямо в эндпоинте, чтобы клиент дождался результата',
      '`BackgroundTasks`, но обязательно внутри `async def` — тогда генерация PDF не нагрузит процесс',
      'Очередь задач: `BackgroundTasks` живёт в процессе API — задача потеряется при рестарте, а 30 секунд CPU задушат воркер',
    ],
    correctIndex: 3,
    explanation:
      '`BackgroundTasks` годится для быстрых некритичных действий (лог, короткое письмо): у него нет ретраев и персистентности, задача умирает вместе с процессом при деплое, а тяжёлый CPU-код заблокирует воркер API. Отдельная очередь даёт ретраи, надёжность и изоляцию нагрузки.',
  },
  {
    type: 'code',
    id: 'b19',
    difficulty: 'hard',
    title: 'Убираем N+1 и считаем комментарии в базе',
    description:
      'Эндпоинт списка статей тормозит: на 200 статей уходит больше 400 SQL-запросов. Для каждой статьи в ответ идут `author.username`, список названий тегов и число комментариев. Перепишите `get_articles_data`, чтобы функция делала фиксированное число запросов (2-3): подгрузите автора и теги заранее, а комментарии посчитайте агрегатом в базе.',
    language: 'python',
    starterCode: `from django.db.models import Count

from .models import Article


def get_articles_data():
    data = []
    for article in Article.objects.all():
        data.append({
            'title': article.title,
            'author': article.author.username,             # +1 запрос на статью
            'tags': [t.name for t in article.tags.all()],  # +1 запрос на статью
            'comments': article.comments.count(),          # +1 запрос на статью
        })
    return data

# TODO: перепишите с select_related, prefetch_related и annotate`,
    solution: `from django.db.models import Count

from .models import Article


def get_articles_data():
    articles = (
        Article.objects
        .select_related('author')
        .prefetch_related('tags')
        .annotate(comments_count=Count('comments'))
    )
    return [
        {
            'title': article.title,
            'author': article.author.username,
            'tags': [t.name for t in article.tags.all()],
            'comments': article.comments_count,
        }
        for article in articles
    ]`,
    hints: [
      'Здесь три источника лишних запросов: ForeignKey `author`, ManyToMany `tags` и `comments.count()` в цикле — у каждого своё лекарство.',
      'Для ForeignKey — `select_related(\'author\')` (JOIN в том же запросе), для ManyToMany — `prefetch_related(\'tags\')` (один дополнительный запрос с IN).',
      '`annotate(comments_count=Count(\'comments\'))` посчитает комментарии одним GROUP BY; в цикле обращайтесь к `article.comments_count` вместо `article.comments.count()`.',
    ],
  },
  {
    type: 'quiz',
    id: 'b20',
    difficulty: 'hard',
    question:
      'Эндпоинт отдаёт CSV-выгрузку на 2 ГБ: читает файл целиком в строку и возвращает её в `Response`. На проде процесс убивает OOM-killer. Как правильно отдавать такие файлы из FastAPI?',
    options: [
      'Поднять лимит памяти контейнера до 4 ГБ, чтобы файл гарантированно помещался',
      'Использовать `StreamingResponse` или `FileResponse` — файл уходит клиенту по частям, не загружаясь в память целиком',
      'Сжать файл в gzip внутри эндпоинта — в память попадёт заметно меньше данных',
      'Вернуть файл через `JSONResponse`, разбив содержимое на массив строк',
    ],
    correctIndex: 1,
    explanation:
      '`FileResponse` и `StreamingResponse` отправляют данные чанками: в памяти держится небольшой буфер, а не весь файл. Поднятие лимита памяти — гонка с размером выгрузки и числом параллельных скачиваний: два клиента одновременно — и OOM вернётся.',
  },
  {
    type: 'code',
    id: 'b21',
    difficulty: 'hard',
    title: 'Фабрика зависимостей require_role',
    description:
      'В приложении уже есть зависимость `get_current_user`, возвращающая пользователя с полем `role`. Напишите фабрику `require_role(*roles)`: она возвращает зависимость, которая пропускает пользователя, только если его роль входит в `roles`, иначе поднимает `403`. Примените её к двум эндпоинтам: `GET /admin/stats` (только `admin`) и `POST /articles` (роли `admin` и `editor`).',
    language: 'python',
    starterCode: `from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException

app = FastAPI()


class User:
    def __init__(self, username: str, role: str):
        self.username = username
        self.role = role


async def get_current_user() -> User:
    # Упрощение: в реальном коде здесь был бы разбор JWT
    return User(username='alice', role='editor')


# TODO: def require_role(*roles) — вернуть зависимость с проверкой роли


# TODO: GET /admin/stats (только admin) и POST /articles (admin или editor)`,
    solution: `from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException

app = FastAPI()


class User:
    def __init__(self, username: str, role: str):
        self.username = username
        self.role = role


async def get_current_user() -> User:
    # Упрощение: в реальном коде здесь был бы разбор JWT
    return User(username='alice', role='editor')


def require_role(*roles: str):
    async def checker(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail='Недостаточно прав.')
        return user

    return checker


@app.get('/admin/stats')
async def admin_stats(user: Annotated[User, Depends(require_role('admin'))]):
    return {'requested_by': user.username}


@app.post('/articles', status_code=201)
async def create_article(
    user: Annotated[User, Depends(require_role('admin', 'editor'))],
):
    return {'created_by': user.username}`,
    hints: [
      'Это замыкание: внешняя функция принимает роли и возвращает внутреннюю async-функцию, которую вы передаёте в `Depends(...)`.',
      'Внутренняя функция сама объявляет зависимость `user: Annotated[User, Depends(get_current_user)]` — FastAPI разрешит цепочку зависимостей автоматически.',
      'Если `user.role not in roles` — `raise HTTPException(status_code=403)`; иначе верните пользователя, чтобы эндпоинт мог с ним работать.',
    ],
  },
  {
    type: 'quiz',
    id: 'b22',
    difficulty: 'hard',
    question:
      'В FastAPI подряд вызвали `app.add_middleware(A)`, затем `app.add_middleware(B)`. В каком порядке A и B обработают входящий запрос?',
    options: [
      'Сначала B, потом A: каждый `add_middleware` оборачивает приложение снаружи, поэтому добавленный последним стоит первым',
      'Сначала A, потом B — строго в порядке вызовов `add_middleware`',
      'Порядок недетерминирован и зависит от планировщика event loop',
      'Параллельно: каждый middleware получает собственную копию запроса',
    ],
    correctIndex: 0,
    explanation:
      'Middleware в Starlette — «луковица»: каждый новый слой оборачивает предыдущие снаружи, поэтому запрос идёт B → A → роутер, а ответ разворачивается в обратном порядке. Интуиция «в порядке добавления» верна для списка `MIDDLEWARE` в Django, но не для `add_middleware`.',
  },
  {
    type: 'code',
    id: 'b23',
    difficulty: 'hard',
    title: 'Параметризованные тесты границ валидации',
    description:
      'Эндпоинт `GET /products` принимает query-параметр `limit` (int от 1 до 50, по умолчанию 10). Напишите pytest-тесты с `@pytest.mark.parametrize`: 1) валидные границы `1` и `50` дают `200` и не больше `limit` элементов; 2) невалидные `0`, `51` и `abc` дают `422`; 3) запрос без параметра — `200` и не больше 10 элементов. Не пишите шесть почти одинаковых тестов — сведите всё к двум параметризованным и одному обычному.',
    language: 'python',
    starterCode: `import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

# TODO: test_limit_valid_boundaries (parametrize: 1, 50)
# TODO: test_limit_invalid_values (parametrize: 0, 51, 'abc')
# TODO: test_limit_default`,
    solution: `import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.mark.parametrize('limit', [1, 50])
def test_limit_valid_boundaries(limit):
    response = client.get('/products', params={'limit': limit})
    assert response.status_code == 200
    assert len(response.json()) <= limit


@pytest.mark.parametrize('limit', [0, 51, 'abc'])
def test_limit_invalid_values(limit):
    response = client.get('/products', params={'limit': limit})
    assert response.status_code == 422


def test_limit_default():
    response = client.get('/products')
    assert response.status_code == 200
    assert len(response.json()) <= 10`,
    hints: [
      '`@pytest.mark.parametrize(\'limit\', [1, 50])` запустит один и тот же тест по разу на каждое значение.',
      'Query-параметры передавайте через `client.get(\'/products\', params={\'limit\': limit})` — строка `abc` уйдёт как есть и провалит валидацию int.',
      'Это классический boundary testing: последние валидные значения (1, 50) должны давать `200`, первые невалидные (0, 51) — `422`.',
    ],
  },
  {
    type: 'quiz',
    id: 'b24',
    difficulty: 'hard',
    question:
      'Тест с `@pytest.mark.django_db` проверяет код, который регистрирует хук `transaction.on_commit(callback)`. Тест проходит, но `callback` так и не выполняется. Почему?',
    options: [
      '`on_commit` работает только на проде — в тестовом режиме Django его отключает',
      'Callback выполняется в отдельном потоке, и тест завершается раньше него',
      'Обычный тест выполняется внутри транзакции, которую в конце откатывают — коммита нет, поэтому нужен `django_db(transaction=True)` или `captureOnCommitCallbacks`',
      'Нужно вручную вызвать `transaction.commit()` в конце теста',
    ],
    correctIndex: 2,
    explanation:
      'Ради скорости pytest-django оборачивает каждый тест в транзакцию и делает rollback — настоящего COMMIT не происходит, значит и хуки `on_commit` не срабатывают. `transaction=True` включает реальные коммиты (медленнее), а `captureOnCommitCallbacks` позволяет проверить хуки без них.',
  },
  {
    type: 'code',
    id: 'b25',
    difficulty: 'hard',
    title: 'Тело ошибки в формате Problem Details (RFC 7807)',
    description:
      'Клиент отправил заказ с отрицательным количеством товара и пустым адресом доставки. Составьте JSON-тело ответа `422` в формате **Problem Details** (`Content-Type: application/problem+json`): стандартные поля `type` (URI описания ошибки), `title`, `status`, `detail`, `instance` (путь запроса `/api/orders`) плюс расширение `errors` — массив объектов с `field` и `message` для каждого невалидного поля (`quantity` и `address`).',
    language: 'json',
    starterCode: `{
  "type": "https://api.example.com/errors/validation",
  "title": "Ошибка валидации запроса"
}`,
    solution: `{
  "type": "https://api.example.com/errors/validation",
  "title": "Ошибка валидации запроса",
  "status": 422,
  "detail": "Два поля заказа не прошли проверку.",
  "instance": "/api/orders",
  "errors": [
    { "field": "quantity", "message": "Количество должно быть больше нуля." },
    { "field": "address", "message": "Адрес доставки не может быть пустым." }
  ]
}`,
    hints: [
      'Пять стандартных полей RFC 7807: `type`, `title`, `status`, `detail`, `instance` — а свои расширения (как `errors`) кладут рядом с ними.',
      '`status` — число без кавычек, совпадающее со статус-кодом ответа; `instance` — путь конкретного запроса.',
      '`errors` — массив из двух объектов вида `{"field": "quantity", "message": "..."}` — по одному на каждое невалидное поле.',
    ],
  },
  {
    type: 'quiz',
    id: 'b26',
    difficulty: 'hard',
    question: 'Чем директива `Cache-Control: no-cache` отличается от `Cache-Control: no-store`?',
    options: [
      'Ничем — это синонимы, просто `no-store` появился в HTTP позже',
      '`no-cache` полностью запрещает сохранять ответ, а `no-store` разрешает хранить, но требует ревалидацию',
      '`no-cache` действует только на браузеры, а `no-store` — только на CDN и прокси',
      '`no-cache` разрешает хранить ответ, но требует ревалидации перед каждым использованием, а `no-store` запрещает сохранять его вообще',
    ],
    correctIndex: 3,
    explanation:
      'Название обманчиво: `no-cache` означает «хранить можно, но перед использованием сверься с сервером» (условный запрос с ETag), а `no-store` — «не записывать ответ ни в какой кэш» (для чувствительных данных). Второй вариант — те же определения, но перепутанные местами.',
  },
  {
    type: 'code',
    id: 'b27',
    difficulty: 'hard',
    title: 'Lifespan: общий httpx.AsyncClient на всё приложение',
    description:
      'В коде антипаттерн: эндпоинт создаёт `httpx.AsyncClient()` на каждый запрос, поэтому TCP-соединения не переиспользуются. Перепишите приложение: создайте клиент один раз в `lifespan` (через `@asynccontextmanager`), положите его в `app.state.http`, корректно закройте при остановке, а в эндпоинте `GET /repos/{owner}` используйте общий клиент из `request.app.state.http`.',
    language: 'python',
    starterCode: `import httpx
from fastapi import FastAPI, Request

app = FastAPI()


@app.get('/repos/{owner}')
async def list_repos(owner: str):
    # Антипаттерн: новый клиент (и новые соединения) на каждый запрос
    async with httpx.AsyncClient(base_url='https://api.github.com') as client:
        response = await client.get(f'/users/{owner}/repos')
    return response.json()

# TODO: перенесите клиент в lifespan и app.state`,
    solution: `from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(base_url='https://api.github.com')
    try:
        yield
    finally:
        await app.state.http.aclose()


app = FastAPI(lifespan=lifespan)


@app.get('/repos/{owner}')
async def list_repos(owner: str, request: Request):
    client: httpx.AsyncClient = request.app.state.http
    response = await client.get(f'/users/{owner}/repos')
    return response.json()`,
    hints: [
      '`lifespan` — асинхронный контекст-менеджер: код до `yield` выполняется при старте приложения, код после — при остановке.',
      'Сохраните клиент в `app.state.http` — это стандартное место для долгоживущих ресурсов; сам lifespan передаётся в конструктор: `FastAPI(lifespan=lifespan)`.',
      'В эндпоинте добавьте параметр `request: Request` и берите клиент из `request.app.state.http`; при остановке закройте его через `await client.aclose()` в `finally`.',
    ],
  },
  {
    type: 'quiz',
    id: 'b28',
    difficulty: 'hard',
    question:
      'Дана Pydantic-модель: `class Cart(BaseModel): items: list[str] = []`. Выполняем: `a = Cart(); a.items.append(\'книга\'); b = Cart(); print(b.items)`. Что выведет код?',
    options: [
      '`[\'книга\']` — классическая ловушка общего мутабельного значения по умолчанию',
      '`[]` — Pydantic копирует значение по умолчанию для каждого экземпляра, в отличие от обычных классов Python',
      'Код упадёт при объявлении модели: Pydantic запрещает мутабельные значения по умолчанию',
      'Код упадёт на `append`: поля Pydantic-моделей неизменяемы',
    ],
    correctIndex: 1,
    explanation:
      'Pydantic делает глубокую копию дефолта при создании каждого экземпляра, поэтому `b.items` — новый пустой список. Ловушка «общего списка» относится к обычным атрибутам классов и аргументам функций Python; перенос этой интуиции на Pydantic и есть главный дистрактор.',
  },
  {
    type: 'code',
    id: 'b29',
    difficulty: 'hard',
    title: 'Кастомное действие publish во ViewSet',
    description:
      'Добавьте в `ArticleViewSet` действие `POST /articles/{id}/publish/` через декоратор `@action`: оно доступно только аутентифицированным пользователям; публиковать можно лишь черновик (`status == \'draft\'`), иначе верните `409` с пояснением. При успехе установите `status=\'published\'` и `published_at=timezone.now()`, сохраните только изменённые поля и верните сериализованную статью.',
    language: 'python',
    starterCode: `from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Article
from .serializers import ArticleSerializer


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

    # TODO: @action publish — POST /articles/{id}/publish/`,
    solution: `from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Article
from .serializers import ArticleSerializer


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated],
    )
    def publish(self, request, pk=None):
        article = self.get_object()
        if article.status != 'draft':
            return Response(
                {'detail': 'Опубликовать можно только черновик.'},
                status=status.HTTP_409_CONFLICT,
            )
        article.status = 'published'
        article.published_at = timezone.now()
        article.save(update_fields=['status', 'published_at'])
        serializer = self.get_serializer(article)
        return Response(serializer.data)`,
    hints: [
      '`@action(detail=True, methods=[\'post\'])` создаёт маршрут `/articles/{pk}/publish/` — имя метода становится частью URL; права задаются там же через `permission_classes`.',
      'Объект получайте через `self.get_object()` — он учитывает queryset и проверки прав; для отказа верните `Response({...}, status=status.HTTP_409_CONFLICT)`.',
      'После смены статуса сохраняйте точечно: `article.save(update_fields=[\'status\', \'published_at\'])`, затем верните `self.get_serializer(article).data`.',
    ],
  },
  {
    type: 'quiz',
    id: 'b30',
    difficulty: 'hard',
    question:
      'Rate-limiter вашего API хранит счётчики запросов в обычном словаре Python внутри процесса. Локально всё работает, но на проде под `uvicorn --workers 4` лимиты «пробиваются» примерно в 4 раза. В чём причина и как чинить?',
    options: [
      'Каждый воркер — отдельный процесс со своим словарём; счётчики нужно вынести во внешнее хранилище вроде Redis',
      'Словарь Python не потокобезопасен — достаточно обернуть счётчики в `threading.Lock`',
      'GIL мешает воркерам синхронизировать память — нужно запускать один воркер с большим числом потоков',
      'Проблема в балансировщике: включите sticky sessions, и словари воркеров согласуются',
    ],
    correctIndex: 0,
    explanation:
      'Флаг `--workers 4` запускает четыре независимых процесса: у каждого своя память, и каждый считает лимит «с нуля» — отсюда четырёхкратное превышение. `Lock` решает гонки потоков внутри одного процесса, но не объединяет память разных процессов; общий счётчик держат в Redis (например, `INCR` с TTL).',
  },
]

