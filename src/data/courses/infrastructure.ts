import type { Course } from '@/types/course'

export const infrastructureCourse: Course = {
  slug: 'infrastructure',
  order: 4,
  title: 'Инфраструктура',
  description: 'Docker, CI/CD, деплой и мониторинг — путь кода от коммита до продакшена.',
  level: 'Средний',
  image: '/img-4.jpg',
  tags: ['Docker', 'CI/CD', 'DevOps'],
  lessons: [
    {
      slug: 'docker',
      title: 'Docker и Docker Compose',
      description: 'Упаковываем приложение в контейнер: Dockerfile со слоями и кэшированием, multi-stage build и полный dev-стек через Docker Compose.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Классическая история: на вашем ноутбуке всё работает, а у коллеги падает с `ModuleNotFoundError`, потому что у него Python 3.10 вместо 3.12 и другая версия `libpq`. На сервере — третья комбинация. Docker решает проблему «у меня работает» радикально: приложение вместе с интерпретатором, системными библиотеками и зависимостями упаковывается в **образ** — единый артефакт, который запускается одинаково на любой машине с Docker. Один раз собрали — везде работает: у коллеги, в CI и на продакшене.',
        },
        { type: 'heading', text: 'Образы и контейнеры' },
        {
          type: 'text',
          text: '**Образ (image)** — неизменяемый шаблон: файловая система, собранная из слоёв, плюс метаданные (какую команду запускать, какие порты открывать). **Контейнер (container)** — запущенный экземпляр образа: тот же образ плюс тонкий записываемый слой и изолированный процесс. Аналогия из Python: образ — это класс, контейнер — экземпляр. Из одного образа можно запустить хоть сто контейнеров, и все стартуют за миллисекунды, потому что слои образа переиспользуются.',
        },
        {
          type: 'table',
          headers: ['Вопрос', 'Образ', 'Контейнер'],
          rows: [
            ['Что это', 'Неизменяемый шаблон из слоёв', 'Работающий экземпляр с записываемым слоем'],
            ['Где живёт', 'В registry (Docker Hub, GHCR) и локальном кэше', 'На хосте, пока запущен или не удалён'],
            ['Как создаётся', '`docker build` по Dockerfile', '`docker run <образ>`'],
            ['Аналогия', 'Класс в Python', 'Экземпляр класса'],
          ],
        },
        { type: 'heading', text: 'Dockerfile для Python-приложения' },
        {
          type: 'code',
          language: 'docker',
          filename: 'Dockerfile',
          code: `FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Сначала копируем только манифест зависимостей —
# этот слой закэшируется и будет пересобираться редко
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Код меняется чаще всего, поэтому копируем его последним
COPY . .

# Не запускаем приложение под root
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
        },
        {
          type: 'text',
          text: 'Каждая инструкция создаёт **слой**, и Docker кэширует слои: если входные данные инструкции не изменились, слой берётся из кэша. Отсюда главное правило порядка: сначала `COPY requirements.txt` и `pip install`, потом `COPY . .`. Изменили одну строчку кода — пересоберётся только последний слой, а тяжёлая установка зависимостей возьмётся из кэша за доли секунды. База `python:3.12-slim` весит ~120 МБ против ~1 ГБ у полного образа — меньше места, быстрее pull и меньше поверхность атаки. `USER appuser` обязателен: процесс под root в контейнере при уязвимости даёт атакующему слишком много.',
        },
        {
          type: 'note',
          variant: 'tip',
          text: 'Создайте `.dockerignore` (синтаксис как у `.gitignore`) и добавьте туда `.git`, `.venv`, `__pycache__`, `.env`, `tests/`. Иначе всё это попадёт в build context и в образ: сборка замедлится, образ распухнет, а `.env` с секретами окажется внутри артефакта, который вы кладёте в registry.',
        },
        { type: 'heading', text: 'Multi-stage build' },
        {
          type: 'text',
          text: 'Для пакетов с компиляцией (например, `psycopg` из исходников) в образе нужны `gcc` и заголовочные файлы — но только на этапе сборки, в рантайме они мёртвый груз. **Multi-stage build** разделяет сборку и запуск: в первом этапе ставим зависимости, во второй — финальный — копируем только готовый результат. Итог: маленький образ без компиляторов и pip-кэша.',
        },
        {
          type: 'code',
          language: 'docker',
          filename: 'Dockerfile',
          code: `# Этап 1: установка зависимостей
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Этап 2: финальный образ — без build-инструментов и кэша pip
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
RUN useradd --create-home appuser
USER appuser
EXPOSE 8000
CMD ["gunicorn", "app.main:app", "-k", "uvicorn_worker.UvicornWorker", "-b", "0.0.0.0:8000"]`,
        },
        { type: 'heading', text: 'Docker Compose: dev-стек одной командой' },
        {
          type: 'code',
          language: 'yaml',
          filename: 'compose.yaml',
          code: `services:
  web:
    build: .
    ports:
      - "8000:8000"
    env_file: .env
    volumes:
      - .:/app            # bind mount: правки кода видны в контейнере сразу
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}   # подставится из .env
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data   # named volume: данные переживут пересоздание
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine

volumes:
  pgdata:`,
        },
        {
          type: 'text',
          text: '`docker compose up` поднимает весь стек: приложение, PostgreSQL 16 и Redis. Compose автоматически создаёт общую **сеть**, где сервисы видят друг друга по имени: строка подключения из `web` — `postgresql://app:...@db:5432/app`, именно `db`, а не `localhost`. **Volumes** решают две задачи: bind mount `.:/app` даёт живую разработку без пересборки, а named volume `pgdata` хранит данные БД вне контейнера — `docker compose down` и `up` их не потеряют. **Healthcheck** плюс `condition: service_healthy` гарантируют, что `web` стартует только когда PostgreSQL реально готов принимать соединения, а не просто запустил процесс — иначе приложение упадёт на первом же подключении.',
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Образ — неизменяемый шаблон из слоёв, контейнер — его запущенный экземпляр; один артефакт работает одинаково везде.',
            'Порядок инструкций решает: зависимости копируем и ставим до кода, чтобы кэш слоёв работал на нас.',
            'Базовый образ `python:3.12-slim`, non-root user и `.dockerignore` — минимальная гигиена любого продакшен-образа.',
            'Multi-stage build оставляет в финальном образе только рантайм, без компиляторов и кэшей.',
            'Docker Compose поднимает dev-стек одной командой: общая сеть по именам сервисов, named volumes для данных, healthcheck для правильного порядка старта.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Что верно описывает разницу между образом и контейнером?',
          options: [
            'Образ — это работающий процесс, а контейнер — файл на диске',
            'Образ — неизменяемый шаблон из слоёв, контейнер — его запущенный экземпляр с записываемым слоем',
            'Это синонимы: Docker использует оба термина взаимозаменяемо',
            'Контейнер хранится в registry, а образ создаётся при каждом запуске',
          ],
          correctIndex: 1,
          explanation: 'Образ собирается один раз и не меняется — это слои файловой системы плюс метаданные. При `docker run` поверх образа добавляется тонкий записываемый слой и запускается изолированный процесс — это и есть контейнер. Поэтому из одного образа можно запустить сколько угодно контейнеров.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Почему requirements.txt копируют в образ отдельной инструкцией, до COPY . .?',
          options: [
            'Docker не умеет копировать несколько файлов одной командой',
            'Чтобы файл оказался в отдельном слое и его нельзя было изменить',
            'Чтобы слой с установкой зависимостей брался из кэша, пока requirements.txt не изменился',
            'pip требует, чтобы requirements.txt лежал в корне файловой системы образа',
          ],
          correctIndex: 2,
          explanation: 'Docker пересобирает слой, только если изменились его входные данные. Код меняется в каждом коммите, а requirements.txt — редко: если скопировать их вместе, любая правка кода инвалидирует кэш и `pip install` будет выполняться заново. Отдельный `COPY requirements.txt` позволяет переиспользовать тяжёлый слой с зависимостями.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Что даёт condition: service_healthy в секции depends_on сервиса web?',
          options: [
            'Compose автоматически перезапустит web, если db упадёт в рантайме',
            'web стартует только после того, как healthcheck сервиса db начал проходить',
            'db получит приоритет по CPU и памяти относительно web',
            'Compose будет проверять здоровье самого web каждые 5 секунд',
          ],
          correctIndex: 1,
          explanation: 'Без условия `service_healthy` Compose ждёт лишь запуска процесса postgres, а не его готовности принимать соединения — и приложение падает на первом коннекте. С healthcheck Compose дожидается успешного `pg_isready` и только потом стартует web. На рестарты в рантайме `depends_on` не влияет.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Приведите Dockerfile в порядок',
          description: 'Дан рабочий, но плохой Dockerfile для FastAPI-приложения. Перепишите его: используйте образ `python:3.12-slim`, скопируйте `requirements.txt` отдельно до кода (чтобы работал кэш слоёв), ставьте зависимости с `--no-cache-dir`, добавьте переменные `PYTHONDONTWRITEBYTECODE=1` и `PYTHONUNBUFFERED=1`, создайте пользователя `appuser` и запускайте приложение от его имени, объявите `EXPOSE 8000`.',
          language: 'docker',
          starterCode: `FROM python:3.12

WORKDIR /app

COPY . .
RUN pip install -r requirements.txt

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
          solution: `FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
          hints: [
            'Начните с базы: `python:3.12` замените на `python:3.12-slim`, сразу после FROM задайте два ENV.',
            'Разбейте COPY на два шага: сначала только `requirements.txt` и `pip install --no-cache-dir`, затем `COPY . .` — так правки кода не будут инвалидировать слой с зависимостями.',
            'После копирования кода: `RUN useradd --create-home appuser`, затем `USER appuser`, `EXPOSE 8000` и прежний CMD.',
          ],
        },
      ],
    },
    {
      slug: 'ci-cd',
      title: 'CI/CD (GitHub Actions)',
      description: 'Автоматизируем проверки и сборку: от первого workflow до pipeline с линтером, тестами на PostgreSQL, секретами и деплоем по тегу.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Понедельник, в main влили ветку без прогона тестов — «там одна строчка». Во вторник прод лежит, а команда выясняет, чья строчка виновата. **CI (continuous integration)** делает такое невозможным: каждый push и pull request автоматически прогоняется через линтер, тесты и сборку, и сломанный код просто не пройдёт проверки до merge. **CD** продолжает конвейер: прошедший проверки код автоматически доставляется на серверы. Робот делает одни и те же шаги одинаково в 3 часа дня и в 3 часа ночи — в отличие от человека с инструкцией в вики.',
        },
        { type: 'heading', text: 'Анатомия workflow' },
        {
          type: 'text',
          text: 'Workflow — это YAML-файл в каталоге `.github/workflows/`. Три уровня: **triggers** (`on`) — какие события запускают workflow: push, pull request, тег, расписание; **jobs** — независимые задания, каждое на своей чистой виртуальной машине (runner), по умолчанию идут параллельно; **steps** — последовательные шаги внутри job: либо готовое действие из маркетплейса (`uses`), либо shell-команда (`run`).',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: '.github/workflows/ci.yml',
          code: `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4          # клонируем репозиторий
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip                       # кэш зависимостей между запусками
      - run: pip install -r requirements.txt
      - run: pytest`,
        },
        { type: 'heading', text: 'Кэширование зависимостей и матрица версий' },
        {
          type: 'code',
          language: 'yaml',
          filename: '.github/workflows/ci.yml',
          code: `jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false                     # не останавливать остальные комбинации при падении одной
      matrix:
        python-version: ['3.11', '3.12', '3.13']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: pip
      - run: pip install -r requirements.txt
      - run: pytest`,
        },
        {
          type: 'note',
          variant: 'tip',
          text: 'Строка `cache: pip` в `actions/setup-python` сохраняет скачанные пакеты между запусками: ключ кэша строится из хэша `requirements.txt`, и пока файл не изменился, зависимости не скачиваются заново. На среднем проекте это минус 1–2 минуты с каждого запуска — умножьте на десятки запусков в день.',
        },
        { type: 'heading', text: 'Pipeline: ruff + pytest + PostgreSQL + build' },
        {
          type: 'code',
          language: 'yaml',
          filename: '.github/workflows/ci.yml',
          code: `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install ruff
      - run: ruff check .
      - run: ruff format --check .

  test:
    needs: lint                            # запускается только после успешного lint
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: app
          POSTGRES_PASSWORD: app
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U app"
          --health-interval 5s
          --health-timeout 3s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://app:app@localhost:5432/test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install -r requirements.txt
      - run: pytest --cov=app

  build:
    needs: test
    if: github.ref == 'refs/heads/main'    # образ собираем только для main
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:\${{ github.sha }} .`,
        },
        {
          type: 'text',
          text: 'Секция `services` поднимает рядом с runner-ом контейнер PostgreSQL 16 — тесты ходят в настоящую базу по `localhost:5432`, а не в SQLite-заглушку, которая ведёт себя иначе. `options` с `--health-cmd` заставляют Actions дождаться готовности базы до первого шага. Обратите внимание на `needs`: jobs выстраиваются в конвейер lint -> test -> build, и падение раннего этапа экономит минуты позднего.',
        },
        { type: 'heading', text: 'Секреты, деплой по тегу и что такое CD' },
        {
          type: 'text',
          text: 'Пароли и токены не пишут в workflow-файл: он лежит в репозитории, виден всем с доступом к коду и навсегда остаётся в истории git. Для этого есть **Secrets** (Settings -> Secrets and variables -> Actions): значения шифруются, в логах автоматически маскируются звёздочками и доступны как `secrets.ИМЯ`. Для несекретных настроек (имя registry, регион облака) — **Variables**, доступные как `vars.ИМЯ`. Деплой удобно вешать на git-тег: релиз — это осознанное действие `git tag v1.4.0 && git push --tags`, а не каждый коммит.',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: '.github/workflows/deploy.yml',
          code: `name: Deploy

on:
  push:
    tags: ['v*']                           # запускается только на теги v1.2.3

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production                # защищённое окружение: свои секреты, ручное одобрение
    steps:
      - uses: actions/checkout@v4
      - name: Login to registry
        run: echo "\${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u \${{ github.actor }} --password-stdin
      - name: Build and push image
        run: |
          docker build -t ghcr.io/acme/api:\${{ github.ref_name }} .
          docker push ghcr.io/acme/api:\${{ github.ref_name }}`,
        },
        {
          type: 'table',
          headers: ['', 'Continuous Delivery', 'Continuous Deployment'],
          rows: [
            ['Что автоматизировано', 'Сборка, тесты, подготовка релиза', 'Всё, включая выкатку в прод'],
            ['Кто решает о релизе', 'Человек: кнопка или git-тег', 'Pipeline: каждый зелёный коммит в main уезжает сам'],
            ['Когда подходит', 'Релизы согласовываются, есть ручное QA', 'Зрелые тесты, feature flags, быстрый откат'],
          ],
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'CI прогоняет линтер, тесты и сборку на каждый push и PR — сломанный код не доходит до main.',
            'Workflow = triggers (`on`) + jobs (параллельные машины) + steps (`uses` или `run`); `needs` выстраивает jobs в конвейер.',
            '`cache: pip` в setup-python и матрица версий Python — стандартный минимум для библиотек и сервисов.',
            'Секция `services` даёт тестам настоящий PostgreSQL вместо заглушки.',
            'Секреты живут в GitHub Secrets и маскируются в логах; в workflow-файле им не место.',
            'Continuous delivery — релиз готов, но выкатку запускает человек; continuous deployment — каждый зелёный коммит деплоится автоматически.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: `Какое событие запустит workflow с триггером on: push: tags: ['v*']?`,
          options: [
            'Любой push в ветку main',
            'Открытие pull request в любую ветку',
            'Push тега, начинающегося с v, например v1.2.0',
            'Каждый коммит в любую ветку репозитория',
          ],
          correctIndex: 2,
          explanation: 'Фильтр `tags` внутри события `push` означает, что workflow реагирует только на отправку git-тегов, а паттерн `v*` сужает это до тегов, начинающихся с «v». Обычные коммиты в ветки и pull request этот workflow не запустят — так деплой становится осознанным действием: создать и запушить тег.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Чем continuous delivery отличается от continuous deployment?',
          options: [
            'Delivery: релиз готов в любой момент, но выкатку запускает человек; deployment: каждый прошедший pipeline коммит уезжает в прод автоматически',
            'Delivery — это автоматический деплой каждого коммита, deployment — деплой вручную по кнопке',
            'Это синонимы, оба означают автоматическую выкатку в прод',
            'Delivery относится к мобильным приложениям, deployment — к серверным',
          ],
          correctIndex: 0,
          explanation: 'В continuous delivery конвейер доводит код до состояния «готов к релизу» (собран, протестирован, артефакт опубликован), но финальное решение — за человеком: кнопка или тег. В continuous deployment и этот шаг автоматизирован: зелёный pipeline на main сам выкатывает код в прод. Второй вариант требует зрелых тестов и быстрого отката.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Почему токен от container registry нужно хранить в GitHub Secrets, а не написать прямо в workflow-файле?',
          options: [
            'Secrets ускоряют выполнение workflow за счёт кэширования',
            'YAML не поддерживает строки длиннее 64 символов',
            'Workflow-файл лежит в репозитории: токен увидит любой с доступом к коду, и он навсегда останется в истории git',
            'GitHub запрещает запускать workflow, в которых есть строки, похожие на пароли',
          ],
          correctIndex: 2,
          explanation: 'Всё, что закоммичено, становится частью истории репозитория — даже удалив строку следующим коммитом, вы оставите токен в `git log` навсегда, а форки и клоны унесут его дальше. Secrets хранятся зашифрованными вне кода, подставляются только в момент запуска и автоматически маскируются в логах.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Workflow: линтер, тесты и PostgreSQL',
          description: 'Напишите workflow `ci.yml`, который запускается на push в main и на pull request. Один job `test` на `ubuntu-latest`: сервис `postgres:16` с базой `test`, пользователем и паролем `app` и health-опциями; переменная окружения `DATABASE_URL` для тестов; шаги — checkout, setup-python 3.12 с кэшем pip, установка зависимостей, `ruff check .`, `pytest`.',
          language: 'yaml',
          starterCode: `name: CI

on:
  # TODO: push в main и pull_request

jobs:
  test:
    runs-on: ubuntu-latest
    # TODO: сервис postgres:16 с healthcheck
    # TODO: env DATABASE_URL
    steps:
      # TODO: checkout, python 3.12 + cache pip, зависимости, ruff, pytest`,
          solution: `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: app
          POSTGRES_PASSWORD: app
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U app"
          --health-interval 5s
          --health-timeout 3s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://app:app@localhost:5432/test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install -r requirements.txt
      - run: pip install ruff
      - run: ruff check .
      - run: pytest`,
          hints: [
            'Триггеры: секция `on` с ключами `push` (внутри `branches: [main]`) и пустым `pull_request:`.',
            'Сервис описывается в `services.postgres`: ключи `image`, `env` (POSTGRES_USER/PASSWORD/DB), `ports` и `options` со строкой `--health-cmd "pg_isready -U app"` и интервалами.',
            'Шаги: `actions/checkout@v4`, затем `actions/setup-python@v5` с `python-version: 3.12` и `cache: pip`, потом три `run`-шага: установка зависимостей и ruff, `ruff check .`, `pytest`. DATABASE_URL укажите на `localhost:5432`.',
          ],
        },
      ],
    },
    {
      slug: 'nginx-gunicorn',
      title: 'Nginx и Gunicorn',
      description: 'Собираем производственную связку: gunicorn с правильным числом воркеров за reverse proxy nginx, статика, HTTPS и автозапуск через systemd.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: '`python manage.py runserver` и `uvicorn app:app --reload` — инструменты разработки: один процесс, авторестарт по каждому сохранению файла, отладочные страницы с внутренностями проекта и нулевая устойчивость к нагрузке. Выставить такое в интернет — значит обслуживать одного клиента за раз и показывать stack trace всем желающим. Продакшен-схема выглядит иначе: **application server** (gunicorn) управляет пулом воркеров с вашим кодом, а перед ним стоит **nginx** — reverse proxy, который терминирует TLS, отдаёт статику и защищает воркеры от медленных клиентов.',
        },
        { type: 'heading', text: 'WSGI vs ASGI' },
        {
          type: 'text',
          text: 'Между сервером и Python-приложением стоит стандартный интерфейс. **WSGI** — синхронный: один запрос занимает один воркер целиком, пока не завершится. Так работают классический Django и Flask. **ASGI** — асинхронный преемник: event loop позволяет одному воркеру держать тысячи одновременных соединений, пока они ждут I/O, плюс появляется поддержка WebSocket. На ASGI построены FastAPI и Starlette, современный Django поддерживает оба режима.',
        },
        {
          type: 'table',
          headers: ['', 'WSGI', 'ASGI'],
          rows: [
            ['Модель', 'Синхронная: запрос занимает воркер целиком', 'Асинхронная: event loop, много соединений на воркер'],
            ['Фреймворки', 'Django (классика), Flask', 'FastAPI, Starlette, Django (async)'],
            ['Серверы', 'Gunicorn с sync-воркерами, uWSGI', 'Uvicorn, Hypercorn, gunicorn + uvicorn-worker'],
            ['WebSocket', 'Нет', 'Да'],
          ],
        },
        { type: 'heading', text: 'Gunicorn и количество воркеров' },
        {
          type: 'text',
          text: 'Gunicorn — process manager: он держит N воркеров-процессов, перезапускает упавшие и распределяет соединения. Отправная точка для числа воркеров — формула **2 × CPU + 1**: пока один процесс ждёт I/O, соседний использует ядро, а «+1» добирает остаток. Для машины с 4 ядрами — 9 воркеров. Это стартовое значение, а не догма: дальше смотрите на метрики. Больше воркеров — больше памяти (каждый процесс несёт копию приложения) и больше соединений к базе, поэтому «поставим 50» закончится OOM-killer-ом или исчерпанием connection pool.',
        },
        {
          type: 'code',
          language: 'bash',
          code: `# WSGI-приложение (Django): синхронные воркеры, 4 CPU -> 9 воркеров
gunicorn config.wsgi:application --bind 127.0.0.1:8000 --workers 9 --timeout 30

# ASGI-приложение (FastAPI): воркеры uvicorn под управлением gunicorn
pip install uvicorn-worker
gunicorn app.main:app -k uvicorn_worker.UvicornWorker --bind 127.0.0.1:8000 --workers 5`,
        },
        {
          type: 'note',
          variant: 'info',
          text: 'Класс `uvicorn.workers.UvicornWorker` из самого uvicorn объявлен устаревшим — используйте отдельный пакет `uvicorn-worker` и класс `uvicorn_worker.UvicornWorker`. Для ASGI воркеров обычно нужно меньше, чем 2×CPU+1: каждый и так обслуживает множество соединений конкурентно.',
        },
        { type: 'heading', text: 'Nginx: reverse proxy и статика' },
        {
          type: 'text',
          text: 'Gunicorn слушает только `127.0.0.1` — из интернета к нему не попасть. Все внешние запросы принимает nginx и проксирует внутрь через `proxy_pass`. Зачем прослойка: nginx терминирует TLS, буферизует медленных клиентов (воркер получает запрос целиком и не простаивает, пока клиент на 3G дочитывает ответ), отдаёт статику без участия Python и режет заведомо мусорные запросы. Заголовки `X-Forwarded-*` обязательны: без них приложение видит все запросы как пришедшие с 127.0.0.1 по HTTP — ломаются логи, rate limiting по IP и генерация абсолютных ссылок. Для HTTPS достаточно бесплатного сертификата Let\'s Encrypt — утилита certbot получает его и продлевает автоматически.',
        },
        {
          type: 'code',
          language: 'text',
          filename: '/etc/nginx/sites-available/api.conf',
          code: `upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.example.com;

    # Статику отдаёт nginx — воркеры Python её даже не видят
    location /static/ {
        alias /srv/app/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`,
        },
        { type: 'heading', text: 'Автозапуск: systemd' },
        {
          type: 'code',
          language: 'text',
          filename: '/etc/systemd/system/gunicorn.service',
          code: `[Unit]
Description=Gunicorn for api.example.com
After=network.target

[Service]
User=deploy
Group=deploy
WorkingDirectory=/srv/app
Environment="PATH=/srv/app/.venv/bin"
EnvironmentFile=/srv/app/.env
ExecStart=/srv/app/.venv/bin/gunicorn app.main:app -k uvicorn_worker.UvicornWorker --bind 127.0.0.1:8000 --workers 5
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target`,
        },
        {
          type: 'code',
          language: 'bash',
          code: `# Включаем сервис: автозапуск при загрузке + старт сейчас
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn
systemctl status gunicorn

# HTTPS: certbot получит сертификат Let's Encrypt и сам поправит конфиг nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.example.com`,
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'runserver и `--reload` — только для разработки: один процесс, отладочный вывод, нет устойчивости.',
            'WSGI — синхронный интерфейс (Django, Flask), ASGI — асинхронный с WebSocket (FastAPI); от этого зависит тип воркера.',
            'Gunicorn держит пул воркеров; отправная точка — 2×CPU+1 для sync, меньше — для ASGI, дальше настройка по метрикам.',
            'Nginx терминирует TLS, буферизует медленных клиентов, отдаёт статику и передаёт реальный IP и протокол через заголовки `X-Forwarded-*`.',
            'systemd перезапускает упавший процесс и поднимает сервис после ребута; HTTPS бесплатно даёт certbot с Let\'s Encrypt.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Сервер с 4 CPU, классическое WSGI-приложение на Django. Сколько sync-воркеров gunicorn рекомендует формула по умолчанию?',
          options: ['4', '5', '8', '9'],
          correctIndex: 3,
          explanation: 'Формула 2 × CPU + 1 даёт 2 × 4 + 1 = 9. Логика: пока часть процессов заблокирована на I/O (база, внешние API), остальные загружают ядра, а «+1» добирает остаток. Это стартовое значение — итоговое число подбирают по метрикам памяти и latency.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Зачем перед gunicorn ставят nginx, если gunicorn и сам умеет обслуживать HTTP?',
          options: [
            'Nginx компилирует Python-код в машинный и ускоряет его',
            'Nginx терминирует TLS, буферизует медленных клиентов и отдаёт статику, не занимая воркеры приложения',
            'Gunicorn не умеет слушать TCP-порты без посредника',
            'Без nginx невозможно привязать доменное имя к серверу',
          ],
          correctIndex: 1,
          explanation: 'Каждый sync-воркер gunicorn обслуживает один запрос за раз, и медленный клиент занимал бы его на всё время скачивания ответа. Nginx принимает и буферизует такие соединения, освобождая воркеры, а заодно берёт на себя TLS и раздачу статики — задачи, где он на порядок эффективнее Python.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Какой интерфейс нужен, чтобы запустить FastAPI-приложение в продакшене?',
          options: [
            'WSGI: любой Python-фреймворк работает через WSGI',
            'ASGI: FastAPI асинхронный и построен на Starlette',
            'CGI: это универсальный стандарт для всех веб-приложений',
            'Никакой: FastAPI самостоятельно слушает порт без сервера',
          ],
          correctIndex: 1,
          explanation: 'FastAPI построен поверх асинхронного Starlette и работает через ASGI — синхронный WSGI просто не умеет вызывать `async`-обработчики и держать WebSocket. В продакшене это gunicorn с воркерами `uvicorn_worker.UvicornWorker` или uvicorn напрямую.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Конфиг nginx для API',
          description: 'Напишите server-блок nginx для домена `api.shop.ru`: upstream `backend` на `127.0.0.1:8000`; всё под `/static/` отдаётся из каталога `/srv/shop/static/` с кэшем на 7 дней; остальные запросы проксируются в backend с заголовками `Host`, `X-Real-IP`, `X-Forwarded-For` и `X-Forwarded-Proto`.',
          language: 'text',
          starterCode: `upstream backend {
    # TODO
}

server {
    listen 80;
    server_name api.shop.ru;

    # TODO: /static/ из /srv/shop/static/ с expires 7d

    # TODO: proxy_pass + заголовки
}`,
          solution: `upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.shop.ru;

    location /static/ {
        alias /srv/shop/static/;
        expires 7d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`,
          hints: [
            'В блоке `upstream backend` одна строка: `server 127.0.0.1:8000;` — дальше на него можно ссылаться как `http://backend`.',
            'Для статики используйте `location /static/` с директивами `alias /srv/shop/static/;` и `expires 7d;`.',
            'В `location /` нужен `proxy_pass http://backend;` и четыре `proxy_set_header`: Host — `$host`, X-Real-IP — `$remote_addr`, X-Forwarded-For — `$proxy_add_x_forwarded_for`, X-Forwarded-Proto — `$scheme`.',
          ],
        },
      ],
    },
    {
      slug: 'cloud',
      title: 'Облака и деплой',
      description: 'IaaS/PaaS/SaaS на примерах, деплой на VPS шаг за шагом, managed-сервисы, конфигурация по 12-factor и схема бэкапов.',
      duration: 30,
      blocks: [
        {
          type: 'text',
          text: 'Код написан, контейнер собран, CI зелёный — осталось где-то это запустить. Вариантов много: от «арендовать виртуалку за 5 евро и всё настроить руками» до «подключить PaaS, который сам соберёт и запустит». Разница — в том, сколько ответственности вы берёте на себя. Типичный путь продакшена небольшого сервиса: VPS для приложения, managed PostgreSQL для данных, S3-совместимое хранилище для файлов. Разберём каждый слой и правила, которые спасают от классических катастроф вида «секреты в git» и «база умерла вместе с диском».',
        },
        { type: 'heading', text: 'IaaS, PaaS, SaaS' },
        {
          type: 'table',
          headers: ['Модель', 'Что даёт провайдер', 'Что делаете вы', 'Примеры'],
          rows: [
            ['IaaS', 'Виртуальные машины, сети, диски', 'ОС, обновления, деплой, безопасность', 'AWS EC2, Hetzner Cloud, Yandex Compute'],
            ['PaaS', 'Платформа: сборка и запуск кода, managed БД', 'Только код и конфигурацию', 'Heroku, Railway, Render, managed PostgreSQL'],
            ['SaaS', 'Готовое приложение целиком', 'Просто пользуетесь', 'GitHub, Sentry, Gmail'],
          ],
        },
        { type: 'heading', text: 'Деплой на VPS: первые 15 минут' },
        {
          type: 'code',
          language: 'bash',
          code: `# 1. Заходим на свежий сервер по SSH (IP выдал провайдер)
ssh root@203.0.113.10

# 2. Создаём обычного пользователя — работать под root опасно
adduser deploy
usermod -aG sudo deploy

# 3. Переносим свой SSH-ключ новому пользователю
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# 4. Запрещаем вход по паролю — только по ключу
#    В /etc/ssh/sshd_config: PasswordAuthentication no
sudo systemctl restart ssh

# 5. Файрвол: наружу смотрят только SSH и HTTP/HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Дальше: установить docker или python + nginx, задеплоить приложение
# (связку nginx + gunicorn + systemd мы собрали в прошлом уроке)`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'Свежий сервер с открытым SSH начинают брутфорсить боты уже через несколько минут после создания. Поэтому первые действия всегда одни и те же: отдельный пользователь вместо root, вход только по ключу, `PasswordAuthentication no`, файрвол. База данных и Redis никогда не должны слушать публичный интерфейс — только `127.0.0.1` или приватную сеть.',
        },
        { type: 'heading', text: 'Managed PostgreSQL и S3: за что платим' },
        {
          type: 'text',
          text: '**Managed PostgreSQL** дороже, чем postgres на том же VPS, но провайдер берёт на себя автоматические бэкапы с point-in-time recovery, обновления с security-патчами, реплики и failover, мониторинг диска. Самостоятельно это всё придётся строить и — главное — регулярно проверять. Потерянная база обычно стоит на порядки дороже, чем годы подписки. Для пользовательских файлов та же логика: не складывайте их на диск сервера (он конечен, не реплицируется и умирает вместе с VPS), а используйте **S3-совместимое хранилище** — протокол S3 поддерживают почти все провайдеры, и любой S3-клиент работает с каждым из них.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'storage.py',
          code: `import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="https://s3.storage-provider.example",  # любой S3-совместимый провайдер
    aws_access_key_id=settings.s3_access_key,
    aws_secret_access_key=settings.s3_secret_key,
)

# Загрузка файла в bucket
s3.upload_file("invoice.pdf", "my-bucket", "invoices/2026/invoice.pdf")

# Временная ссылка на скачивание: истекает через час,
# сам bucket остаётся закрытым
url = s3.generate_presigned_url(
    "get_object",
    Params={"Bucket": "my-bucket", "Key": "invoices/2026/invoice.pdf"},
    ExpiresIn=3600,
)`,
        },
        { type: 'heading', text: '12-factor: конфигурация и секреты' },
        {
          type: 'text',
          text: 'Методология **12-factor app** требует: конфигурация живёт в переменных окружения, а не в коде. Один и тот же образ работает в dev, staging и prod — меняется только окружение. Локально переменные удобно держать в файле `.env`, но сам файл — это секреты: строка подключения к базе, `SECRET_KEY`, ключи S3. Правило без исключений: `.env` добавляется в `.gitignore` **до** первого коммита, а в репозитории лежит `.env.example` с именами переменных без значений. Секрет, однажды попавший в git, считается скомпрометированным — его ротируют, а не «удаляют коммитом».',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'config.py',
          code: `# .env (файл в .gitignore; в репозитории — только .env.example)
# DATABASE_URL=postgresql+asyncpg://app:secret@db-host:5432/app
# SECRET_KEY=change-me
# S3_ACCESS_KEY=...
# S3_SECRET_KEY=...

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str
    secret_key: str
    debug: bool = False
    s3_access_key: str = ""
    s3_secret_key: str = ""


settings = Settings()  # упадёт на старте, если обязательной переменной нет — это хорошо`,
        },
        { type: 'heading', text: 'Бэкапы: простейшая рабочая схема' },
        {
          type: 'code',
          language: 'bash',
          filename: 'backup-db.sh',
          code: `#!/bin/bash
set -euo pipefail

BACKUP_DIR=/var/backups/db
DATE=$(date +%F)

mkdir -p "$BACKUP_DIR"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/app-$DATE.sql.gz"

# Локально храним 14 дней
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +14 -delete

# Копию — в S3: диск сервера может умереть вместе с бэкапами
aws s3 cp "$BACKUP_DIR/app-$DATE.sql.gz" s3://my-backups/db/

# Расписание (crontab -e): каждый день в 03:00
# 0 3 * * * /usr/local/bin/backup-db.sh

# Бэкап, который ни разу не восстанавливали, — не бэкап.
# Раз в месяц: pg_restore / psql на пустую базу и проверка данных.`,
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'IaaS — вам дают виртуалку, всё остальное ваше; PaaS — вы даёте код, платформа делает остальное; SaaS — готовый продукт.',
            'Первые шаги на VPS: пользователь вместо root, SSH только по ключу, файрвол с минимумом открытых портов.',
            'Managed PostgreSQL покупает вам бэкапы, PITR, обновления и failover — почти всегда дешевле последствий самодеятельности.',
            'Файлы пользователей — в S3-совместимое хранилище, доступ наружу — через presigned URL.',
            'Конфигурация — в переменных окружения (12-factor); `.env` в `.gitignore`, попавший в git секрет ротируется немедленно.',
            'Бэкапы: автоматически, по расписанию, с копией вне сервера — и с регулярной проверкой восстановления.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Managed PostgreSQL от облачного провайдера — это пример какой модели?',
          options: [
            'IaaS: провайдер даёт виртуальную машину, база — ваша забота',
            'PaaS: провайдер управляет платформой (обновления, бэкапы, failover), вы пользуетесь базой',
            'SaaS: это готовое приложение для конечного пользователя',
            'On-premise: сервис работает в вашем собственном дата-центре',
          ],
          correctIndex: 1,
          explanation: 'В managed-базе вы не администрируете ни ОС, ни сам PostgreSQL — провайдер отвечает за установку, обновления, бэкапы и отказоустойчивость, а вы получаете строку подключения. Это классический PaaS-паттерн: платформа как сервис. IaaS был бы, если бы вам выдали голую виртуалку под самостоятельную установку базы.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Почему файл .env нельзя коммитить в репозиторий?',
          options: [
            'git портит кодировку .env-файлов при слиянии веток',
            'Docker отказывается собирать образ, если .env находится под контролем версий',
            'GitHub автоматически удаляет такие файлы при push',
            'Секреты попадут в историю git: их увидит любой с доступом к коду, а вычистить историю крайне сложно',
          ],
          correctIndex: 3,
          explanation: 'В `.env` лежат пароли базы, `SECRET_KEY` и ключи хранилищ. Всё закоммиченное остаётся в истории git навсегда — даже после «удаляющего» коммита секрет извлекается из `git log`, а форки и клоны разносят его дальше. Поэтому `.env` идёт в `.gitignore` до первого коммита, а утёкшие секреты немедленно ротируются.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Конфигурация через pydantic-settings',
          description: 'Напишите класс `Settings` на pydantic-settings v2, читающий переменные из файла `.env`: обязательные `database_url: str` и `secret_key: str`, необязательные `debug: bool` (по умолчанию False) и `sentry_dsn: str` (по умолчанию пустая строка). Создайте экземпляр `settings` на уровне модуля. Приложение должно падать при старте, если обязательная переменная не задана.',
          language: 'python',
          starterCode: `from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # TODO: model_config с env_file
    # TODO: поля
    pass


# TODO: экземпляр settings`,
          solution: `from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str
    secret_key: str
    debug: bool = False
    sentry_dsn: str = ""


settings = Settings()`,
          hints: [
            'В Pydantic v2 настройки модели задаются атрибутом `model_config = SettingsConfigDict(env_file=".env")` — класс `Config` из v1 устарел.',
            'Обязательные поля объявляются без значения по умолчанию (`database_url: str`) — тогда отсутствие переменной вызовет ValidationError при создании экземпляра.',
            'Имена переменных окружения сопоставляются полям без учёта регистра: `DATABASE_URL` из .env попадёт в `database_url`. Экземпляр — просто `settings = Settings()` в конце модуля.',
          ],
        },
      ],
    },
    {
      slug: 'monitoring',
      title: 'Мониторинг',
      description: 'Учимся узнавать о проблемах раньше пользователей: метрики RED, Prometheus и Grafana, health-эндпоинты, алерты и Sentry.',
      duration: 25,
      blocks: [
        {
          type: 'text',
          text: 'Худший способ узнать о падении сервиса — гневный тикет от клиента или звонок директора. Между «что-то сломалось» и «пользователи заметили» обычно есть окно в минуты или часы: latency растёт, доля ошибок ползёт вверх, диск заполняется. Мониторинг существует, чтобы вы увидели это первыми и починили до того, как проблему заметят снаружи. Без метрик разбор инцидента превращается в гадание: «вроде после вчерашнего релиза стало медленнее» — а с метриками это график с точной отметкой времени.',
        },
        { type: 'heading', text: 'Метрики RED' },
        {
          type: 'text',
          text: 'Для сервисов, обрабатывающих запросы, есть проверенный минимум — методология **RED**: rate, errors, duration. Три метрики отвечают на главный вопрос «жив ли сервис с точки зрения пользователя». Для duration смотрят не среднее, а **перцентили**: p95 = 300 мс означает, что 95% запросов быстрее 300 мс. Среднее обманывает — тысяча быстрых запросов маскирует сотню десятисекундных, а именно эти сто пользователей и страдают.',
        },
        {
          type: 'table',
          headers: ['Метрика', 'Вопрос', 'Пример'],
          rows: [
            ['Rate', 'Сколько запросов в секунду обрабатываем?', '450 rps на `/api/orders`'],
            ['Errors', 'Какая доля запросов завершается ошибкой?', '0.8% ответов 5xx за 5 минут'],
            ['Duration', 'Как быстро отвечаем?', 'p95 = 320 мс, p99 = 900 мс'],
          ],
        },
        { type: 'heading', text: 'Prometheus: pull-модель и /metrics' },
        {
          type: 'text',
          text: '**Prometheus** — стандарт де-факто для метрик. Работает по **pull-модели**: не приложение шлёт метрики наружу, а Prometheus сам раз в 15 секунд опрашивает эндпоинт `/metrics` каждого сервиса и складывает значения в свою time-series базу. Конфигурация минимальна: в `prometheus.yml` достаточно секции `scrape_configs` с `targets: ["api:8000"]`. Плюсы pull-подхода: сервис не знает о мониторинге ничего, а недоступность `/metrics` сама по себе сигнал тревоги. Для Python есть официальная библиотека `prometheus_client`.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'app/metrics.py',
          code: `import time

from fastapi import FastAPI, Request
from prometheus_client import Counter, Histogram, make_asgi_app

app = FastAPI()

REQUESTS = Counter(
    "http_requests_total",
    "Всего HTTP-запросов",
    ["method", "path", "status"],
)
LATENCY = Histogram(
    "http_request_duration_seconds",
    "Время обработки запроса",
    ["method", "path"],
)


@app.middleware("http")
async def collect_metrics(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    REQUESTS.labels(request.method, request.url.path, response.status_code).inc()
    LATENCY.labels(request.method, request.url.path).observe(elapsed)
    return response


# Prometheus будет забирать метрики отсюда: GET /metrics
app.mount("/metrics", make_asgi_app())`,
        },
        { type: 'heading', text: 'Grafana и алерты' },
        {
          type: 'text',
          text: '**Grafana** подключается к Prometheus как к источнику данных и превращает метрики в дашборды: rate по эндпоинтам, доля 5xx, перцентили latency, память воркеров. Второй инструмент — **алерты**: правило вида «доля 5xx больше 1% в течение 5 минут — сообщение в дежурный чат». Здесь помогает понятие **SLO** — целевой уровень сервиса, например «99.9% запросов успешны за месяц». Алертов должно быть мало, каждый должен требовать действия, и ставят их на **симптомы**, угрожающие SLO (ошибки, latency — то, что видит пользователь), а не на причины: правило «CPU выше 80%» разбудит вас ночью, хотя пользователи ничего не замечают. Если на алерт привычно отвечают «а, это опять ложный» — его удаляют или перенастраивают.',
        },
        { type: 'heading', text: 'Health-эндпоинты: liveness vs readiness' },
        {
          type: 'note',
          variant: 'warning',
          text: 'Оркестратор задаёт сервису два разных вопроса, и путать их опасно. **Liveness** (`/healthz`) — «процесс жив?»: провал ведёт к перезапуску контейнера, поэтому проверка тривиальна — вернуть 200. **Readiness** (`/readyz`) — «готов принимать трафик?»: провал временно выводит инстанс из балансировки, не убивая его, поэтому именно здесь проверяют критичные зависимости. Если проверять базу в liveness, при её недоступности оркестратор начнёт бесконечно перезапускать совершенно здоровые контейнеры.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'app/health.py',
          code: `from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

app = FastAPI()
engine = create_async_engine("postgresql+asyncpg://app:app@db:5432/app")


@app.get("/healthz")
async def liveness() -> dict:
    # Только «процесс жив и отвечает» — никаких внешних зависимостей
    return {"status": "ok"}


@app.get("/readyz")
async def readiness() -> dict:
    # Готовность принимать трафик: проверяем критичные зависимости
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status_code=503, detail="database unavailable")
    return {"status": "ready"}`,
        },
        { type: 'heading', text: 'Sentry: ошибки и APM' },
        {
          type: 'code',
          language: 'python',
          filename: 'app/observability.py',
          code: `import sentry_sdk

sentry_sdk.init(
    dsn="https://public-key@o12345.ingest.sentry.io/67890",
    environment="production",
    release="api@1.4.2",           # группировка ошибок по релизам
    traces_sample_rate=0.1,        # APM: трассируем 10% запросов
    send_default_pii=False,        # не отправлять персональные данные
)

# Дальше ничего делать не нужно: интеграции Sentry сами перехватят
# необработанные исключения в FastAPI/Django и пришлют полный контекст:
# stack trace, запрос, версию релиза, breadcrumbs`,
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'Цель мониторинга — узнавать о проблемах раньше пользователей и разбирать инциденты по данным, а не по ощущениям.',
            'Минимум для API — метрики RED: rate, errors, duration; latency смотрим по перцентилям p95/p99, а не по среднему.',
            'Prometheus сам опрашивает `/metrics` (pull-модель); `prometheus_client` добавляет метрики в Python-приложение через middleware.',
            'Grafana — дашборды и алерты; алертим симптомы, угрожающие SLO, а не «CPU выше 80%».',
            'Liveness — «жив ли процесс» (перезапуск), readiness — «готов ли к трафику» (вывод из балансировки); зависимости проверяем только в readiness.',
            'Sentry ловит необработанные исключения с полным контекстом; APM показывает, на что уходит время внутри запроса.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Что означает буква D в методологии RED?',
          options: [
            'Deployment — частота релизов сервиса',
            'Downtime — суммарное время простоя за месяц',
            'Duration — время обработки запросов, обычно по перцентилям',
            'Dependencies — здоровье внешних зависимостей сервиса',
          ],
          correctIndex: 2,
          explanation: 'RED — это Rate (запросов в секунду), Errors (доля ошибок) и Duration (время обработки запроса). Duration принято смотреть по перцентилям p95/p99, потому что среднее скрывает медленный «хвост» — небольшую долю запросов, из-за которой пользователи и жалуются.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Чем liveness-проба отличается от readiness-пробы?',
          options: [
            'Liveness — «жив ли процесс» (провал ведёт к перезапуску), readiness — «готов ли принимать трафик» (провал выводит из балансировки)',
            'Liveness проверяет базу данных, readiness — только сам процесс',
            'Readiness выполняется один раз при старте, liveness — никогда',
            'Это синонимы: обе пробы делают одно и то же',
          ],
          correctIndex: 0,
          explanation: 'Реакция оркестратора разная: провал liveness — контейнер убивают и перезапускают, провал readiness — инстанс просто перестаёт получать новые запросы, пока не оправится. Поэтому внешние зависимости проверяют только в readiness: иначе недоступность базы вызовет бессмысленные перезапуски здоровых контейнеров.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'Health-эндпоинты для FastAPI',
          description: 'Добавьте в FastAPI-приложение два эндпоинта. `GET /healthz` — liveness: всегда возвращает `{"status": "ok"}` без проверки зависимостей. `GET /readyz` — readiness: выполняет `SELECT 1` через асинхронный движок SQLAlchemy; при успехе возвращает `{"status": "ready"}`, при любой ошибке подключения — HTTP 503 с detail `"database unavailable"`.',
          language: 'python',
          starterCode: `from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

app = FastAPI()
engine = create_async_engine("postgresql+asyncpg://app:app@db:5432/app")

# TODO: GET /healthz — liveness

# TODO: GET /readyz — readiness с проверкой базы`,
          solution: `from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

app = FastAPI()
engine = create_async_engine("postgresql+asyncpg://app:app@db:5432/app")


@app.get("/healthz")
async def liveness() -> dict:
    return {"status": "ok"}


@app.get("/readyz")
async def readiness() -> dict:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status_code=503, detail="database unavailable")
    return {"status": "ready"}`,
          hints: [
            'Liveness должен быть максимально простым: `@app.get("/healthz")` и немедленный `return {"status": "ok"}` — никаких обращений к базе.',
            'Для readiness откройте соединение через `async with engine.connect() as conn:` и выполните `await conn.execute(text("SELECT 1"))` — сырой SQL в SQLAlchemy 2.0 оборачивается в `text()`.',
            'Оберните проверку в `try/except Exception` и в ветке ошибки поднимите `HTTPException(status_code=503, detail="database unavailable")`.',
          ],
        },
      ],
    },
    {
      slug: 'logging',
      title: 'Логирование',
      description: 'Превращаем print в систему: уровни и dictConfig, структурные JSON-логи, request id для трассировки и правила о том, что писать в логи нельзя.',
      duration: 25,
      blocks: [
        {
          type: 'text',
          text: 'Ночью упал платёжный сервис, а в коде — россыпь `print("тут")` и `print(response)`. Ни времени события, ни серьёзности, ни модуля-источника; вывод перемешан из всех воркеров, отключить болтовню без правки кода нельзя. **print — не логирование.** Модуль `logging` из стандартной библиотеки даёт всё, чего не хватает: уровни важности, метку времени и источник, маршрутизацию в файлы и внешние системы, фильтрацию по подсистемам без единого изменения в коде. Логи — это чёрный ящик самолёта: их пишут заранее, а читают, когда уже поздно добавлять.',
        },
        { type: 'heading', text: 'Уровни, логгеры, хендлеры, форматтеры' },
        {
          type: 'text',
          text: 'Уровни по возрастанию: `DEBUG` (детали для отладки), `INFO` (штатные события: «заказ создан»), `WARNING` (подозрительно, но работаем: retry внешнего API), `ERROR` (операция не выполнена), `CRITICAL` (сервис недееспособен). Архитектура модуля — конвейер из четырёх ролей: **логгер** принимает сообщение, **хендлер** доставляет его в пункт назначения (stdout, файл, Sentry), **форматтер** определяет вид строки, **фильтр** может отсеять или обогатить запись. Логгеры образуют **иерархию** по именам через точку: `app.services.billing` наследует настройки от `app` — поэтому в каждом модуле пишут `logging.getLogger(__name__)`, а конфигурируют один раз наверху.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'app/services/billing.py',
          code: `import logging

logger = logging.getLogger(__name__)  # имя = "app.services.billing"


def charge(order_id: int, amount_cents: int) -> None:
    # Ленивое %s-форматирование: строка соберётся, только если уровень включён
    logger.info("Списание начато: order_id=%s amount=%s", order_id, amount_cents)
    try:
        gateway.charge(order_id, amount_cents)
    except GatewayError:
        # exception() = error() + полный traceback в лог
        logger.exception("Списание не прошло: order_id=%s", order_id)
        raise
    logger.debug("Ответ шлюза обработан: order_id=%s", order_id)`,
        },
        { type: 'heading', text: 'Конфигурация: dictConfig' },
        {
          type: 'code',
          language: 'python',
          filename: 'app/logging_config.py',
          code: `import logging.config

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",  # stdout — то, что нужно в контейнерах
            "formatter": "default",
        },
    },
    "loggers": {
        # Наш код: подробно. propagate=False — не дублировать записи в root
        "app": {"handlers": ["console"], "level": "DEBUG", "propagate": False},
        # Шумные библиотеки приглушаем
        "sqlalchemy.engine": {"handlers": ["console"], "level": "WARNING", "propagate": False},
    },
    # Корневой логгер ловит всё остальное
    "root": {"handlers": ["console"], "level": "INFO"},
}

logging.config.dictConfig(LOGGING)  # вызвать один раз при старте приложения`,
        },
        { type: 'heading', text: 'Структурные логи: JSON' },
        {
          type: 'text',
          text: 'Пока логи читает человек, годится текст. Но в проде их читает машина: система централизации должна отвечать на запросы вида «все ERROR по order_id=1042 за последний час». Парсить такое из свободного текста регулярками — боль; **JSON-логи** решают проблему: каждая запись — объект с полями `timestamp`, `level`, `logger`, `message`, и поиск по полям становится тривиальным. Достаточно собственного форматтера — или готовой библиотеки вроде `python-json-logger` или `structlog`.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'app/json_logs.py',
          code: `import json
import logging


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logging.getLogger().addHandler(handler)

# Вывод одной строкой:
# {"timestamp": "2026-07-05T10:21:03+0000", "level": "ERROR",
#  "logger": "app.services.billing", "message": "Списание не прошло: order_id=1042"}`,
        },
        { type: 'heading', text: 'Correlation ID: трассировка запроса' },
        {
          type: 'code',
          language: 'python',
          filename: 'app/request_id.py',
          code: `import logging
import uuid
from contextvars import ContextVar

from fastapi import FastAPI, Request

# contextvars безопасны и для потоков, и для asyncio-задач
request_id_var: ContextVar[str] = ContextVar("request_id", default="-")


class RequestIdFilter(logging.Filter):
    """Добавляет request_id в каждую запись лога."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        return True


app = FastAPI()


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    # Берём id из заголовка (мог поставить nginx или соседний сервис) или создаём свой
    rid = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    request_id_var.set(rid)
    response = await call_next(request)
    response.headers["X-Request-ID"] = rid  # вернём клиенту для сверки
    return response

# Теперь один запрос оставляет цепочку записей с общим request_id:
# фильтруем по нему — и видим всю историю запроса среди тысяч соседних`,
        },
        {
          type: 'note',
          variant: 'warning',
          text: 'В логи **нельзя** писать: пароли (даже при неудачном входе), токены и заголовок `Authorization`, полные номера карт, а также лишние персональные данные (PII) — email, телефон, адрес. Логи хранятся долго, копируются в сторонние системы и читаются широким кругом людей — утечка через логи ничем не лучше утечки из базы, а по GDPR и 152-ФЗ это то же нарушение. Для связывания событий достаточно внутренних идентификаторов: `user_id`, `order_id`.',
        },
        { type: 'heading', text: 'Централизация и ротация' },
        {
          type: 'text',
          text: 'Когда сервисов больше одного, ходить по серверам с `grep` уже невозможно — логи собирают в одно место. Идея любой централизации одинакова: агент на хосте читает stdout контейнеров и отправляет в хранилище с поиском — **ELK** (Elasticsearch + Logstash + Kibana) или более лёгкий **Grafana Loki**. Именно поэтому в контейнерах логи пишут в stdout, а не в файлы. Если всё же пишете в файлы (классический VPS) — обязательна **ротация**, иначе лог съест диск: `RotatingFileHandler` со `maxBytes` и `backupCount` на стороне Python или системный `logrotate` — по размеру или по дням, со сжатием старых файлов.',
        },
        { type: 'heading', text: 'Итоги' },
        {
          type: 'list',
          items: [
            'print не даёт ни уровней, ни времени, ни источника, ни маршрутизации — в сервисах используется модуль `logging`.',
            'Конвейер: логгер -> фильтры -> хендлеры -> форматтер; логгеры иерархичны, поэтому `getLogger(__name__)` в каждом модуле и один `dictConfig` при старте.',
            'JSON-логи машиночитаемы: поиск по полям вместо регулярок по тексту.',
            'Correlation/request id связывает все записи одного запроса; `contextvars` протаскивает его без изменения сигнатур.',
            'В логах не бывает паролей, токенов, номеров карт и лишних PII — только внутренние идентификаторы.',
            'В контейнерах — stdout и централизация (ELK/Loki); в файлах — обязательная ротация.',
          ],
        },
      ],
      exercises: [
        {
          type: 'quiz',
          id: 'q1',
          question: 'Чем logger.exception(...) в блоке except лучше, чем print(e)?',
          options: [
            'print работает заметно медленнее во всех случаях',
            'logger.exception записывает полный traceback с уровнем ERROR, временем и именем логгера, и вывод можно направить куда угодно через хендлеры',
            'print нельзя вызывать внутри блока except — это синтаксическая ошибка',
            'logger.exception автоматически подавляет исключение и продолжает выполнение',
          ],
          correctIndex: 1,
          explanation: '`print(e)` выводит только текст исключения — без traceback вы не узнаете, в какой строке и по какому пути выполнения произошла ошибка. `logger.exception` пишет запись уровня ERROR с полным traceback, меткой времени и источником, и через хендлеры она попадёт в файл, JSON-пайплайн или Sentry. Само исключение при этом никуда не девается — его по-прежнему можно re-raise.',
        },
        {
          type: 'quiz',
          id: 'q2',
          question: 'Внешний платёжный шлюз ответил ошибкой, но приложение выполнит повторную попытку и, скорее всего, справится. Какой уровень лога подходит для этого события?',
          options: ['DEBUG', 'INFO', 'WARNING', 'CRITICAL'],
          correctIndex: 2,
          explanation: 'Событие подозрительное и заслуживает внимания (внешняя система сбоит), но операция не провалена — сработает retry. Это точное определение WARNING. ERROR ставят, когда операция окончательно не выполнена, CRITICAL — когда сервис в целом недееспособен, а INFO — для полностью штатных событий.',
        },
        {
          type: 'quiz',
          id: 'q3',
          question: 'Что из перечисленного допустимо записывать в логи?',
          options: [
            'Пароль пользователя при неудачной попытке входа',
            'Полный номер банковской карты для разбора платежа',
            'JWT-токен из заголовка Authorization',
            'Внутренний идентификатор пользователя (user_id)',
          ],
          correctIndex: 3,
          explanation: 'Внутренний `user_id` бесполезен для атакующего сам по себе, но позволяет связать события и разобрать инцидент. Пароли, токены и номера карт в логах — готовая утечка: логи хранятся долго, реплицируются в сторонние системы и доступны широкому кругу сотрудников, а токен из лога работает так же, как украденный.',
        },
        {
          type: 'code',
          id: 'c1',
          title: 'JSON-форматтер с request_id',
          description: 'Напишите класс `JsonFormatter(logging.Formatter)`, который сериализует запись в одну JSON-строку с полями `timestamp` (через `self.formatTime`), `level`, `logger`, `message`. Если у записи есть атрибут `request_id`, добавьте поле `request_id`; если запись содержит исключение (`record.exc_info`), добавьте поле `exception` с текстом traceback. Используйте `ensure_ascii=False`, чтобы кириллица в сообщениях оставалась читаемой.',
          language: 'python',
          starterCode: `import json
import logging


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        # TODO: собрать словарь и вернуть json.dumps(...)
        pass`,
          solution: `import json
import logging


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            payload["request_id"] = record.request_id
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)`,
          hints: [
            'Основа: словарь с четырьмя ключами. Текст сообщения берите через `record.getMessage()` (он подставляет %s-аргументы), уровень — `record.levelname`, имя — `record.name`.',
            'request_id — необязательный атрибут: проверяйте его наличие через `hasattr(record, "request_id")`, прежде чем добавлять в словарь.',
            'Для исключения проверьте `record.exc_info` и отформатируйте его методом родителя `self.formatException(record.exc_info)`. В конце — `json.dumps(payload, ensure_ascii=False)`.',
          ],
        },
      ],
    },
  ],
}
