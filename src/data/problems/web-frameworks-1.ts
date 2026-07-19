import type { Problem } from '@/types/course'

// Сборник задач: Веб-фреймворки, часть 1
export const problems: Problem[] = [
  {
    type: 'quiz',
    id: 'a1',
    difficulty: 'easy',
    question: 'Что означает статус-код **204 No Content** в ответе API?',
    options: [
      'Запрос успешно обработан, и тело ответа намеренно пустое',
      'Ресурс не найден, поэтому серверу нечего вернуть',
      'Запрос принят в обработку, но результат ещё не готов',
      'Сервер вернул ошибку, но не смог сформировать её описание',
    ],
    correctIndex: 0,
    explanation:
      '204 — успешный ответ из группы 2xx, который по стандарту не содержит тела; типичный случай — успешный `DELETE`. «Принят, но ещё не обработан» — это 202 Accepted, а «не найден» — 404.',
  },
  {
    type: 'quiz',
    id: 'a2',
    difficulty: 'easy',
    question:
      'Вы проектируете REST API интернет-магазина. Какой URL лучше всего подходит для получения списка заказов пользователя с id 5?',
    options: [
      '`GET /getOrders?userId=5`',
      '`GET /users/5/orders`',
      '`POST /orders/findByUser` с телом `{"userId": 5}`',
      '`GET /orders/user/5/list`',
    ],
    correctIndex: 1,
    explanation:
      'REST строится вокруг существительных и вложенности ресурсов: `/users/5/orders` читается как «заказы пользователя 5». Глаголы в URL (`getOrders`, `findByUser`) — антипаттерн: действие уже выражено HTTP-методом.',
  },
  {
    type: 'code',
    id: 'a3',
    difficulty: 'easy',
    title: 'GET-запрос списка с пагинацией',
    description:
      'Составьте «сырой» HTTP-запрос: получить **вторую** страницу списка товаров `/api/v1/products` по 20 элементов на страницу (query-параметры `page` и `limit`). Хост — `shop.example.com`, клиент ожидает JSON.',
    language: 'http',
    starterCode: `GET /api/v1/products??? HTTP/1.1
Host: ???
???: application/json`,
    solution: `GET /api/v1/products?page=2&limit=20 HTTP/1.1
Host: shop.example.com
Accept: application/json`,
    hints: [
      'Query-параметры дописываются к пути после знака ?, а между собой разделяются символом &.',
      'Формат, который клиент хочет получить в ответе, задаёт заголовок Accept (Content-Type описывает тело запроса, а у GET его нет).',
      'Первая строка: GET /api/v1/products?page=2&limit=20 HTTP/1.1, затем Host и Accept: application/json.',
    ],
  },
  {
    type: 'quiz',
    id: 'a4',
    difficulty: 'easy',
    question: 'Чем `PATCH` отличается от `PUT` при обновлении ресурса?',
    options: [
      '`PATCH` создаёт ресурс, если его нет, а `PUT` — никогда',
      '`PATCH` работает быстрее, потому что сервер не валидирует данные',
      '`PATCH` передаёт только изменяемые поля, а `PUT` — полное новое представление ресурса',
      'Разницы нет: по стандарту эти методы взаимозаменяемы',
    ],
    correctIndex: 2,
    explanation:
      '`PUT` заменяет ресурс целиком — не переданные поля считаются сброшенными, а `PATCH` вносит частичные изменения только в указанные поля. Скорость и строгость валидации от выбора метода не зависят.',
  },
  {
    type: 'code',
    id: 'a5',
    difficulty: 'easy',
    title: 'JSON-формат ошибки валидации',
    description:
      'API отдаёт ошибки в едином формате: объект `error` с полями `code` (строка), `message` (сообщение на русском) и `details` — массив объектов с полями `field` и `issue`. Составьте тело ответа **422** для случая: поле `email` имеет неверный формат, а поле `age` меньше 18.',
    language: 'json',
    starterCode: `{
  "error": {
    "code": "",
    "message": "",
    "details": []
  }
}`,
    solution: `{
  "error": {
    "code": "validation_error",
    "message": "Данные не прошли валидацию",
    "details": [
      { "field": "email", "issue": "Неверный формат email" },
      { "field": "age", "issue": "Значение должно быть не меньше 18" }
    ]
  }
}`,
    hints: [
      'Корень ответа — объект с единственным ключом error, внутри которого code, message и details.',
      'details — массив из двух элементов: по одному объекту на каждое невалидное поле.',
      'Каждый элемент details выглядит как {"field": "email", "issue": "Неверный формат email"} — второй по аналогии для age.',
    ],
  },
  {
    type: 'quiz',
    id: 'a6',
    difficulty: 'easy',
    question:
      'В FastAPI объявлен эндпоинт `@app.get(\'/items/{item_id}\')` с параметром `item_id: int`. Что вернёт запрос `GET /items/abc`?',
    options: [
      '`500 Internal Server Error` — Python упадёт при преобразовании типа',
      '`404 Not Found` — маршрут не совпадёт с запросом',
      '`422 Unprocessable Entity` с JSON-описанием ошибки валидации',
      '`200 OK`, а `item_id` внутри функции будет строкой `\'abc\'`',
    ],
    correctIndex: 2,
    explanation:
      'FastAPI валидирует path-параметры по аннотациям типов: `\'abc\'` не приводится к `int`, поэтому клиент получит 422 с подробным описанием ошибки. Маршрут при этом совпадает, так что 404 не будет.',
  },
  {
    type: 'quiz',
    id: 'a7',
    difficulty: 'easy',
    question: 'Что делает вызов `Article.objects.filter(published=True).count()` в Django?',
    options: [
      'Выполняет в БД один запрос `SELECT COUNT(*)` с условием и возвращает число',
      'Загружает все опубликованные статьи в память и считает их через `len()`',
      'Возвращает ленивый QuerySet, который посчитает статьи только при итерации',
      'Берёт готовое число из кэша Django, не обращаясь к БД',
    ],
    correctIndex: 0,
    explanation:
      '`.count()` транслируется в `SELECT COUNT(*)` — считает сама база, объекты в Python не создаются. Именно поэтому на больших таблицах `qs.count()` эффективнее, чем `len(qs)`, который загрузил бы все строки.',
  },
  {
    type: 'code',
    id: 'a8',
    difficulty: 'easy',
    title: 'Эндпоинт поиска с query-параметрами',
    description:
      'Создайте FastAPI-эндпоинт `GET /search`: обязательный query-параметр `q` (строка) и необязательный `limit` (целое число, по умолчанию 10). Верните словарь `{"query": q, "limit": limit}`.',
    language: 'python',
    starterCode: `from fastapi import FastAPI

app = FastAPI()

# TODO: эндпоинт GET /search
# q — обязательный query-параметр, limit — необязательный (по умолчанию 10)`,
    solution: `from fastapi import FastAPI

app = FastAPI()

@app.get('/search')
async def search(q: str, limit: int = 10):
    return {'query': q, 'limit': limit}`,
    hints: [
      'Параметры функции, которых нет в пути, FastAPI автоматически считает query-параметрами.',
      'Обязательность задаётся отсутствием значения по умолчанию: q: str — обязателен, limit: int = 10 — нет.',
      'Достаточно вернуть обычный словарь — FastAPI сам сериализует его в JSON.',
    ],
  },
  {
    type: 'quiz',
    id: 'a9',
    difficulty: 'easy',
    question:
      'Найдите проблему в Pydantic-модели: `class User(BaseModel):` с полями `name: str` и `middle_name: str = None`.',
    options: [
      'Поле `name` обязано иметь значение по умолчанию',
      'От `BaseModel` нельзя наследоваться напрямую',
      'Поля модели нельзя объявлять через аннотации типов',
      'Тип `str` не допускает `None`: для необязательного поля нужно `str | None = None`',
    ],
    correctIndex: 3,
    explanation:
      'В Pydantic v2 значение по умолчанию должно соответствовать объявленному типу, поэтому необязательное строковое поле объявляют как `str | None = None`. А обязательные поля без значения по умолчанию (`name: str`) — это совершенно нормально.',
  },
  {
    type: 'code',
    id: 'a10',
    difficulty: 'easy',
    title: 'Модель Product для каталога',
    description:
      'Опишите Django-модель `Product`: `name` — строка до 120 символов, `price` — десятичное число (до 10 цифр, 2 после запятой), `created_at` — дата-время, проставляется автоматически при создании записи. Добавьте метод `__str__`, возвращающий имя товара.',
    language: 'python',
    starterCode: `from django.db import models

# TODO: модель Product с полями name, price, created_at
# и методом __str__`,
    solution: `from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=120)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name`,
    hints: [
      'Для денег используйте DecimalField, а не FloatField — иначе появятся ошибки округления.',
      'DecimalField требует два аргумента: max_digits и decimal_places.',
      'auto_now_add=True проставляет время один раз при создании записи (auto_now — при каждом сохранении, здесь не подходит).',
    ],
  },
  {
    type: 'quiz',
    id: 'a11',
    difficulty: 'easy',
    question: 'При классической **сессионной** аутентификации что хранится в cookie браузера?',
    options: [
      'Логин и пароль пользователя в зашифрованном виде',
      'Только идентификатор сессии; данные пользователя лежат на сервере',
      'Полный JSON-профиль пользователя вместе с его правами',
      'Ничего: браузер передаёт сессию через заголовок `Authorization`',
    ],
    correctIndex: 1,
    explanation:
      'Сессионная схема — stateful: cookie несёт лишь случайный идентификатор, по которому сервер находит данные в своём хранилище сессий. Этим она и отличается от JWT, где данные зашиты в сам токен.',
  },
  {
    type: 'quiz',
    id: 'a12',
    difficulty: 'easy',
    question:
      'Вам нужно передать JWT в запросе к API. Какой способ является общепринятым стандартом?',
    options: [
      'Заголовок `Authorization: Bearer <токен>`',
      'Query-параметр `?token=<токен>` в URL',
      'Нестандартный заголовок `X-Auth-Token: <токен>`',
      'Поле `token` в JSON-теле каждого запроса',
    ],
    correctIndex: 0,
    explanation:
      'Схема Bearer в заголовке `Authorization` — стандарт (RFC 6750): её из коробки понимают фреймворки, прокси и OpenAPI-документация. Токен в URL — антипаттерн: URL попадают в логи серверов и историю браузера.',
  },
  {
    type: 'quiz',
    id: 'a13',
    difficulty: 'easy',
    question: 'Зачем при хешировании паролей к каждому паролю добавляют уникальную **соль**?',
    options: [
      'Чтобы пароль можно было расшифровать обратно при восстановлении доступа',
      'Чтобы ускорить проверку пароля при логине',
      'Чтобы одинаковые пароли давали разные хеши и заранее посчитанные таблицы не работали',
      'Чтобы пароль стал длиннее и его было сложнее подобрать перебором',
    ],
    correctIndex: 2,
    explanation:
      'Соль делает хеш уникальным даже для одинаковых паролей, поэтому радужные таблицы и массовое сравнение хешей между пользователями становятся бесполезными. Расшифровать хеш обратно нельзя в принципе — это односторонняя функция, а не шифрование.',
  },
  {
    type: 'code',
    id: 'a14',
    difficulty: 'easy',
    title: 'Payload access-токена',
    description:
      'Составьте JSON-payload access-токена для пользователя с id `42` и ролью `manager`. Используйте стандартные клеймы: `sub` (id пользователя как строка), `iat` (момент выдачи: 1700000000), `exp` (истекает через 15 минут после выдачи) — и кастомный клейм `role`.',
    language: 'json',
    starterCode: `{
  "sub": "",
  "iat": 0,
  "exp": 0,
  "role": ""
}`,
    solution: `{
  "sub": "42",
  "iat": 1700000000,
  "exp": 1700000900,
  "role": "manager"
}`,
    hints: [
      'sub — это subject: идентификатор владельца токена, по стандарту строка, а не число.',
      'iat и exp — Unix-время в секундах; 15 минут — это 900 секунд.',
      'exp = 1700000000 + 900 = 1700000900.',
    ],
  },
  {
    type: 'quiz',
    id: 'a15',
    difficulty: 'easy',
    question:
      'В FastAPI сначала объявлен `@app.get(\'/users/{user_id}\')` с `user_id: int`, а ниже — `@app.get(\'/users/me\')`. Что вернёт запрос `GET /users/me`?',
    options: [
      '`200` от эндпоинта `/users/me` — точное совпадение всегда приоритетнее',
      '`404` — маршруты конфликтуют, и оба перестают работать',
      '`500` — FastAPI упадёт при старте из-за пересечения путей',
      '`422` — запрос перехватит `/users/{user_id}`, а `\'me\'` не пройдёт валидацию как `int`',
    ],
    correctIndex: 3,
    explanation:
      'Маршруты проверяются в порядке объявления: `/users/{user_id}` стоит раньше и совпадает с запросом, но строка `\'me\'` не приводится к `int` — отсюда 422. Поэтому фиксированные пути объявляют **до** параметризованных.',
  },
  {
    type: 'quiz',
    id: 'a16',
    difficulty: 'easy',
    question:
      'Браузер блокирует ответы вашего API для фронтенда с другого домена. Какой заголовок должен вернуть **сервер**, чтобы разрешить этому домену читать ответы?',
    options: [
      '`Origin: https://app.example.com`',
      '`Access-Control-Allow-Origin: https://app.example.com`',
      '`X-Frame-Options: ALLOW-FROM https://app.example.com`',
      'Никакой: CORS настраивается в браузере пользователя',
    ],
    correctIndex: 1,
    explanation:
      '`Access-Control-Allow-Origin` — ответный заголовок сервера, разрешающий указанному origin читать ответ. `Origin` — наоборот, заголовок **запроса**, который браузер ставит сам; повлиять на политику со стороны клиента нельзя.',
  },
  {
    type: 'code',
    id: 'a17',
    difficulty: 'easy',
    title: 'Первый тест API с TestClient',
    description:
      'В приложении есть эндпоинт `GET /ping`, возвращающий `{"status": "ok"}`. Напишите тест `test_ping`: проверьте статус-код 200 и JSON-тело ответа. Приложение импортируется как `from main import app`.',
    language: 'python',
    starterCode: `from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# TODO: тест test_ping — проверьте статус-код и JSON-тело`,
    solution: `from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_ping():
    response = client.get('/ping')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}`,
    hints: [
      'TestClient вызывает приложение напрямую, без запуска сервера: client.get(\'/ping\').',
      'Тело ответа как словарь возвращает метод response.json().',
      'Нужны два assert: response.status_code == 200 и response.json() == {\'status\': \'ok\'}.',
    ],
  },
  {
    type: 'quiz',
    id: 'a18',
    difficulty: 'easy',
    question: 'Согласно пирамиде тестов, каких тестов в проекте должно быть **больше всего**?',
    options: [
      'E2E-тестов, проходящих весь пользовательский сценарий через браузер',
      'Ручных проверок по чек-листу перед каждым релизом',
      'Быстрых юнит-тестов отдельных функций и классов',
      'Всех видов поровну: треть юнит, треть интеграционных, треть E2E',
    ],
    correctIndex: 2,
    explanation:
      'Основание пирамиды — юнит-тесты: они быстрые, стабильные и точно указывают место поломки. E2E — вершина: их держат мало, потому что они медленные и хрупкие, а не потому что бесполезные.',
  },
  {
    type: 'quiz',
    id: 'a19',
    difficulty: 'medium',
    question:
      'Странице нужны статьи вместе с их тегами (`ManyToManyField`). Какой вариант загрузки лучший и почему?',
    options: [
      '`select_related(\'tags\')` — один SQL JOIN всегда эффективнее всего',
      '`prefetch_related(\'tags\')` — для M2M Django выполнит второй запрос и склеит результаты в Python',
      'Обычный `Article.objects.all()` — ORM сам оптимизирует доступ к тегам при обращении',
      'Только сырой SQL — ORM не умеет загружать связи «многие ко многим»',
    ],
    correctIndex: 1,
    explanation:
      '`select_related` работает через JOIN и годится только для `ForeignKey`/`OneToOne` — на M2M он бросит ошибку. `prefetch_related` делает отдельный запрос по тегам и связывает их со статьями в памяти, убирая проблему N+1.',
  },
  {
    type: 'code',
    id: 'a20',
    difficulty: 'medium',
    title: 'Переиспользуемая зависимость пагинации',
    description:
      'Напишите функцию-зависимость `pagination` с query-параметрами `limit` (по умолчанию 20, от 1 до 100) и `offset` (по умолчанию 0, не меньше 0); ограничения задайте через `Query`. Подключите её через `Depends` к эндпоинту `GET /articles`, который возвращает `{"limit": ..., "offset": ...}`.',
    language: 'python',
    starterCode: `from fastapi import FastAPI, Depends, Query

app = FastAPI()

# TODO: функция pagination(limit, offset) с ограничениями через Query

# TODO: эндпоинт GET /articles, получающий параметры через Depends(pagination)`,
    solution: `from fastapi import FastAPI, Depends, Query

app = FastAPI()

def pagination(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    return {'limit': limit, 'offset': offset}

@app.get('/articles')
async def list_articles(params: dict = Depends(pagination)):
    return params`,
    hints: [
      'Query(20, ge=1, le=100) задаёт значение по умолчанию и границы: ge — «не меньше», le — «не больше».',
      'Зависимость — обычная функция: верните из неё словарь с limit и offset.',
      'В эндпоинте объявите params: dict = Depends(pagination) — FastAPI сам вызовет функцию и подставит результат.',
    ],
  },
  {
    type: 'quiz',
    id: 'a21',
    difficulty: 'medium',
    question:
      'Сколько SQL-запросов выполнит этот код Django: `qs = Article.objects.filter(published=True)`, затем `qs = qs.exclude(views=0)`, затем `first = qs.first()`?',
    options: [
      'Три — по одному на каждую строку кода',
      'Два — `filter` и `exclude` объединятся, а `first()` выполнится отдельно',
      'Ноль — QuerySet ленивый, запросов не будет вовсе',
      'Один — `filter` и `exclude` лишь строят запрос, и только `first()` выполняет его',
    ],
    correctIndex: 3,
    explanation:
      'QuerySet ленив: `filter` и `exclude` только накапливают условия будущего SQL, не трогая базу. Обращение к данным — `first()`, итерация, `len()` — выполняет один запрос сразу со всеми условиями и `LIMIT 1`.',
  },
  {
    type: 'code',
    id: 'a22',
    difficulty: 'medium',
    title: 'Создание ресурса: валидация и статус 201',
    description:
      'Реализуйте эндпоинт `POST /books`. Тело запроса — модель `BookIn`: `title` (непустая строка), `year` (целое от 1450 до 2100), `pages` (целое больше 0); ограничения задайте через `Field`. Сохраните книгу в список `books`, присвойте ей `id` и верните её со статусом **201**.',
    language: 'python',
    starterCode: `from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

books: list[dict] = []

# TODO: модель BookIn с ограничениями через Field

# TODO: POST /books — статус 201, вернуть книгу с полем id`,
    solution: `from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

books: list[dict] = []

class BookIn(BaseModel):
    title: str = Field(min_length=1)
    year: int = Field(ge=1450, le=2100)
    pages: int = Field(gt=0)

@app.post('/books', status_code=201)
async def create_book(book: BookIn):
    record = {'id': len(books) + 1, **book.model_dump()}
    books.append(record)
    return record`,
    hints: [
      'Ограничения задаются через Field: min_length — для строк, ge/le/gt — для чисел.',
      'Статус успешного создания указывается прямо в декораторе: @app.post(\'/books\', status_code=201).',
      'Соберите запись как {\'id\': len(books) + 1, **book.model_dump()}, добавьте её в список и верните.',
    ],
  },
  {
    type: 'quiz',
    id: 'a23',
    difficulty: 'medium',
    question:
      'Почему для хранения паролей рекомендуют bcrypt или Argon2, а не быстрый SHA-256, пусть даже с солью?',
    options: [
      'SHA-256 легко расшифровать обратно, а bcrypt и Argon2 — нельзя',
      'bcrypt и Argon2 не требуют соли, поэтому их проще внедрить',
      'bcrypt и Argon2 намеренно медленные и настраиваемые по стоимости — массовый перебор на GPU становится нерентабельным',
      'SHA-256 официально признан взломанным и запрещён для любых задач',
    ],
    correctIndex: 2,
    explanation:
      'SHA-256 — быстрая функция: GPU перебирает миллиарды кандидатов в секунду, и соль от этого не спасает — она защищает лишь от заранее посчитанных таблиц. bcrypt и Argon2 специально дорогие по времени (а Argon2 — и по памяти), причём стоимость можно повышать вместе с ростом железа. «Расшифровать» нельзя ни один хеш — все они односторонние, и как алгоритм SHA-256 не взломан.',
  },
  {
    type: 'code',
    id: 'a24',
    difficulty: 'medium',
    title: 'Ответ сервера на CORS preflight',
    description:
      'SPA с `https://app.example.com` собирается отправить `PUT /api/orders/7` с заголовками `Authorization` и `Content-Type: application/json`. Составьте корректный ответ сервера на preflight-запрос `OPTIONS`: разрешите этот origin, методы `GET, PUT, DELETE`, оба заголовка и кэширование preflight на 1 час.',
    language: 'http',
    starterCode: `HTTP/1.1 204 No Content
Access-Control-Allow-Origin: ???
???
???
???`,
    solution: `HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 3600`,
    hints: [
      'Нужны четыре заголовка: Access-Control-Allow-Origin, -Allow-Methods, -Allow-Headers и -Max-Age.',
      'Preflight-ответ идёт без тела, поэтому статус 204 No Content подходит идеально.',
      'Max-Age задаётся в секундах: 1 час = 3600 — всё это время браузер не будет повторять OPTIONS для тех же запросов.',
    ],
  },
  {
    type: 'quiz',
    id: 'a25',
    difficulty: 'medium',
    question:
      'Запрос к API оборвался по таймауту, и клиент хочет автоматически повторить его. Для каких HTTP-методов повтор безопасен по стандарту?',
    options: [
      'Ни для каких: повторять запросы после таймаута запрещено спецификацией',
      'Для идемпотентных GET, PUT и DELETE; повтор POST может создать дубликат',
      'Только для POST — он и предназначен для повторной отправки данных',
      'Для любых: HTTP гарантирует, что сервер сам отбросит повторный запрос',
    ],
    correctIndex: 1,
    explanation:
      'GET, PUT и DELETE идемпотентны: сколько бы раз ни повторить запрос, итоговое состояние сервера одно и то же, поэтому ретраи безопасны. POST не идемпотентен — первый запрос мог успеть выполниться до обрыва связи, и повтор создаст второй заказ или платёж; такие ретраи защищают отдельным ключом идемпотентности.',
  },
  {
    type: 'code',
    id: 'a26',
    difficulty: 'medium',
    title: 'Параметризованный тест валидации',
    description:
      'Эндпоинт `POST /users` принимает JSON с полями `email` и `age` и возвращает 422 на невалидные данные. Напишите **один** параметризованный тест, проверяющий три случая: пустой `email`, отрицательный `age = -5`, полностью отсутствующее поле `email`.',
    language: 'python',
    starterCode: `import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# TODO: @pytest.mark.parametrize с тремя невалидными payload
# TODO: тест, отправляющий payload и проверяющий статус 422`,
    solution: `import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

@pytest.mark.parametrize('payload', [
    {'email': '', 'age': 25},
    {'email': 'user@example.com', 'age': -5},
    {'age': 25},
])
def test_create_user_validation(payload):
    response = client.post('/users', json=payload)
    assert response.status_code == 422`,
    hints: [
      'Декоратор: @pytest.mark.parametrize(\'payload\', [...]) со списком из трёх словарей — pytest запустит тест трижды.',
      'Случай «отсутствующее поле» — это словарь без ключа email вообще, а не с пустой строкой: это разные ошибки валидации.',
      'В теле теста: response = client.post(\'/users\', json=payload) и assert response.status_code == 422.',
    ],
  },
  {
    type: 'quiz',
    id: 'a27',
    difficulty: 'medium',
    question:
      'Аутентифицированный пользователь пытается удалить чужую статью, но право на это есть только у её автора. Какой статус-код должен вернуть API?',
    options: [
      '`401 Unauthorized` — пользователь не авторизован на это действие',
      '`400 Bad Request` — запрос некорректен, раз выполнить его нельзя',
      '`405 Method Not Allowed` — метод DELETE этому пользователю не разрешён',
      '`403 Forbidden` — личность известна, но прав на операцию не хватает',
    ],
    correctIndex: 3,
    explanation:
      'Ситуация «кто ты — знаем, но этого тебе нельзя» — это 403. Вопреки названию, `401 Unauthorized` означает «не аутентифицирован»: рабочие учётные данные вообще не предъявлены. А `405` — про метод, который не поддерживается самим ресурсом независимо от того, кто спрашивает.',
  },
  {
    type: 'code',
    id: 'a28',
    difficulty: 'medium',
    title: 'response_model: не отдать лишнего',
    description:
      'Эндпоинт регистрации возвращает объект пользователя целиком — вместе с паролем. Объявите модель `UserOut` (только `email`) и укажите `response_model` у эндпоинта `POST /register`, чтобы пароль гарантированно не попадал в ответ.',
    language: 'python',
    starterCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserIn(BaseModel):
    email: str
    password: str

# TODO: модель UserOut без пароля

@app.post('/register')
async def register(user: UserIn):
    return user  # пароль утекает в ответ!`,
    solution: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserIn(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    email: str

@app.post('/register', response_model=UserOut)
async def register(user: UserIn):
    return user`,
    hints: [
      'response_model задаётся в декораторе: @app.post(\'/register\', response_model=UserOut).',
      'Из функции можно по-прежнему возвращать user целиком — ответ по полям response_model отфильтрует сам FastAPI.',
      'UserOut содержит только email: поля, которых нет в response_model, в JSON-ответ не попадают.',
    ],
  },
  {
    type: 'quiz',
    id: 'a29',
    difficulty: 'medium',
    question:
      'Во view DRF вызвали `serializer.save()` сразу после создания сериализатора, не вызвав `serializer.is_valid()`. Что произойдёт?',
    options: [
      'DRF поднимет `AssertionError`: сохранять можно только после явной валидации',
      'Данные сохранятся как есть — валидация в DRF необязательна',
      '`save()` сам неявно вызовет `is_valid()` и при ошибках вернёт клиенту 400',
      'Сохранится пустой объект, а все невалидные поля будут молча отброшены',
    ],
    correctIndex: 0,
    explanation:
      '`save()` работает с `validated_data`, которое появляется только после `is_valid()`, — без него DRF бросает `AssertionError` с подсказкой. Неявной валидации нет намеренно: способ обработки ошибок (`raise_exception=True` или проверка `errors`) выбирает программист.',
  },
  {
    type: 'code',
    id: 'a30',
    difficulty: 'medium',
    title: 'Топ статей одним запросом ORM',
    description:
      'Напишите функцию `get_top_articles(n)`: верните `n` опубликованных статей (`published=True`) с наибольшим числом просмотров. Отсортируйте по убыванию `views`, а из базы заберите только поля `title` и `views` (метод `values`). Функция возвращает список словарей.',
    language: 'python',
    starterCode: `from .models import Article

def get_top_articles(n):
    # TODO: фильтр published=True, сортировка по убыванию views,
    # только поля title и views, первые n записей
    ...`,
    solution: `from .models import Article

def get_top_articles(n):
    return list(
        Article.objects
        .filter(published=True)
        .order_by('-views')
        .values('title', 'views')[:n]
    )`,
    hints: [
      'Сортировка по убыванию — минус перед именем поля: order_by(\'-views\').',
      'values(\'title\', \'views\') вернёт словари только с нужными полями — экономнее, чем тащить объекты целиком.',
      'Срез [:n] превращается в SQL LIMIT; оберните QuerySet в list(), чтобы вернуть готовый список словарей.',
    ],
  },
]
