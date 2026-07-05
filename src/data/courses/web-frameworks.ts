import type { Course } from '@/types/course'

export const webFrameworksCourse: Course = {
  slug: 'web-frameworks',
  order: 3,
  title: 'Веб-фреймворки',
  description: 'HTTP, REST API, Django и FastAPI — создание production-готовых веб-приложений.',
  level: 'Средний',
  image: '/globe-sphere.svg',
  tags: ['Django', 'FastAPI', 'REST'],
  lessons: [
    {
      slug: 'http-rest',
      title: 'HTTP и REST API',
      description: 'Анатомия HTTP, идемпотентность методов, статус-коды, дизайн REST-ресурсов, пагинация и стандартный формат ошибок.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Типичная ситуация на код-ревью: эндпоинт `POST /getUsers` возвращает `200 OK` с телом `{"error": "user not found"}`. Формально всё работает, но такой API невозможно кэшировать, мониторить и безопасно ретраить — а фронтенд-разработчики тихо ненавидят его автора. HTTP — это контракт с десятками готовых решений: правильный метод даёт браузеру и прокси понять, можно ли повторить запрос, правильный статус-код позволяет алертингу отличить баг сервера от ошибки клиента. В этом уроке разберём HTTP до винтиков и научимся проектировать REST API, за который не стыдно, — включая пагинацию и стандарт ошибок **RFC 9457**.',
        },
        { type: 'heading', text: 'Анатомия HTTP-запроса и ответа' },
        {
          type: 'code',
          language: 'http',
          code: `POST /api/v1/orders HTTP/1.1
Host: shop.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Idempotency-Key: 7f3c9a2e-1b4d-4e8f-9c6a-2d5b8e1f4a7c

{"product_id": 42, "quantity": 2}

HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/orders/1057

{"id": 1057, "product_id": 42, "quantity": 2, "status": "created"}`,
        },
        {
          type: 'text',
          text: 'Запрос состоит из **стартовой строки** (метод, путь, версия протокола), **заголовков** и опционального **тела**, отделённого пустой строкой. Ответ устроен так же, только вместо метода — **статус-строка** с кодом. Ключевые заголовки, которые вы будете видеть каждый день: `Content-Type` описывает формат тела, `Authorization` несёт учётные данные, `Location` в ответе `201` указывает адрес созданного ресурса. Заголовок `Idempotency-Key` — приём из мира платёжных API: он позволяет серверу распознать повтор запроса и не создать дубль.',
        },
        { type: 'heading', text: 'Методы: безопасность и идемпотентность' },
        {
          type: 'table',
          headers: ['Метод', 'Назначение', 'Безопасный', 'Идемпотентный'],
          rows: [
            ['GET', 'Чтение ресурса, без побочных эффектов', 'Да', 'Да'],
            ['POST', 'Создание ресурса, запуск операции', 'Нет', 'Нет'],
            ['PUT', 'Полная замена ресурса по известному URL', 'Нет', 'Да'],
            ['PATCH', 'Частичное обновление ресурса', 'Нет', 'Не гарантировано'],
            ['DELETE', 'Удаление ресурса', 'Нет', 'Да'],
            ['HEAD', 'Как GET, но только заголовки', 'Да', 'Да'],
          ],
        },
        {
          type: 'note',
          variant: 'warning',
          text: '**Идемпотентный** метод при повторе даёт тот же результат, что и при первом вызове: `DELETE /orders/42` дважды — заказ всё так же удалён. **Безопасный** — вообще не меняет состояние сервера. Это не теория: сетевые клиенты и прокси автоматически ретраят идемпотентные запросы при обрыве соединения. Повтор `POST /payments` без `Idempotency-Key` — классический сценарий двойного списания денег.',
        },
        { type: 'heading', text: 'Статус-коды: группы и типичные ошибки применения' },
        {
          type: 'list',
          items: [
            '**2xx — успех**: `200 OK` для чтения и обновления, `201 Created` + заголовок `Location` для создания, `204 No Content` для удаления (тело не нужно).',
            '**3xx — перенаправления**: `301` навсегда, `302` временно, `304 Not Modified` — работа условного кэширования через `ETag`.',
            '**4xx — ошибка клиента**: `400` некорректный запрос, `401` нет или невалидны учётные данные, `403` учётные данные есть, но прав недостаточно, `404` ресурс не найден, `409` конфликт состояния, `422` тело синтаксически корректно, но не проходит бизнес-валидацию, `429` превышен лимит запросов.',
            '**5xx — ошибка сервера**: `500` необработанное исключение, `502`/`504` проблемы upstream-сервиса за прокси, `503` сервис временно недоступен.',
            'Антипаттерн номер один: `200 OK` с `{"error": ...}` в теле — мониторинг видит успех, клиентский код вынужден парсить тело, кэш может сохранить ошибку.',
            'Путаница `401` и `403`: **401 — «я не знаю, кто ты»** (нет токена), **403 — «я знаю, кто ты, но тебе нельзя»** (не хватает прав).',
            'Ошибки валидации — это `400`/`422`, а не `500`: пятисотки должны означать баг на сервере и будить дежурного.',
          ],
        },
        { type: 'heading', text: 'Дизайн REST-ресурсов и версионирование' },
        {
          type: 'code',
          language: 'text',
          code: `# Плохо: глаголы и действия в URL
POST /createOrder
GET  /getUserOrders?id=7
POST /api/deleteOrder/42

# Хорошо: ресурсы — существительные во множественном числе,
# действие выражается HTTP-методом
POST   /api/v1/orders          # создать заказ
GET    /api/v1/orders/42       # получить заказ
PATCH  /api/v1/orders/42       # частично обновить
DELETE /api/v1/orders/42       # удалить

# Вложенность — не глубже двух уровней
GET /api/v1/users/7/orders     # заказы пользователя 7
# /users/7/orders/42/items/3 — уже перебор: у item есть свой адрес

# Фильтры, сортировка, поиск — query-параметры, а не новые пути
GET /api/v1/orders?status=paid&sort=-created_at&search=phone

# Версия API — чаще всего в пути
GET /api/v1/orders
GET /api/v2/orders             # breaking changes живут только здесь`,
        },
        {
          type: 'text',
          text: 'Версию в пути (`/api/v1/`) выбирают за очевидность: она видна в логах, в браузере и в curl-команде. Альтернатива — заголовок (`Accept: application/vnd.example.v2+json`): URL остаётся «чистым», но версию легко забыть и сложнее отлаживать. Главное правило одно: **breaking changes** (удаление поля, смена типа) — только в новой версии, а добавление необязательных полей версию не меняет.',
        },
        { type: 'heading', text: 'Пагинация и формат ошибок' },
        {
          type: 'table',
          headers: ['Критерий', 'Offset-пагинация', 'Cursor-пагинация'],
          rows: [
            ['Запрос', '`?limit=20&offset=100`', '`?limit=20&cursor=eyJpZCI6MTA1N30`'],
            ['Скорость на глубоких страницах', 'Падает: БД сканирует и отбрасывает offset строк', 'Стабильная: `WHERE id < cursor` использует индекс'],
            ['Вставки во время листания', 'Элементы дублируются или пропадают между страницами', 'Лента остаётся консистентной'],
            ['Переход на произвольную страницу', 'Да — легко показать «страница 7 из 40»', 'Нет — только вперёд/назад от курсора'],
            ['Где применять', 'Админки, отчёты, небольшие таблицы', 'Ленты, бесконечный скролл, большие объёмы'],
          ],
        },
        {
          type: 'code',
          language: 'http',
          code: `HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "Field 'quantity' must be greater than 0.",
  "instance": "/api/v1/orders",
  "errors": [
    {"field": "quantity", "message": "must be greater than 0"}
  ]
}`,
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'HTTP-сообщение — это стартовая строка, заголовки и тело; заголовки (`Content-Type`, `Authorization`, `Location`) — полноценная часть контракта API.',
            'Идемпотентность определяет, что можно безопасно ретраить: `GET`/`PUT`/`DELETE` — да, `POST` — только с `Idempotency-Key`.',
            'Статус-код — для машин: `201` при создании, `204` при удалении, `401` против `403`, и никогда `200` с ошибкой в теле.',
            'REST-ресурсы — существительные во множественном числе; действия выражаются методами, фильтры и сортировка — query-параметрами, вложенность — не глубже двух уровней.',
            'Offset-пагинация проста, но деградирует на глубине; cursor-пагинация стабильна и быстра — выбирайте по сценарию.',
            'Ошибки оформляйте единообразно: **RFC 9457** (`application/problem+json`) задаёт стандартные поля `type`, `title`, `status`, `detail` — клиентам не придётся парсить зоопарк форматов.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Какой из этих HTTP-методов НЕ является идемпотентным?',
          options: ['GET', 'PUT', 'POST', 'DELETE'],
          correctIndex: 2,
          explanation: 'Повтор POST создаёт новый ресурс при каждом вызове: два одинаковых POST /orders — два заказа. GET ничего не меняет, PUT полностью заменяет ресурс тем же представлением, а DELETE после первого вызова оставляет систему в том же состоянии «ресурса нет» — их можно безопасно повторять.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Клиент отправил запрос к защищённому эндпоинту вообще без токена. Какой статус-код должен вернуть сервер?',
          options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
          correctIndex: 1,
          explanation: '401 означает «я не знаю, кто ты»: учётные данные отсутствуют или невалидны, и сервер предлагает аутентифицироваться (заголовок WWW-Authenticate). 403 вернулся бы, если бы токен был валиден, но прав на операцию не хватило. 400 — про синтаксически некорректный запрос, что здесь не так.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'В чём главное преимущество cursor-пагинации перед offset-пагинацией?',
          options: [
            'Позволяет сразу перейти на страницу 50',
            'Не требует сортировки данных',
            'Проще реализуется на любой базе данных',
            'Стабильна при вставках/удалениях строк и не замедляется на глубоких страницах',
          ],
          correctIndex: 3,
          explanation: 'Условие WHERE id < cursor использует индекс и выполняется одинаково быстро на любой «глубине», тогда как OFFSET 100000 заставляет БД просканировать и отбросить сто тысяч строк. Вдобавок при вставке новых записей курсорная лента не «съезжает». Зато перейти на произвольную страницу с курсором нельзя — это как раз сильная сторона offset.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Правильный HTTP-обмен для создания ресурса',
          description: 'Напишите «сырой» HTTP-обмен для создания задачи в трекере: запрос `POST` на коллекцию `/api/v1/tasks` с JSON-телом (поля `title` и `priority`) и корректный ответ сервера. В ответе должны быть: правильный статус-код создания, заголовок `Content-Type`, заголовок с адресом нового ресурса и созданный объект (с `id`) в теле.',
          language: 'http',
          starterCode: `POST /api/v1/tasks HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"title": "Написать тесты", "priority": "high"}

HTTP/1.1 ??? ...
...`,
          solution: `POST /api/v1/tasks HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json

{"title": "Написать тесты", "priority": "high"}

HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/tasks/512

{"id": 512, "title": "Написать тесты", "priority": "high", "status": "new"}`,
          hints: [
            'Создание ресурса — это POST на коллекцию /api/v1/tasks. Никаких /tasks/create: действие выражается методом, а не словом в URL.',
            'Для успешного создания есть отдельный статус-код — не 200. Вспомните группу 2xx из таблицы.',
            'Хороший тон: заголовок Location с URL созданного ресурса (/api/v1/tasks/512) и сам объект с присвоенным id в теле ответа.',
          ],
        },
      ],
    },
    {
      slug: 'django-drf',
      title: 'Django и DRF',
      description: 'Архитектура MTV, модели и ORM, сериализаторы с валидацией, ViewSet с роутером и настройка пагинации, фильтрации и throttling.',
      duration: 35,
      blocks: [
        {
          type: 'text',
          text: 'Нужно за неделю поднять API интернет-магазина: товары, заказы, админка для контент-менеджеров, разграничение прав. На «голом» Python это месяцы работы, а Django даёт ORM, миграции, аутентификацию и админ-панель из коробки — недаром на нём работают Instagram и планировщики половины интернета. **Django REST Framework (DRF)** превращает Django в машину для производства REST API: сериализация, валидация, пагинация и права доступа настраиваются декларативно. В этом уроке пройдём путь от модели до готового CRUD-эндпоинта с фильтрами.',
        },
        { type: 'heading', text: 'Архитектура MTV и место DRF' },
        {
          type: 'text',
          text: 'Django построен на паттерне **MTV**: **Model** — данные и бизнес-логика (ORM-классы), **Template** — представление для пользователя, **View** — код, который принимает запрос и решает, что вернуть. Это тот же MVC, но с путающей терминологией: django-view играет роль контроллера, а роль mvc-view исполняет template. Путь запроса: `urls.py` находит view по пути, view работает с моделями и возвращает ответ. Для JSON API шаблоны не нужны — их место занимает **сериализатор**. Писать API на чистом Django можно (`JsonResponse`, ручной разбор `request.body`, ручная валидация), но это десятки строк шаблонного кода на каждый эндпоинт: DRF убирает эту рутину и добавляет browsable API — интерактивную веб-страницу для каждого эндпоинта.',
        },
        { type: 'heading', text: 'Модели и ORM' },
        {
          type: 'code',
          language: 'python',
          filename: 'blog/models.py',
          code: `from django.db import models


class Author(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.name


class Article(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Черновик'
        PUBLISHED = 'published', 'Опубликована'

    title = models.CharField(max_length=200)
    body = models.TextField()
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.DRAFT,
    )
    author = models.ForeignKey(
        Author, on_delete=models.CASCADE, related_name='articles',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['status'])]

    def __str__(self):
        return self.title

# После изменения моделей:
#   python manage.py makemigrations && python manage.py migrate`,
        },
        {
          type: 'code',
          language: 'python',
          code: `# Каждое выражение транслируется в SQL — посмотреть: str(queryset.query)
published = Article.objects.filter(status='published')   # WHERE status = 'published'
latest = published.order_by('-created_at')[:10]           # ORDER BY ... LIMIT 10
# QuerySet ленив: SQL выполнится только при итерации или list()

# Классическая проблема N+1: обращение к article.author
# в цикле делает отдельный запрос на КАЖДУЮ статью
for article in Article.objects.all():
    print(article.author.name)                # 1 + N запросов — плохо

# Решение — JOIN одним запросом
for article in Article.objects.select_related('author'):
    print(article.author.name)                # 1 запрос — хорошо
# Для ManyToMany и обратных связей — prefetch_related()

# Агрегации на стороне БД
from django.db.models import Count

Author.objects.annotate(articles_count=Count('articles')) \\
    .values('name', 'articles_count')`,
        },
        { type: 'heading', text: 'Serializer и ModelSerializer' },
        {
          type: 'code',
          language: 'python',
          filename: 'blog/serializers.py',
          code: `from rest_framework import serializers

from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    # Дополнительное вычисляемое поле поверх модели
    author_name = serializers.CharField(source='author.name', read_only=True)

    class Meta:
        model = Article
        # ModelSerializer сам построит поля по модели
        # и реализует create() / update()
        fields = [
            'id', 'title', 'body', 'status',
            'author', 'author_name', 'created_at',
        ]
        read_only_fields = ['created_at']

    # 1) Валидация одного поля: метод validate_<имя_поля>
    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError('Заголовок короче 5 символов.')
        return value.strip()

    # 2) Валидация объекта целиком — когда поля зависят друг от друга
    def validate(self, attrs):
        if attrs.get('status') == 'published' and not attrs.get('body'):
            raise serializers.ValidationError(
                'Нельзя публиковать статью без текста.'
            )
        return attrs

# Во view: serializer.is_valid(raise_exception=True)
# автоматически вернёт 400 со словарём ошибок по полям`,
        },
        { type: 'heading', text: 'APIView vs ViewSet + Router' },
        {
          type: 'table',
          headers: ['Критерий', 'APIView', 'ViewSet + Router'],
          rows: [
            ['URL-маршруты', 'Прописываете вручную в `urlpatterns`', 'Router генерирует автоматически'],
            ['Объём кода для CRUD', 'Методы `get`/`post`/`put`/`delete` пишутся руками', '`ModelViewSet` — весь CRUD в 4 строки'],
            ['Гибкость', 'Полный контроль над каждым методом', 'Стандартные действия + свои через `@action`'],
            ['Когда выбирать', 'Нестандартные эндпоинты: экспорт, healthcheck, агрегации', 'Типовой CRUD над моделью'],
          ],
        },
        {
          type: 'code',
          language: 'python',
          code: `# blog/views.py
from rest_framework import permissions, viewsets

from .models import Article
from .serializers import ArticleSerializer


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related('author')
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['status', 'author']
    search_fields = ['title', 'body']
    ordering_fields = ['created_at']


# config/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from blog.views import ArticleViewSet

router = DefaultRouter()
# Router создаст: GET/POST /articles/  и  GET/PATCH/PUT/DELETE /articles/{id}/
router.register('articles', ArticleViewSet)

urlpatterns = [
    path('api/v1/', include(router.urls)),
]`,
        },
        { type: 'heading', text: 'Пагинация, фильтрация и throttling' },
        {
          type: 'code',
          language: 'python',
          filename: 'config/settings.py',
          code: `REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',  # pip install django-filter
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    # Throttling — защита от злоупотреблений на уровне приложения
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',   # по IP
        'rest_framework.throttling.UserRateThrottle',   # по user id
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/min',
        'user': '1000/min',
    },
}

# Всё вместе одним запросом:
# GET /api/v1/articles/?status=published&search=django&ordering=-created_at&page=2
# При превышении лимита клиент получит 429 Too Many Requests + Retry-After`,
        },
        {
          type: 'note',
          variant: 'tip',
          text: 'Структура реального проекта: настройки разделяют на `config/settings/base.py`, `dev.py` и `prod.py` (секреты — только из переменных окружения), приложения складывают в пакет `apps/` — по одному домену на приложение (`apps/orders`, `apps/users`), а тесты держат рядом с кодом приложения. Одно «приложение на весь проект» быстро превращается в неподдерживаемый монолит из тысяч строк.',
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'MTV — это MVC с другими именами: view в Django играет роль контроллера, а для API вместо template работает сериализатор.',
            'ORM транслирует Python-выражения в SQL; следите за N+1 и решайте его через `select_related`/`prefetch_related`.',
            '`ModelSerializer` строит поля по модели и реализует `create()`/`update()`; валидация — через `validate_<поле>` и `validate`.',
            '`ModelViewSet` + `Router` дают полный CRUD в несколько строк; `APIView` — для нестандартных эндпоинтов.',
            'Пагинация, фильтрация и throttling настраиваются глобально в `REST_FRAMEWORK` и уточняются в конкретных view.',
            'Структурируйте проект по доменам: пакет `apps/`, разделённые настройки, секреты в переменных окружения.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Что даёт `ModelSerializer` по сравнению с обычным `Serializer`?',
          options: [
            'Заменяет ViewSet, генерируя URL-маршруты автоматически',
            'Кэширует ответы API в памяти процесса',
            'Автоматически строит поля по модели и реализует методы create() и update()',
            'Выполняет миграции схемы базы данных',
          ],
          correctIndex: 2,
          explanation: 'ModelSerializer читает описание модели и генерирует поля с типами и ограничениями (max_length, unique), а также готовые create() и update(), которые сохраняют объект в БД. С обычным Serializer все поля и оба метода пришлось бы писать вручную. URL-маршрутами занимается Router, а миграциями — makemigrations/migrate.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Зачем во ViewSet написано `queryset = Article.objects.select_related("author")`?',
          options: [
            'Чтобы избежать проблемы N+1: автор подтягивается JOIN-ом в том же SQL-запросе',
            'Чтобы отсортировать статьи по имени автора',
            'Чтобы закэшировать авторов в Redis',
            'Чтобы проверить права доступа автора к статье',
          ],
          correctIndex: 0,
          explanation: 'Сериализатор обращается к article.author.name для каждой статьи, и без select_related каждая такая строка вызывала бы отдельный SQL-запрос — на странице из 20 статей получился бы 21 запрос. select_related делает JOIN и достаёт всё одним запросом. К сортировке, кэшу и правам доступа этот метод отношения не имеет.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'В настройках задано `"anon": "60/min"`. Что получит анонимный клиент, отправивший 61-й запрос за минуту?',
          options: [
            'Запрос встанет в очередь и выполнится в следующую минуту',
            'Ответ 429 Too Many Requests с заголовком Retry-After',
            'Соединение будет молча разорвано',
            'Ответ 403 Forbidden без объяснений',
          ],
          correctIndex: 1,
          explanation: 'Throttling в DRF при превышении лимита возвращает именно 429 — специальный код «слишком много запросов» — и подсказывает в Retry-After, через сколько секунд можно повторить. Никакой очереди DRF не строит, а 403 означал бы проблему с правами, а не с частотой запросов.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'ModelSerializer с валидацией для модели Book',
          description: 'Дана модель `Book` с полями `title` (CharField), `author` (CharField), `year` (IntegerField) и `isbn` (CharField, unique). Напишите `BookSerializer` на базе `ModelSerializer`: включите все поля, сделайте `id` только для чтения, добавьте валидацию `year` (от 1450 до текущего года включительно, текущий год возьмите через `datetime.date.today().year`) и валидацию `isbn` (после удаления дефисов должно остаться ровно 13 цифр — верните очищенное значение).',
          language: 'python',
          starterCode: `import datetime

from rest_framework import serializers

from .models import Book


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        # TODO: fields и read_only_fields

    # TODO: validate_year

    # TODO: validate_isbn`,
          solution: `import datetime

from rest_framework import serializers

from .models import Book


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'year', 'isbn']
        read_only_fields = ['id']

    def validate_year(self, value):
        current_year = datetime.date.today().year
        if not 1450 <= value <= current_year:
            raise serializers.ValidationError(
                f'Год должен быть между 1450 и {current_year}.'
            )
        return value

    def validate_isbn(self, value):
        digits = value.replace('-', '')
        if not (digits.isdigit() and len(digits) == 13):
            raise serializers.ValidationError('ISBN должен содержать 13 цифр.')
        return digits`,
          hints: [
            'Валидация одного поля в DRF — это метод validate_<имя_поля>(self, value), который либо возвращает значение, либо бросает serializers.ValidationError.',
            'Для года сравните value с границами: 1450 <= value <= datetime.date.today().year. Python позволяет двойное сравнение в одну строку.',
            'Для ISBN сначала уберите дефисы через value.replace("-", ""), затем проверьте digits.isdigit() и len(digits) == 13. Верните очищенную строку — валидатор может нормализовать значение.',
          ],
        },
      ],
    },
    {
      slug: 'fastapi',
      title: 'FastAPI',
      description: 'Асинхронный фреймворк на типах: Pydantic v2, Depends, response_model, async против sync и честное сравнение с Django.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Представьте API, где документация всегда актуальна, валидация входных данных пишется одной аннотацией типа, а ошибка «передали строку вместо числа» превращается в аккуратный ответ `422` без единой строчки вашего кода. Это и есть **FastAPI** — фреймворк, построенный на трёх китах: **аннотации типов** Python (они же схема валидации), **асинхронность** на базе Starlette и **автогенерация OpenAPI-документации**. Микросервисы, ML-инференс, интеграционные шлюзы — везде, где важна скорость под IO-нагрузкой и лёгкий старт, FastAPI сегодня выбор по умолчанию.',
        },
        { type: 'heading', text: 'Первое приложение и автодоки' },
        {
          type: 'code',
          language: 'python',
          filename: 'main.py',
          code: `from fastapi import FastAPI

app = FastAPI(title='Shop API', version='1.0.0')


@app.get('/health')
async def health() -> dict[str, str]:
    return {'status': 'ok'}

# Запуск dev-сервера (uvicorn — ASGI-сервер, аналог runserver):
#   uvicorn main:app --reload
# В проде: uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
#
# Документация генерируется автоматически из типов и моделей:
#   Swagger UI — http://127.0.0.1:8000/docs
#   ReDoc      — http://127.0.0.1:8000/redoc`,
        },
        { type: 'heading', text: 'Path, query и body параметры' },
        {
          type: 'code',
          language: 'python',
          code: `from typing import Annotated

from fastapi import FastAPI, Path, Query
from pydantic import BaseModel

app = FastAPI()


class ProductIn(BaseModel):
    name: str
    price: float


# path-параметр: берётся из URL, тип из аннотации
@app.get('/products/{product_id}')
async def get_product(product_id: Annotated[int, Path(ge=1)]):
    return {'id': product_id}


# query-параметры: всё, чего нет в пути и что не модель
@app.get('/products')
async def list_products(
    q: str | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return {'q': q, 'limit': limit, 'offset': offset}


# body: Pydantic-модель автоматически читается из JSON-тела
@app.post('/products', status_code=201)
async def create_product(product: ProductIn):
    return product

# GET /products/abc -> 422 с описанием ошибки: валидация бесплатно`,
        },
        { type: 'heading', text: 'Pydantic v2: модели и валидация' },
        {
          type: 'code',
          language: 'python',
          code: `from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr                                    # pip install pydantic[email]
    username: str = Field(min_length=3, max_length=30)
    password: str = Field(min_length=8)

    @field_validator('username')
    @classmethod
    def username_is_clean(cls, v: str) -> str:
        if not v.isalnum():
            raise ValueError('Только буквы и цифры.')
        return v.lower()                               # валидатор может нормализовать


class UserOut(BaseModel):
    # from_attributes=True: модель строится прямо из ORM-объекта
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    username: str
    created_at: datetime
    # поля password здесь нет — наружу оно не уйдёт


user = UserCreate(email='a@b.com', username='  Alice42  ', password='secret123')
print(user.username)      # 'alice42' — strip + lower
print(user.model_dump())  # словарь; сериализация в JSON — model_dump_json()`,
        },
        {
          type: 'note',
          variant: 'info',
          text: 'Pydantic v2 переписан на Rust и в разы быстрее v1, но API изменился: `@validator` стал `@field_validator` (плюс обязательный `@classmethod`), `class Config` заменён на `model_config = ConfigDict(...)`, `.dict()` — на `.model_dump()`, а `orm_mode` — на `from_attributes`. Если видите в туториале старый синтаксис — туториал устарел.',
        },
        { type: 'heading', text: 'Depends: внедрение зависимостей и сессия БД' },
        {
          type: 'code',
          language: 'python',
          code: `from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

engine = create_engine('postgresql+psycopg://app:secret@localhost:5432/shop')
SessionLocal = sessionmaker(bind=engine)

app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db      # сессия живёт ровно один запрос
    finally:
        db.close()    # закроется даже если эндпоинт бросил исключение


# Annotated-псевдоним, чтобы не повторять Depends в каждом эндпоинте
DbSession = Annotated[Session, Depends(get_db)]


@app.get('/users/{user_id}', response_model=UserOut)
def get_user(user_id: int, db: DbSession):
    # SQLAlchemy 2.0: select() + scalar() вместо устаревшего query()
    user = db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    return user   # response_model сам превратит ORM-объект в UserOut

# Depends кэшируется в рамках запроса, зависимости могут вкладываться
# друг в друга — так строятся get_current_user, проверки прав и т.д.
# В тестах любую зависимость можно подменить через app.dependency_overrides.`,
        },
        { type: 'heading', text: 'async def или def?' },
        {
          type: 'text',
          text: 'Правило простое. **`async def`** — когда внутри только await-совместимый код: асинхронные драйверы БД (`asyncpg`, `SQLAlchemy` + `asyncio`), `httpx.AsyncClient`, `asyncio.sleep`. **`def`** — когда используются блокирующие библиотеки: `requests`, синхронный SQLAlchemy, тяжёлые вычисления; FastAPI выполнит такую функцию в пуле потоков, и event loop не пострадает. Худший вариант — блокирующий вызов внутри `async def`: он останавливает весь event loop, и сервер перестаёт отвечать всем клиентам, пока один запрос ждёт ответа от внешнего API. Заметили `response_model=UserOut` выше? Он не только преобразует ORM-объект по схеме и отсекает лишние поля (например, хеш пароля), но и попадает в OpenAPI-доки.',
        },
        { type: 'heading', text: 'FastAPI или Django: когда что выбирать' },
        {
          type: 'table',
          headers: ['Критерий', 'Django + DRF', 'FastAPI'],
          rows: [
            ['Админ-панель', 'Из коробки, экономит недели', 'Нет (сторонние решения)'],
            ['ORM и миграции', 'Встроенные, единый стиль', 'На выбор: SQLAlchemy + Alembic и др.'],
            ['Асинхронность', 'Поддерживается, но экосистема в основном sync', 'Нативная, ASGI с рождения'],
            ['Документация API', 'Через drf-spectacular', 'OpenAPI из коробки'],
            ['Валидация', 'Serializer-классы', 'Аннотации типов + Pydantic'],
            ['Сильная сторона', 'Монолиты с админкой, контент-проекты, быстрый MVP «всё включено»', 'Микросервисы, IO-интенсивные API, ML-сервисы'],
          ],
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'FastAPI строит валидацию, сериализацию и OpenAPI-документацию из аннотаций типов — одна модель Pydantic работает на все три задачи.',
            'Параметры распознаются по сигнатуре: из пути — path, простые типы — query, Pydantic-модель — body.',
            'Pydantic v2: `field_validator` + `classmethod`, `model_config = ConfigDict(...)`, `model_dump()` — не используйте синтаксис v1.',
            '`Depends` с `yield` — стандартный способ выдать сессию БД на время запроса и гарантированно закрыть её.',
            '`response_model` фильтрует ответ по схеме и защищает от утечки внутренних полей.',
            'Блокирующий код — только в `def` (уйдёт в пул потоков); в `async def` он останавливает весь сервер.',
            'Django берите за «всё включено» и админку, FastAPI — за скорость, типы и нативный async.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Как в Pydantic v2 объявить валидатор поля username?',
          options: [
            'Декоратором @validator("username"), как и раньше',
            'Декоратором @field_validator("username") в паре с @classmethod',
            'Методом clean_username внутри class Meta',
            'Аргументом Field(validator=check_username)',
          ],
          correctIndex: 1,
          explanation: 'В Pydantic v2 валидатор поля объявляется через @field_validator("имя_поля") и должен быть classmethod — метод получает cls и значение. Старый @validator из v1 оставлен только в модуле совместимости и выводит предупреждение. Синтаксис clean_* — из Django-форм, а Field принимает ограничения (ge, min_length), но не функции-валидаторы.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Внутри эндпоинта `async def` вызвали блокирующий `requests.get(...)`, который выполняется 2 секунды. Что произойдёт под нагрузкой?',
          options: [
            'Event loop заблокируется: пока идут эти 2 секунды, сервер не обрабатывает вообще ничего',
            'FastAPI заметит блокирующий вызов и автоматически унесёт его в пул потоков',
            'Интерпретатор выбросит RuntimeError о блокировке цикла событий',
            'Ничего страшного: await сам переключит контекст на другие задачи',
          ],
          correctIndex: 0,
          explanation: 'Весь async-код одного воркера крутится в одном event loop, и синхронный вызов держит его целиком — остальные запросы просто ждут. FastAPI уносит в пул потоков только функции, объявленные как def; внутрь async def он не заглядывает и предупреждений не даёт. Правильные решения: либо объявить эндпоинт через def, либо взять асинхронный httpx.AsyncClient.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Зачем эндпоинту указывать `response_model=UserOut`?',
          options: [
            'Он валидирует тело входящего запроса',
            'Он кэширует сериализованный ответ между запросами',
            'Он ускоряет выполнение SQL-запросов через ORM',
            'Он задаёт схему ответа: лишние поля отсекаются, а схема попадает в OpenAPI-документацию',
          ],
          correctIndex: 3,
          explanation: 'response_model описывает именно выход: FastAPI прогоняет возвращённый объект через схему, отбрасывая всё, чего в ней нет (например, password_hash из ORM-объекта), и публикует эту схему в /docs. Входное тело валидирует модель-параметр функции, а к кэшированию и скорости SQL response_model отношения не имеет.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'CRUD-эндпоинты книг с валидацией Pydantic',
          description: 'Напишите FastAPI-приложение с хранением книг в списке в памяти. Модель `BookIn`: `title` (1-200 символов, обрезать пробелы по краям и запретить пустую строку через `field_validator`), `author` (непустая строка), `year` (1450-2026), `pages` (строго больше 0). Модель `BookOut` добавляет `id`. Эндпоинты: `POST /books` — создаёт книгу, статус `201`, возвращает `BookOut`; `GET /books` — список с query-параметром `limit` (1-100, по умолчанию 10); `GET /books/{book_id}` — одна книга или `404`.',
          language: 'python',
          starterCode: `from typing import Annotated

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field, field_validator

app = FastAPI()


class BookIn(BaseModel):
    ...


class BookOut(BookIn):
    id: int


books: list[BookOut] = []

# TODO: POST /books, GET /books, GET /books/{book_id}`,
          solution: `from typing import Annotated

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field, field_validator

app = FastAPI()


class BookIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1)
    year: int = Field(ge=1450, le=2026)
    pages: int = Field(gt=0)

    @field_validator('title')
    @classmethod
    def strip_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Название не может быть пустым.')
        return v


class BookOut(BookIn):
    id: int


books: list[BookOut] = []


@app.post('/books', response_model=BookOut, status_code=201)
async def create_book(book: BookIn):
    new_book = BookOut(id=len(books) + 1, **book.model_dump())
    books.append(new_book)
    return new_book


@app.get('/books', response_model=list[BookOut])
async def list_books(limit: Annotated[int, Query(ge=1, le=100)] = 10):
    return books[:limit]


@app.get('/books/{book_id}', response_model=BookOut)
async def get_book(book_id: int):
    for book in books:
        if book.id == book_id:
            return book
    raise HTTPException(status_code=404, detail='Book not found')`,
          hints: [
            'Числовые ограничения задаются через Field: ge (больше или равно), le (меньше или равно), gt (строго больше). Для строк — min_length и max_length.',
            'Валидатор title: @field_validator("title") + @classmethod; внутри сделайте v.strip(), и если строка стала пустой — raise ValueError. Верните очищенное значение.',
            'В POST соберите BookOut из BookIn: BookOut(id=len(books) + 1, **book.model_dump()). Для limit используйте Annotated[int, Query(ge=1, le=100)] = 10, а при отсутствии книги — raise HTTPException(status_code=404).',
          ],
        },
      ],
    },
    {
      slug: 'auth',
      title: 'Аутентификация и авторизация',
      description: 'Сессии против токенов, устройство JWT, правильное хеширование паролей и проверки прав в DRF и FastAPI.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Утечки паролей случаются даже у гигантов, но последствия разные: если пароли хешировались через **argon2**, злоумышленник получает бесполезные строки, а если через `md5` или «голый» `sha256` — половина базы вскрывается за выходные на одной видеокарте. Безопасность API держится на двух вопросах: **кто ты** и **что тебе можно**. В этом уроке разберём оба: сессии и токены, устройство JWT, правильное хранение паролей и то, как проверки прав выражаются в коде DRF и FastAPI.',
        },
        { type: 'heading', text: 'Аутентификация vs авторизация' },
        {
          type: 'text',
          text: '**Аутентификация** отвечает на вопрос «кто ты»: проверка пароля, токена, кода из SMS. **Авторизация** — «что тебе разрешено»: может ли этот пользователь удалить эту статью. Порядок всегда такой: сначала аутентификация, потом авторизация. На языке HTTP им соответствуют разные статусы: провал аутентификации — `401 Unauthorized` (учётных данных нет или они невалидны), провал авторизации — `403 Forbidden` (мы знаем, кто ты, но прав не хватает). Путать их — значит ломать логику клиентов: на `401` фронтенд обычно уводит на страницу логина, на `403` — показывает «доступ запрещён».',
        },
        { type: 'heading', text: 'Сессии и куки vs токены' },
        {
          type: 'table',
          headers: ['Критерий', 'Сессии + куки', 'JWT-токены'],
          rows: [
            ['Где состояние', 'На сервере (БД/Redis), у клиента только session id', 'В самом токене — сервер ничего не хранит'],
            ['Отзыв доступа', 'Мгновенный: удалить сессию', 'Сложный: ждать `exp` или вести чёрный список'],
            ['Масштабирование', 'Нужно общее хранилище сессий', 'Любой инстанс проверит подпись сам'],
            ['Главная поверхность атаки', 'CSRF: браузер шлёт куки автоматически', 'XSS: если токен доступен JavaScript'],
            ['CSRF-защита', 'Обязательна: `SameSite`, csrf-токены', 'Не нужна, если токен идёт в заголовке `Authorization`'],
            ['Мобильные приложения и SPA', 'Неудобно', 'Нативно'],
          ],
        },
        { type: 'heading', text: 'JWT: структура, подпись, access и refresh' },
        {
          type: 'code',
          language: 'python',
          code: `import datetime as dt

import jwt  # pip install pyjwt

SECRET = 'change-me'  # в проде — только из переменных окружения!
ACCESS_TTL = dt.timedelta(minutes=15)
REFRESH_TTL = dt.timedelta(days=7)


def create_token(user_id: int, ttl: dt.timedelta, token_type: str) -> str:
    now = dt.datetime.now(dt.timezone.utc)
    payload = {
        'sub': str(user_id),   # subject — чей токен
        'type': token_type,    # 'access' или 'refresh'
        'iat': now,            # issued at — когда выпущен
        'exp': now + ttl,      # истечение — проверяется при decode
    }
    return jwt.encode(payload, SECRET, algorithm='HS256')


access = create_token(42, ACCESS_TTL, 'access')
# Токен: header.payload.signature — три base64-части через точку
print(access.count('.'))  # 2

# decode проверяет подпись И срок действия
payload = jwt.decode(access, SECRET, algorithms=['HS256'])
print(payload['sub'])     # '42'
# Подделанный или истёкший токен -> jwt.exceptions.InvalidTokenError`,
        },
        {
          type: 'text',
          text: 'Стандартная пара: короткоживущий **access-токен** (5-15 минут) ходит с каждым запросом в заголовке `Authorization: Bearer ...`, а долгоживущий **refresh-токен** используется только для получения нового access и в идеале ротируется при каждом обмене. Где хранить на клиенте? Access — в памяти приложения (переменная JS): его не достанет ни CSRF, ни чтение `localStorage`. Refresh — в **httpOnly-куке** с `SameSite=Strict`: JavaScript её не видит (защита от XSS), а SameSite прикрывает CSRF. Класть токены в `localStorage` — популярно, но любая XSS-уязвимость превращается в кражу аккаунта.',
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Payload JWT — это просто base64, а не шифрование: любой, кто перехватит токен, прочитает его содержимое. Подпись гарантирует только целостность и подлинность. Никогда не кладите в payload пароли и персональные данные. И помните: выпущенный JWT нельзя «выключить» — до `exp` он валиден, поэтому access-токены делают короткоживущими.',
        },
        { type: 'heading', text: 'Хеширование паролей' },
        {
          type: 'code',
          language: 'python',
          code: `# pip install argon2-cffi
# argon2 — победитель Password Hashing Competition, выбор по умолчанию в 2026
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher()  # разумные дефолты: time_cost, memory_cost, parallelism

hash1 = ph.hash('correct horse battery staple')
hash2 = ph.hash('correct horse battery staple')
print(hash1 == hash2)  # False! Соль генерируется сама и хранится внутри хеша

# Проверка при логине
try:
    ph.verify(hash1, 'correct horse battery staple')  # ок
    ph.verify(hash1, 'wrong password')                # исключение
except VerifyMismatchError:
    print('Неверный пароль')

# Почему НЕ sha256: он спроектирован быстрым — современная GPU
# считает миллиарды sha256 в секунду, перебор словаря занимает часы.
# argon2/bcrypt намеренно медленные и (argon2) требовательные к памяти:
# каждая попытка перебора стоит дорого. Соль защищает от радужных
# таблиц: одинаковые пароли дают разные хеши.`,
        },
        {
          type: 'note',
          variant: 'info',
          text: '**OAuth 2.0 в двух словах** — это протокол делегирования доступа, на котором построен «Вход через Google». Поток authorization code: приложение перенаправляет пользователя на Google, тот подтверждает доступ, Google возвращает одноразовый `code` на ваш redirect URI, сервер обменивает его (вместе с client_secret) на токены и получает профиль пользователя. Пароль пользователя ваше приложение не видит вообще — в этом весь смысл. В Python это удобно делать библиотекой `authlib`.',
        },
        { type: 'heading', text: 'Permissions в DRF и Depends-проверки в FastAPI' },
        {
          type: 'code',
          language: 'python',
          code: `# --- DRF: permission-классы ---
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return obj.author == request.user

# Во ViewSet:
#   permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]


# --- FastAPI: та же логика через цепочку Depends ---
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='auth/login')


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, SECRET, algorithms=['HS256'])
    except jwt.InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Invalid token')
    user = await get_user_by_id(int(payload['sub']))
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'User not found')
    return user


async def get_admin_user(user: Annotated[User, Depends(get_current_user)]):
    if not user.is_admin:
        # 403: пользователь опознан, но прав не хватает
        raise HTTPException(status.HTTP_403_FORBIDDEN, 'Admins only')
    return user


# @app.delete('/users/{user_id}')
# async def delete_user(user_id: int,
#                       admin: Annotated[User, Depends(get_admin_user)]): ...`,
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Аутентификация — «кто ты» (`401`), авторизация — «что тебе можно» (`403`); сначала первая, потом вторая.',
            'Сессии дают мгновенный отзыв, но требуют общего хранилища и защиты от CSRF; токены stateless, но их поверхность атаки — XSS и невозможность отзыва до `exp`.',
            'JWT = `header.payload.signature`; подпись защищает от подделки, но payload читается любым — секретам там не место.',
            'Схема access (короткий, в памяти) + refresh (httpOnly-кука, ротация) — рабочий компромисс для SPA.',
            'Пароли — только через argon2 или bcrypt: медленные, с настраиваемой стоимостью и автоматической солью. Быстрые хеши вроде sha256 вскрываются на GPU.',
            'OAuth 2.0 делегирует вход стороннему провайдеру: ваше приложение получает токены и профиль, не видя пароля.',
            'Проверки прав: в DRF — permission-классы с `has_object_permission`, в FastAPI — цепочки `Depends` (`get_current_user` -> `get_admin_user`).',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Аутентифицированный пользователь пытается удалить чужую статью, на что у него нет прав. Что должен вернуть сервер?',
          options: [
            '401 Unauthorized — это провал аутентификации',
            '403 Forbidden — это провал авторизации: сервер знает, кто это, но прав недостаточно',
            '400 Bad Request — запрос сформирован некорректно',
            '302 Found — перенаправить на страницу логина',
          ],
          correctIndex: 1,
          explanation: 'Пользователь уже аутентифицирован — токен валиден, личность известна, поэтому 401 не подходит. Провалилась именно авторизация: проверка «можно ли этому пользователю это действие». Это ровно случай 403. Запрос при этом синтаксически корректен (не 400), а редирект на логин бессмыслен — пользователь уже вошёл.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Почему для хранения паролей нельзя использовать «голый» sha256, даже с солью?',
          options: [
            'sha256 математически взломан и даёт коллизии',
            'sha256 слишком медленный для проверки при логине',
            'sha256 слишком быстрый: GPU перебирает миллиарды хешей в секунду, а bcrypt/argon2 намеренно медленные и настраиваемые',
            'sha256 не умеет работать со строками в Unicode',
          ],
          correctIndex: 2,
          explanation: 'Проблема именно в скорости: sha256 создан для быстрой проверки целостности данных, поэтому перебор словаря паролей на видеокартах занимает часы даже с солью. bcrypt и argon2 спроектированы наоборот — медленными, с настраиваемым cost-фактором, а argon2 ещё и требует много памяти, что делает GPU-фермы неэффективными. Практических коллизий у sha256 нет, и с Unicode он работает нормально.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Что на самом деле гарантирует подпись JWT?',
          options: [
            'Целостность и подлинность: токен выпущен владельцем секрета и не был изменён',
            'Конфиденциальность: содержимое payload зашифровано и недоступно посторонним',
            'Невозможность повторного использования перехваченного токена',
            'Автоматическое продление срока жизни токена при активности',
          ],
          correctIndex: 0,
          explanation: 'Подпись — это HMAC (или асимметричная подпись) от header и payload: изменение хотя бы байта делает её невалидной, а создать её может только владелец секрета. Но payload — обычный base64, его читает кто угодно, поэтому конфиденциальности нет. Перехваченный токен полностью работоспособен до истечения exp, и продлеваться сам он тоже не умеет — для этого существует refresh-токен.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Зависимость get_current_user для FastAPI',
          description: 'Напишите зависимость `get_current_user`, защищающую эндпоинт `GET /me`. Она должна: извлекать Bearer-токен через `OAuth2PasswordBearer`, декодировать его PyJWT с алгоритмом `HS256` (невалидный или истёкший токен — `401` с заголовком `WWW-Authenticate: Bearer`), находить пользователя в словаре `FAKE_USERS` по `payload["sub"]` (не найден — `401`), а для неактивного пользователя (`is_active=False`) возвращать `403`. Эндпоинт `/me` возвращает найденного пользователя.',
          language: 'python',
          starterCode: `from typing import Annotated

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET = 'test-secret'
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='auth/login')

FAKE_USERS = {
    '1': {'id': 1, 'username': 'alice', 'is_active': True},
    '2': {'id': 2, 'username': 'bob', 'is_active': False},
}


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    ...  # TODO


@app.get('/me')
def read_me(user: Annotated[dict, Depends(get_current_user)]):
    return user`,
          solution: `from typing import Annotated

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET = 'test-secret'
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='auth/login')

FAKE_USERS = {
    '1': {'id': 1, 'username': 'alice', 'is_active': True},
    '2': {'id': 2, 'username': 'bob', 'is_active': False},
}


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    try:
        payload = jwt.decode(token, SECRET, algorithms=['HS256'])
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or expired token',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    user = FAKE_USERS.get(payload.get('sub', ''))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User not found',
        )
    if not user['is_active']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='User is disabled',
        )
    return user


@app.get('/me')
def read_me(user: Annotated[dict, Depends(get_current_user)]):
    return user`,
          hints: [
            'jwt.decode(token, SECRET, algorithms=["HS256"]) сам проверит подпись и exp. Все ошибки декодирования наследуются от jwt.InvalidTokenError — ловите его в try/except.',
            'При невалидном токене бросьте HTTPException со status.HTTP_401_UNAUTHORIZED и headers={"WWW-Authenticate": "Bearer"} — так требует спецификация Bearer-аутентификации.',
            'Разделяйте случаи: токен не декодируется или пользователь не найден — 401 (не знаем, кто это); пользователь найден, но is_active=False — 403 (знаем, но доступ запрещён).',
          ],
        },
      ],
    },
    {
      slug: 'middleware',
      title: 'Middleware',
      description: 'Цепочка обработки запроса в Django и FastAPI, CORS с preflight-запросами, request-id для трассировки, логирование времени ответа и rate limiting.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Три часа ночи, продакшен деградирует, а в логах — тысячи строк, которые невозможно связать между собой: где здесь строки одного и того же запроса? Один раз добавив в каждый ответ заголовок `X-Request-ID`, вы больше никогда не согласитесь жить без него. Аутентификация, CORS, логирование, лимиты запросов — это **cross-cutting concerns**: они нужны каждому эндпоинту, и копировать их в каждую view — путь к рассинхрону и дырам в безопасности. Для таких задач существует middleware — слой, через который проходит **каждый** запрос и каждый ответ. В этом уроке разберём, как устроена цепочка middleware в Django и FastAPI, почему браузер шлёт загадочные OPTIONS-запросы и как своими руками собрать request-id, замер времени ответа и rate limiting.',
        },
        { type: 'heading', text: 'Луковица: цепочка обработки запроса' },
        {
          type: 'text',
          text: 'Middleware выстраиваются в **луковицу**: запрос проходит слои снаружи внутрь, доходит до view, а ответ возвращается через те же слои в обратном порядке. Каждый слой может: обогатить запрос (положить `request.user` или request-id), **вернуть ответ немедленно**, не пуская запрос глубже — это называется short-circuit, так работают rate limiting и проверки доступа, — изменить ответ (дописать заголовок, сжать тело) или поймать исключение из нижних слоёв. Отсюда главное правило: **порядок имеет значение**. Аутентификация должна стоять раньше любого слоя, который читает `request.user`; CORS — снаружи, чтобы ответить на preflight до всякой аутентификации; rate limiting — как можно раньше, чтобы отбрасывать лишний трафик дёшево, не тратя на него подключения к БД.',
        },
        { type: 'heading', text: 'Django: класс с __call__ и get_response' },
        {
          type: 'code',
          language: 'python',
          code: `# app/middleware.py
import logging
import time
import uuid

logger = logging.getLogger('app.requests')


class ObservabilityMiddleware:
    def __init__(self, get_response):
        # вызывается ОДИН раз при старте процесса
        self.get_response = get_response

    def __call__(self, request):
        # --- путь запроса (снаружи внутрь) ---
        request.request_id = request.headers.get(
            'X-Request-ID', str(uuid.uuid4())
        )
        start = time.perf_counter()

        response = self.get_response(request)  # всё, что глубже: middleware и view

        # --- путь ответа (изнутри наружу) ---
        duration_ms = (time.perf_counter() - start) * 1000
        response['X-Request-ID'] = request.request_id
        logger.info(
            '%s %s -> %s за %.1f мс [%s]',
            request.method, request.path,
            response.status_code, duration_ms, request.request_id,
        )
        return response


# settings.py — порядок критичен: запрос идёт сверху вниз, ответ — снизу вверх
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',    # CORS — как можно выше
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'app.middleware.ObservabilityMiddleware',   # наш слой
]`,
        },
        {
          type: 'text',
          text: 'Django-middleware — это вызываемый объект: `__init__` получает `get_response` один раз при старте, `__call__` выполняется на каждый запрос. Всё **до** `self.get_response(request)` — путь запроса, всё **после** — путь ответа. Если вернуть `HttpResponse`, не вызвав `get_response`, запрос не дойдёт ни до нижних middleware, ни до view — это и есть short-circuit. Помимо `__call__` есть опциональные хуки: `process_view` (перед вызовом view), `process_exception` (необработанное исключение из view) и `process_template_response`. Middleware может быть и асинхронным — Django сам адаптирует вызовы между sync и async, но каждое такое переключение стоит производительности, поэтому в async-проекте стоит писать async-middleware.',
        },
        { type: 'heading', text: 'FastAPI и Starlette' },
        {
          type: 'code',
          language: 'python',
          code: `# main.py
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()


@app.middleware('http')                    # способ первый: функция-декоратор
async def timing_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)    # всё, что глубже по цепочке
    elapsed_ms = (time.perf_counter() - start) * 1000
    response.headers['X-Response-Time-ms'] = f'{elapsed_ms:.1f}'
    return response


class RequestIDMiddleware(BaseHTTPMiddleware):  # способ второй: класс
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get('X-Request-ID', str(uuid.uuid4()))
        request.state.request_id = request_id   # доступно в любом эндпоинте
        response = await call_next(request)
        response.headers['X-Request-ID'] = request_id
        return response


app.add_middleware(RequestIDMiddleware)
app.add_middleware(                        # добавлен ПОСЛЕДНИМ — внешний слой:
    CORSMiddleware,                        # preflight обработается раньше всех
    allow_origins=['https://app.example.com'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: '`BaseHTTPMiddleware` удобен, но несёт накладные расходы и известные ограничения — например, проблемы с `contextvars` и потоковыми ответами; для критичных к производительности задач Starlette рекомендует «чистый» ASGI-middleware. И следите за порядком: каждый `add_middleware()` оборачивает приложение **снаружи**, поэтому последний добавленный middleware первым видит запрос. Никогда не сочетайте `allow_origins=["*"]` с `allow_credentials=True` — браузеры такое отвергают, и это дыра в безопасности.',
        },
        { type: 'heading', text: 'CORS: почему браузер шлёт OPTIONS' },
        {
          type: 'text',
          text: 'Браузер запрещает JavaScript с одного origin читать ответы другого origin — это **same-origin policy**, базовая защита от кражи данных чужим сайтом. **CORS** (Cross-Origin Resource Sharing) — механизм, которым сервер явно разрешает кросс-доменные запросы. «Простые» запросы (`GET` или `POST` с формами, без нестандартных заголовков) браузер отправляет сразу и лишь проверяет `Access-Control-Allow-Origin` в ответе. Но если запрос выходит за рамки «простого» — метод `PUT`/`PATCH`/`DELETE`, заголовок `Authorization`, `Content-Type: application/json` — браузер сначала шлёт **preflight**: запрос `OPTIONS` с заголовками `Access-Control-Request-Method` и `Access-Control-Request-Headers`. Только получив разрешающие `Access-Control-Allow-*` заголовки, он отправит настоящий запрос; ответ на preflight кэшируется на время `Access-Control-Max-Age`. Важно: CORS — это ограничение **браузера**. `curl` и Postman отработают без единой жалобы, поэтому аргумент «в Postman же работает» ничего не доказывает.',
        },
        {
          type: 'table',
          headers: ['Запрос', 'Будет ли preflight'],
          rows: [
            ['`GET`/`HEAD` без нестандартных заголовков', 'Нет — «простой» запрос уходит сразу'],
            ['`POST` с `Content-Type: application/x-www-form-urlencoded`, `multipart/form-data` или `text/plain`', 'Нет — формы существовали до CORS и считаются «простыми»'],
            ['`POST` с `Content-Type: application/json`', 'Да — такой Content-Type не входит в «простой» список'],
            ['Любой запрос с `Authorization` или своим заголовком вроде `X-Request-ID`', 'Да — нестандартные заголовки требуют разрешения сервера'],
            ['`PUT`, `PATCH`, `DELETE`', 'Да — методы вне «простого» списка'],
          ],
        },
        { type: 'heading', text: 'Кейс: rate limiting в 25 строк' },
        {
          type: 'code',
          language: 'python',
          code: `# ratelimit.py — sliding window в памяти процесса.
# Для нескольких воркеров/серверов счётчики выносят в Redis.
import time
from collections import defaultdict, deque

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

WINDOW_SEC = 60
LIMIT = 100  # запросов с одного IP за окно

hits: dict[str, deque[float]] = defaultdict(deque)

app = FastAPI()


@app.middleware('http')
async def rate_limit(request: Request, call_next):
    ip = request.client.host if request.client else 'unknown'
    now = time.monotonic()

    q = hits[ip]
    while q and now - q[0] > WINDOW_SEC:  # выкидываем устаревшие отметки
        q.popleft()

    if len(q) >= LIMIT:
        retry_after = int(WINDOW_SEC - (now - q[0])) + 1
        return JSONResponse(              # short-circuit: до эндпоинта не дойдёт
            status_code=429,
            content={'detail': 'Too many requests'},
            headers={'Retry-After': str(retry_after)},
        )

    q.append(now)
    return await call_next(request)`,
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Middleware — луковица: запрос идёт снаружи внутрь, ответ — в обратном порядке; слой может изменить запрос, изменить ответ или замкнуть цепочку, вернув ответ сразу (short-circuit).',
            'Порядок критичен: CORS — снаружи, rate limiting — как можно раньше, аутентификация — до всех, кто читает `request.user`.',
            'Django: класс с `__init__(get_response)` и `__call__`; порядок задаёт список `MIDDLEWARE` в settings.py — сверху вниз для запроса, снизу вверх для ответа.',
            'FastAPI/Starlette: `@app.middleware("http")` или `BaseHTTPMiddleware`; каждый `add_middleware()` оборачивает приложение снаружи — последний добавленный видит запрос первым.',
            'Preflight `OPTIONS` — проверка браузера перед «непростым» кросс-доменным запросом; CORS-ошибки видны только в браузере, `curl` их не покажет.',
            'Request-id, тайминги и rate limiting — стандартный обвес production-API; in-memory лимитер живёт в одном процессе, для нескольких воркеров нужен Redis.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'В Django задан список MIDDLEWARE: сначала SecurityMiddleware, затем AuthenticationMiddleware, затем LoggingMiddleware. В каком порядке они обработают запрос и ответ?',
          options: [
            'Запрос и ответ проходят слои в одном порядке: Security → Auth → Logging',
            'Запрос: Security → Auth → Logging; ответ: Logging → Auth → Security',
            'Запрос: Logging → Auth → Security; ответ: Security → Auth → Logging',
            'Порядок не определён — Django вызывает middleware в произвольном порядке',
          ],
          correctIndex: 1,
          explanation: 'Список MIDDLEWARE читается сверху вниз на пути запроса, а ответ поднимается по цепочке в обратном порядке — это и есть модель луковицы. SecurityMiddleware первым видит запрос и последним трогает ответ. От порядка зависит работоспособность: слой, читающий request.user, обязан стоять ниже AuthenticationMiddleware.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'SPA с https://app.example.com делает fetch POST на https://api.example.com/orders с заголовками Authorization и Content-Type: application/json. Почему в DevTools перед POST виден запрос OPTIONS?',
          options: [
            'Браузер проверяет, что сервер запущен, прежде чем отправлять данные',
            'Так требует HTTP/2 для всех кросс-доменных POST-запросов',
            'Запрос кросс-доменный и «непростой», поэтому браузер шлёт preflight — спрашивает у сервера разрешение на такой метод и заголовки',
            'Сервер ответил 401, и браузер повторил запрос методом OPTIONS',
          ],
          correctIndex: 2,
          explanation: 'Заголовок Authorization и Content-Type: application/json выводят запрос из категории «простых», поэтому браузер обязан сначала отправить OPTIONS с Access-Control-Request-Method и Access-Control-Request-Headers. Только получив разрешающие Access-Control-Allow-* заголовки, он выполнит настоящий POST. Ответ на preflight кэшируется на Access-Control-Max-Age, поэтому OPTIONS виден не перед каждым запросом.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Middleware в середине цепочки вернул HttpResponse, не вызвав self.get_response(request). Что произойдёт?',
          options: [
            'Нижние middleware и view не выполнятся — клиент получит этот ответ, а верхние слои обработают его на обратном пути',
            'Django бросит исключение: вызывать get_response обязательно',
            'Запрос всё равно дойдёт до view, а ответ middleware будет проигнорирован',
            'Клиент получит ответ, но view выполнится в фоновом режиме',
          ],
          correctIndex: 0,
          explanation: 'Это short-circuit — легальный и полезный приём: так работают rate limiting, режим обслуживания и проверки доступа. Всё, что глубже по цепочке, просто не выполняется, и это экономит ресурсы. Слои выше по списку при этом увидят ответ на обратном пути и смогут, например, добавить свои заголовки.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Middleware режима обслуживания',
          description: 'Напишите Django-middleware `MaintenanceModeMiddleware`. Если `settings.MAINTENANCE_MODE` равен `True`, он немедленно возвращает `JsonResponse` со статусом `503`, телом `{"detail": "Service temporarily unavailable"}` и заголовком `Retry-After: 600`, не пуская запрос дальше (short-circuit). Исключение — пути, начинающиеся с `/health`: проверки живости должны работать всегда. В остальных случаях запрос идёт дальше по цепочке. В любой ответ добавьте заголовок `X-Request-ID` — из входящего запроса или новый `uuid4`.',
          language: 'python',
          starterCode: `# app/middleware.py
import uuid

from django.conf import settings
from django.http import JsonResponse


class MaintenanceModeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ...  # TODO`,
          solution: `# app/middleware.py
import uuid

from django.conf import settings
from django.http import JsonResponse


class MaintenanceModeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.headers.get('X-Request-ID', str(uuid.uuid4()))

        on_maintenance = getattr(settings, 'MAINTENANCE_MODE', False)
        is_health_check = request.path.startswith('/health')

        if on_maintenance and not is_health_check:
            # short-circuit: до view и нижних middleware запрос не дойдёт
            response = JsonResponse(
                {'detail': 'Service temporarily unavailable'},
                status=503,
            )
            response['Retry-After'] = '600'
        else:
            response = self.get_response(request)

        response['X-Request-ID'] = request_id
        return response`,
          hints: [
            'Short-circuit — это просто return готового ответа до вызова self.get_response(request): нижние слои и view не выполнятся.',
            'Флаг читайте через getattr(settings, "MAINTENANCE_MODE", False) — так middleware не упадёт, если настройка не задана. Health-check определяйте по request.path.startswith("/health").',
            'Заголовки в Django-ответ добавляются как ключи словаря: response["Retry-After"] = "600". X-Request-ID удобно поставить в самом конце — он нужен в обеих ветках.',
          ],
        },
      ],
    },
    {
      slug: 'api-testing',
      title: 'Тестирование API',
      description: 'Пирамида тестов, pytest с фикстурами и parametrize, APIClient в DRF, TestClient и dependency_overrides в FastAPI, фабрики, моки внешних сервисов и coverage.',
      duration: 32,
      blocks: [
        {
          type: 'text',
          text: 'Классический сценарий: рефакторинг «безобидного» сериализатора, деплой, и через час поддержка приносит скриншоты — создание заказов сломано. Без тестов каждая правка API — рулетка, а ручная проверка через Postman суммарно съедает больше времени, чем написание автотестов, — просто это время размазано, и его никто не считает. Хорошая новость: API тестировать проще, чем UI, потому что у него строгий контракт — статус-коды, JSON-схемы, заголовки. В этом уроке соберём тестовый арсенал backend-разработчика: pytest с фикстурами и параметризацией, `APIClient` для Django/DRF, `TestClient` с подменой зависимостей для FastAPI, фабрики вместо ручных объектов, моки внешних сервисов и трезвый взгляд на coverage.',
        },
        { type: 'heading', text: 'Пирамида тестов для API' },
        {
          type: 'table',
          headers: ['Уровень', 'Что проверяет', 'Скорость', 'Сколько их'],
          rows: [
            ['Unit', 'Чистая логика: расчёт скидки, сериализатор, валидатор — без БД и сети', 'Миллисекунды', 'Много — фундамент пирамиды'],
            ['Интеграционные (API)', 'Эндпоинт целиком через тестовый клиент: роутинг, валидация, права, запись в БД', 'Десятки миллисекунд', 'Ядро набора — для API это главный уровень'],
            ['E2E', 'Весь стек на развёрнутом окружении, вместе с фронтендом', 'Секунды и минуты', 'Единицы — только критичные пользовательские сценарии'],
          ],
        },
        { type: 'heading', text: 'pytest: фикстуры, parametrize и conftest.py' },
        {
          type: 'code',
          language: 'python',
          code: `# tests/conftest.py — фикстуры отсюда видны всем тестам пакета БЕЗ импорта
import pytest


@pytest.fixture
def order_payload() -> dict:
    return {'product_id': 42, 'quantity': 2}


@pytest.fixture(scope='session')
def heavy_resource():
    resource = start_expensive_service()  # setup — один раз на весь прогон
    yield resource                        # значение фикстуры
    resource.shutdown()                   # teardown — выполнится даже после падений


# tests/test_pricing.py — parametrize: одна функция, много тест-кейсов
import pytest

from app.pricing import apply_discount


@pytest.mark.parametrize(
    ('total', 'promo_code', 'expected'),
    [
        (1000, 'SAVE10', 900),   # скидка 10%
        (1000, None, 1000),      # без промокода
        (100, 'SAVE10', 90),     # скидка на маленькую сумму
    ],
)
def test_apply_discount(total, promo_code, expected):
    assert apply_discount(total, promo_code) == expected`,
        },
        {
          type: 'text',
          text: 'Фикстура — это поставщик зависимостей для теста: pytest видит имя параметра в сигнатуре, находит одноимённую фикстуру и подставляет её результат. Фикстуры из `conftest.py` доступны всем тестам каталога и подкаталогов **без импорта** — именно там живут `client`, `user` и подключение к БД. У фикстуры есть область жизни: `scope="function"` (по умолчанию — на каждый тест) или `scope="session"` — один раз на весь прогон, для дорогих ресурсов вроде контейнера с PostgreSQL. `yield` разделяет setup и teardown: код после `yield` выполнится, даже если тест упал. А `@pytest.mark.parametrize` превращает таблицу случаев в отдельные тесты: каждый набор параметров виден в отчёте отдельной строкой, и падение одного не скрывает остальные.',
        },
        { type: 'heading', text: 'Django и DRF: APIClient и тестовая БД' },
        {
          type: 'code',
          language: 'python',
          code: `# tests/test_orders_api.py — нужен пакет pytest-django
import pytest
from rest_framework.test import APIClient

from orders.models import Order


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(django_user_model):
    return django_user_model.objects.create_user(
        username='alice', password='secret'
    )


@pytest.mark.django_db          # без маркера доступ к БД запрещён
def test_create_order(client, user):
    client.force_authenticate(user=user)   # без ритуала логина

    resp = client.post(
        '/api/v1/orders/',
        {'product_id': 42, 'quantity': 2},
        format='json',
    )

    assert resp.status_code == 201
    assert resp.json()['status'] == 'created'
    assert Order.objects.filter(user=user).count() == 1


@pytest.mark.django_db
def test_anonymous_cannot_create_order(client):
    resp = client.post('/api/v1/orders/', {}, format='json')

    assert resp.status_code == 401
    assert Order.objects.count() == 0`,
        },
        { type: 'heading', text: 'FastAPI: TestClient и dependency_overrides' },
        {
          type: 'code',
          language: 'python',
          code: `# tests/test_orders_api.py
import pytest
from fastapi.testclient import TestClient

from app.deps import get_current_user, get_session
from app.main import app


def fake_user() -> dict:
    return {'id': 1, 'username': 'alice'}


@pytest.fixture
def client(test_session):  # test_session — фикстура с транзакцией и rollback
    app.dependency_overrides[get_current_user] = fake_user
    app.dependency_overrides[get_session] = lambda: test_session
    with TestClient(app) as c:        # with запускает lifespan-события
        yield c
    app.dependency_overrides.clear()  # иначе подмена протечёт в другие тесты


def test_create_order(client):
    resp = client.post('/api/v1/orders', json={'product_id': 42, 'quantity': 2})

    assert resp.status_code == 201
    body = resp.json()
    assert body['status'] == 'created'
    assert body['user_id'] == 1


def test_invalid_quantity_returns_422(client):
    resp = client.post('/api/v1/orders', json={'product_id': 42, 'quantity': 0})
    assert resp.status_code == 422`,
        },
        {
          type: 'note',
          variant: 'tip',
          text: '`app.dependency_overrides` — словарь «настоящая зависимость → подмена»: FastAPI сверяется с ним при каждом разрешении `Depends`. Это официальный способ подсунуть тестовую БД или фейкового пользователя — без `mock.patch` и хрупких путей импорта. Обязательно вызывайте `dependency_overrides.clear()` после теста (лучше всего — после `yield` в фикстуре). В pytest-django ту же роль играет маркер `@pytest.mark.django_db`: тестовая БД создаётся один раз за прогон, а каждый тест оборачивается в транзакцию с откатом — данные тестов не пересекаются. Флаг `--reuse-db` ускоряет повторные запуски.',
        },
        { type: 'heading', text: 'Фабрики, моки внешних сервисов и coverage' },
        {
          type: 'code',
          language: 'python',
          code: `# tests/factories.py — factory_boy: осмысленные значения по умолчанию
import factory

from orders.models import Order


class OrderFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Order

    product_id = factory.Sequence(lambda n: n + 1)
    quantity = 1
    status = 'pending'


# tests/test_payments.py — мокаем внешний платёжный шлюз (библиотека responses)
import pytest
import responses

from payments.service import charge_order
from tests.factories import OrderFactory


@responses.activate
@pytest.mark.django_db
def test_gateway_error_marks_order_failed():
    order = OrderFactory()               # остальные поля — из фабрики
    responses.post(
        'https://pay.example.com/api/charge',
        json={'error': 'insufficient funds'},
        status=402,
    )

    charge_order(order)

    order.refresh_from_db()
    assert order.status == 'failed'`,
        },
        {
          type: 'text',
          text: 'Фикстуры хранят готовые объекты, фабрики — **рецепты**: `OrderFactory(status="paid")` переопределяет только важное для теста поле, остальное берётся из значений по умолчанию, и тест читается как спецификация. Внешние HTTP-сервисы в тестах не вызывают никогда: `responses` (для `requests`) и `respx` (для `httpx`) перехватывают запросы на уровне транспорта, а `unittest.mock.patch` подменяет произвольные объекты — с одним правилом: **патчить надо там, где объект используется**, а не там, где он объявлен. Coverage измеряйте (`pytest --cov=app --cov-report=term-missing`), но не обожествляйте: 80-90% по строкам — разумный ориентир для API-проекта, а погоня за 100% плодит бессмысленные тесты геттеров. И главное: тест с говорящим именем вроде `test_anonymous_cannot_create_order` — это документация, которая не устаревает, потому что падает, как только перестаёт соответствовать коду.',
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Для API главный уровень пирамиды — интеграционные тесты через тестовый клиент: быстрые и проверяют роутинг, валидацию, права и БД разом.',
            'pytest: фикстуры внедряются по имени параметра, `conftest.py` делает их доступными без импорта, `parametrize` превращает таблицу случаев в отдельные тесты, код после `yield` — гарантированный teardown.',
            'Django/DRF: `APIClient` + `@pytest.mark.django_db`; каждый тест идёт в транзакции с откатом, `force_authenticate` избавляет от ритуала логина.',
            'FastAPI: `TestClient` + `app.dependency_overrides` — официальный способ подменить БД и пользователя; после теста обязателен `clear()`.',
            'Фабрики (factory_boy) — рецепты объектов с переопределением только значимых полей; внешние сервисы мокайте через `responses`/`respx` — реальной сети в тестах быть не должно.',
            'Coverage 80-90% — ориентир, а не самоцель; осмысленные имена тестов превращают тестовый набор в живую документацию API.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Как в тестах FastAPI правильно подменить зависимость get_session, чтобы эндпоинты работали с тестовой БД?',
          options: [
            'Пропатчить её через unittest.mock.patch("app.main.get_session") в каждом тесте',
            'Добавить в get_session проверку переменной окружения TESTING и возвращать тестовую сессию',
            'Присвоить app.dependency_overrides[get_session] = get_test_session, а после теста вызвать clear()',
            'Создать отдельную копию приложения, импортирующую тестовую сессию',
          ],
          correctIndex: 2,
          explanation: 'dependency_overrides — встроенный механизм FastAPI: при разрешении Depends фреймворк сначала смотрит в этот словарь. mock.patch хрупок — ломается при смене места импорта, а ветвление по TESTING в боевом коде смешивает тестовую логику с продакшеном. Главное — очищать словарь после теста, иначе подмена протечёт в соседние тесты.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Тест с pytest-django падает с ошибкой «Database access not allowed». Что нужно сделать?',
          options: [
            'Пометить тест маркером @pytest.mark.django_db или запросить фикстуру db',
            'Запустить pytest с флагом --reuse-db',
            'Выполнить python manage.py migrate перед запуском тестов',
            'Заменить APIClient на настоящие запросы через библиотеку requests',
          ],
          correctIndex: 0,
          explanation: 'pytest-django по умолчанию блокирует доступ к БД, чтобы юнит-тесты оставались быстрыми и явными. Маркер django_db (или фикстура db) снимает блокировку и оборачивает тест в транзакцию с откатом. Флаг --reuse-db лишь ускоряет повторные запуски, а migrate не имеет отношения к этой блокировке.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'В чём роль файла conftest.py в pytest-проекте?',
          options: [
            'Это главный конфиг pytest, заменяющий pytest.ini и pyproject.toml',
            'Он ускоряет прогон, кэшируя результаты тестов между запусками',
            'Без него pytest не сможет обнаружить тестовые файлы в каталоге',
            'Объявленные в нём фикстуры автоматически доступны всем тестам каталога и подкаталогов — без импорта',
          ],
          correctIndex: 3,
          explanation: 'pytest сам находит conftest.py и регистрирует его фикстуры — импортировать их в тесты не нужно и не принято. Обнаружение тестов работает по соглашениям имён test_*.py независимо от conftest, а конфигурация живёт в pytest.ini или pyproject.toml. Обычно в conftest.py держат client, user и фикстуры БД.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Тесты FastAPI с подменой зависимости',
          description: 'Дан мини-сервис: `GET /orders` возвращает заказы текущего пользователя, которого определяет зависимость `get_current_user` (в бою она разбирает JWT). Напишите тесты: фикстуру `make_client`, которая через `app.dependency_overrides` подменяет пользователя на фейкового с нужным `id` и очищает подмену после теста, и параметризованный тест, проверяющий, что пользователь `1` видит один заказ, а пользователь `2` — пустой список.',
          language: 'python',
          starterCode: `# app.py — тестируемое приложение (менять не нужно)
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()

ORDERS = {
    1: [{'id': 10, 'product_id': 42, 'status': 'paid'}],
    2: [],
}


def get_current_user() -> dict:
    raise NotImplementedError('в проде здесь разбор JWT')


@app.get('/orders')
def list_orders(user: Annotated[dict, Depends(get_current_user)]):
    return {'user_id': user['id'], 'orders': ORDERS.get(user['id'], [])}


# test_orders.py — допишите тесты
import pytest
from fastapi.testclient import TestClient

# TODO: фикстура make_client и параметризованный тест`,
          solution: `# test_orders.py
import pytest
from fastapi.testclient import TestClient

from app import app, get_current_user


@pytest.fixture
def make_client():
    def _make(user_id: int) -> TestClient:
        app.dependency_overrides[get_current_user] = lambda: {'id': user_id}
        return TestClient(app)

    yield _make
    app.dependency_overrides.clear()  # teardown: не оставляем подмену


@pytest.mark.parametrize(
    ('user_id', 'expected_count'),
    [
        (1, 1),  # у первого пользователя один оплаченный заказ
        (2, 0),  # у второго заказов нет
    ],
)
def test_orders_visible_only_to_owner(make_client, user_id, expected_count):
    client = make_client(user_id)

    resp = client.get('/orders')

    assert resp.status_code == 200
    body = resp.json()
    assert body['user_id'] == user_id
    assert len(body['orders']) == expected_count`,
          hints: [
            'Подмена: app.dependency_overrides[get_current_user] = lambda: {"id": user_id}. FastAPI вызовет лямбду вместо настоящей зависимости.',
            'Фикстура-фабрика: объявите внутри фикстуры функцию _make(user_id), отдайте её через yield, а после yield вызовите app.dependency_overrides.clear() — это teardown.',
            'Параметризация: @pytest.mark.parametrize(("user_id", "expected_count"), [(1, 1), (2, 0)]) даст два независимых теста.',
          ],
        },
      ],
    },
  ],
}
