import type { Problem } from '@/types/course'

// Сборник задач: Инфраструктура, часть 2
export const problems: Problem[] = [
  {
    type: 'quiz',
    id: 'b1',
    difficulty: 'medium',
    question:
      'В Dockerfile сервиса указано `EXPOSE 8000`. Разработчик запускает контейнер командой `docker run myapp` и не может открыть `http://localhost:8000` на своей машине. Почему?',
    options: [
      'Порт нужно дополнительно открыть внутри контейнера через firewall',
      'EXPOSE записан неверно: обязательно указывать протокол — EXPOSE 8000/tcp',
      'EXPOSE — только документация; чтобы пробросить порт на хост, нужен флаг -p 8000:8000',
      'Контейнер ещё не прошёл healthcheck, поэтому Docker не принимает трафик',
    ],
    correctIndex: 2,
    explanation:
      '`EXPOSE` лишь декларирует, какой порт слушает приложение, — для людей и инструментов. Публикацию порта на хост делает `-p`/`-P` при запуске. `/tcp` — протокол по умолчанию, его отсутствие ни на что не влияет.',
  },
  {
    type: 'code',
    id: 'b2',
    difficulty: 'medium',
    title: 'Dockerfile для FastAPI-сервиса',
    description:
      'Напишите Dockerfile для FastAPI-приложения (точка входа `app.main:app`): база `python:3.12-slim`, зависимости ставятся отдельным кэшируемым слоем из `requirements.txt`, процесс запускается через `uvicorn` от **непривилегированного** пользователя, порт 8000.',
    language: 'docker',
    starterCode: `# TODO: выберите базовый образ и рабочую директорию
# TODO: установите зависимости так, чтобы слой кэшировался
# TODO: скопируйте код, создайте пользователя и запустите uvicorn
FROM ...`,
    hints: [
      'Сначала копируйте только requirements.txt и ставьте зависимости — тогда изменение кода не будет сбрасывать кэш этого слоя.',
      'Создайте пользователя через useradd и переключитесь на него инструкцией USER уже после установки зависимостей.',
      'CMD пишите в exec-форме (JSON-массив) — иначе процесс не получит SIGTERM при остановке контейнера.',
    ],
    solution: `FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
  },
  {
    type: 'quiz',
    id: 'b3',
    difficulty: 'medium',
    question:
      'В `docker-compose.yml` данные PostgreSQL хранятся в bind mount: `./pgdata:/var/lib/postgresql/data`. Чем named volume (`pgdata:/var/lib/postgresql/data`) был бы лучше для данных БД?',
    options: [
      'Ничем: это один и тот же механизм, различается только синтаксис записи',
      'Named volume управляется Docker: нет проблем с правами и владельцем файлов на хосте, каталог не отредактируют случайно, конфиг переносим между машинами',
      'Named volume автоматически бэкапится Docker при каждом docker compose down',
      'Bind mount заметно медленнее, потому что данные проходят через сетевой стек',
    ],
    correctIndex: 1,
    explanation:
      'Bind mount привязан к конкретному пути и правам хостовой файловой системы — отсюда типичные ошибки с UID/владельцем файлов PostgreSQL. Named volume живёт в области, которой управляет Docker. Никаких автоматических бэкапов Docker не делает — это заблуждение.',
  },
  {
    type: 'quiz',
    id: 'b4',
    difficulty: 'medium',
    question:
      'Workflow объявлен с триггерами `on: [push, pull_request]`. Разработчик пушит новый коммит в ветку, на которую уже открыт pull request в этом же репозитории. Сколько раз запустятся jobs?',
    options: [
      'Два раза: события push и pull_request независимы, и каждое запустит свой прогон',
      'Один раз: GitHub дедуплицирует события для одного и того же коммита',
      'Один раз: pull_request срабатывает только при создании PR, а не на новые коммиты',
      'Ни разу: для веток с открытым PR нужен отдельный триггер pull_request_target',
    ],
    correctIndex: 0,
    explanation:
      'События не дедуплицируются: прогон запустится и на `push`, и на `pull_request` (он срабатывает в том числе на событие synchronize — новые коммиты в PR). Поэтому `push` обычно ограничивают основной веткой: `push: branches: [main]`.',
  },
  {
    type: 'code',
    id: 'b5',
    difficulty: 'medium',
    title: 'Кэш pip в GitHub Actions',
    description:
      'CI на каждый прогон скачивает все зависимости заново. Добавьте шаг с `actions/cache@v4`, который кэширует `~/.cache/pip`: точный ключ должен зависеть от содержимого `requirements.txt`, а при его изменении должен подхватываться старый кэш как основа.',
    language: 'yaml',
    starterCode: `# TODO: добавьте шаг кэширования перед установкой зависимостей
      - name: Cache pip
        uses: actions/cache@v4
        with:
          # path, key, restore-keys

      - name: Install dependencies
        run: pip install -r requirements.txt`,
    hints: [
      'В key используйте функцию hashFiles — она хэширует содержимое файла, а не имя.',
      'restore-keys — это префикс для «частичного» совпадения: если точный ключ не найден, возьмётся самый свежий кэш с таким префиксом.',
      'Шаблон ключа: pip-<ОС>-<хэш requirements.txt>, restore-keys: pip-<ОС>-.',
    ],
    solution: `      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: pip-\${{ runner.os }}-\${{ hashFiles('requirements.txt') }}
          restore-keys: pip-\${{ runner.os }}-

      - name: Install dependencies
        run: pip install -r requirements.txt`,
  },
  {
    type: 'quiz',
    id: 'b6',
    difficulty: 'medium',
    question:
      'В nginx настроено `location / { proxy_pass http://127.0.0.1:8000; }` без единого `proxy_set_header`. Django за этим прокси генерирует абсолютные ссылки вида `http://127.0.0.1:8000/...` вместо домена сайта. В чём причина?',
    options: [
      'nginx закэшировал старые ответы — поможет nginx -s reload',
      'Django требует прописать домен в настройке STATIC_URL',
      'gunicorn перезаписывает заголовки; его надо запускать с флагом --forwarded-allow-ips',
      'Без proxy_set_header nginx передаёт бэкенду Host из адреса в proxy_pass; нужно добавить proxy_set_header Host $host',
    ],
    correctIndex: 3,
    explanation:
      'По умолчанию nginx отправляет бэкенду заголовок `Host`, равный адресу из `proxy_pass` (здесь `127.0.0.1:8000`), и приложение строит ссылки по нему. `--forwarded-allow-ips` касается доверия заголовкам `X-Forwarded-*`, а не подмены Host.',
  },
  {
    type: 'code',
    id: 'b7',
    difficulty: 'medium',
    title: 'Бэкап PostgreSQL с ротацией',
    description:
      'Напишите bash-скрипт для cron: снять дамп базы `app` через `pg_dump`, сжать gzip в файл вида `app_2026-07-17.sql.gz` в каталоге `/var/backups/postgres`, удалить бэкапы старше 7 дней. Скрипт должен падать при любой ошибке, включая ошибку внутри пайпа.',
    language: 'bash',
    starterCode: `#!/usr/bin/env bash
# TODO: строгий режим, дамп с датой в имени, gzip, удаление старых файлов
`,
    hints: [
      'Строгий режим: set -euo pipefail. Без pipefail ошибка pg_dump «проглотится», потому что статус пайпа определит gzip.',
      'Дату в формате 2026-07-17 даёт date +%F, подстановка — через $(...).',
      'Старые файлы удобно удалять одной командой: find <каталог> -name <маска> -mtime +7 -delete.',
    ],
    solution: `#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=/var/backups/postgres
mkdir -p "$BACKUP_DIR"

FILE="$BACKUP_DIR/app_$(date +%F).sql.gz"
pg_dump -h localhost -U app app | gzip > "$FILE"

find "$BACKUP_DIR" -name '*.sql.gz' -mtime +7 -delete

echo "Backup created: $FILE"`,
  },
  {
    type: 'quiz',
    id: 'b8',
    difficulty: 'medium',
    question:
      'Вы добавляете метрики Prometheus в API. Какая из перечисленных метрик должна быть **gauge**, а не counter?',
    options: [
      'Общее число HTTP-запросов с момента старта сервиса',
      'Текущее число активных WebSocket-соединений',
      'Суммарное количество ответов 5xx',
      'Общее количество отправленных писем',
    ],
    correctIndex: 1,
    explanation:
      'Gauge — значение, которое может и расти, и падать: активных соединений то больше, то меньше. Остальные три только накапливаются — это counter, и именно к counter применима функция `rate()`; «текущее число» через counter выразить нельзя.',
  },
  {
    type: 'quiz',
    id: 'b9',
    difficulty: 'medium',
    question:
      'Сборка образа начинается со строки `Sending build context to Docker daemon  1.2GB` и заметно тормозит, хотя само приложение весит пару мегабайт. В каталоге проекта лежат `.git`, `node_modules` и дампы БД. Как правильно ускорить сборку?',
    options: [
      'Заменить COPY на ADD — ADD автоматически пропускает служебные каталоги',
      'Создать .dockerignore и исключить .git, node_modules и дампы: контекст, который отправляется демону, станет маленьким',
      'Выполнить docker system prune — он очистит старый кэш, и контекст перестанет отправляться',
      'Собирать с флагом --no-cache, чтобы Docker не архивировал лишние файлы',
    ],
    correctIndex: 1,
    explanation:
      'Перед сборкой клиент упаковывает весь каталог контекста и отправляет демону — ещё до выполнения первой инструкции. `.dockerignore` исключает лишнее из контекста. `docker system prune` чистит неиспользуемые данные Docker, но на объём отправляемого контекста не влияет.',
  },
  {
    type: 'code',
    id: 'b10',
    difficulty: 'medium',
    title: 'Ожидание готовности PostgreSQL',
    description:
      'Приложение в CI стартует раньше, чем PostgreSQL успевает подняться, и падает с ошибкой подключения. Напишите скрипт `wait-for-db.sh`: до 30 попыток с паузой в 1 секунду проверять доступность базы через `pg_isready` (хост и порт — аргументы скрипта с дефолтами `localhost` и `5432`). При успехе — сообщение и код 0, после 30 неудач — сообщение в stderr и код 1.',
    language: 'bash',
    starterCode: `#!/usr/bin/env bash
# TODO: строгий режим; хост и порт из аргументов с дефолтами
# TODO: до 30 попыток pg_isready с паузой 1с
# TODO: успех -> сообщение и exit 0; после 30 неудач -> stderr и exit 1
`,
    hints: [
      'pg_isready возвращает код 0, когда база принимает подключения; флаг -q подавляет вывод.',
      'Дефолты для аргументов: HOST="${1:-localhost}" — если первый аргумент не передан, подставится localhost.',
      'Цикл for i in $(seq 1 30) с sleep 1 между попытками; при успехе выходите из скрипта прямо из цикла через exit 0.',
    ],
    solution: `#!/usr/bin/env bash
set -euo pipefail

HOST="\${1:-localhost}"
PORT="\${2:-5432}"

for i in $(seq 1 30); do
  if pg_isready -h "$HOST" -p "$PORT" -q; then
    echo "PostgreSQL is ready"
    exit 0
  fi
  echo "Attempt $i/30: waiting for $HOST:$PORT..."
  sleep 1
done

echo "PostgreSQL is not available after 30 attempts" >&2
exit 1`,
  },
  {
    type: 'quiz',
    id: 'b11',
    difficulty: 'medium',
    question:
      'Пользователи жалуются: загрузка аватарок больше 1 МБ падает с ошибкой **413 Request Entity Too Large**. В логах приложения этих запросов вообще нет. Приложение — Django за nginx. Где проблема?',
    options: [
      'gunicorn отклоняет большие тела запросов — нужно поднять --limit-request-line',
      'Django ограничивает загрузку настройкой DATA_UPLOAD_MAX_MEMORY_SIZE — нужно её увеличить',
      'Браузер сам ограничивает multipart-загрузку одним мегабайтом',
      'nginx отклоняет тело больше client_max_body_size (по умолчанию 1 МБ) ещё до проксирования — нужно поднять лимит в конфиге',
    ],
    correctIndex: 3,
    explanation:
      'Раз запросы не доходят даже до логов приложения, их отбрасывает прокси: у nginx лимит `client_max_body_size` по умолчанию — 1 МБ, и страница 413 — его собственная. Если бы ограничивал Django, запрос был бы виден в логах бэкенда и ошибка пришла бы из приложения.',
  },
  {
    type: 'code',
    id: 'b12',
    difficulty: 'medium',
    title: 'CI: PostgreSQL как сервис-контейнер',
    description:
      'Интеграционные тесты требуют реального PostgreSQL. Дополните job в GitHub Actions: сервис-контейнер `postgres:16` с паролем через env, пробросом порта 5432 и health-опциями, чтобы шаги не стартовали до готовности базы. Шагу с тестами передайте переменную `DATABASE_URL`.',
    language: 'yaml',
    starterCode: `jobs:
  test:
    runs-on: ubuntu-latest
    # TODO: services: postgres:16 c env, ports и health-опциями
    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        # TODO: переменная DATABASE_URL
        run: pytest`,
    hints: [
      'Секция services объявляется на уровне job — рядом с runs-on, а не внутри steps.',
      'options с --health-cmd заставляют раннер дождаться здорового состояния контейнера до запуска шагов.',
      'Проброшенный порт 5432:5432 делает базу доступной шагам по адресу localhost:5432.',
    ],
    solution: `jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10
    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
        run: pytest`,
  },
  {
    type: 'quiz',
    id: 'b13',
    difficulty: 'hard',
    question:
      'В Dockerfile две инструкции подряд: `RUN apt-get update` и `RUN apt-get install -y curl`. Спустя месяц в install добавили пакет: `RUN apt-get install -y curl jq` — и сборка упала с ошибкой 404 при скачивании пакетов. Почему?',
    options: [
      'Изменённая инструкция install пересобирается, а слой apt-get update взят из кэша месячной давности: устаревшие списки пакетов ссылаются на уже удалённые с зеркал версии',
      'apt-get в Docker требует флаг --no-install-recommends, без него установка новых пакетов падает',
      'Пакета jq нет в репозиториях slim-образа — нужно сменить базовый образ на полный',
      'Кэш сборки повреждён — это штатная ситуация, которая лечится docker builder prune и больше ни о чём не говорит',
    ],
    correctIndex: 0,
    explanation:
      'Кэш сбрасывается только начиная с изменённой инструкции: `apt-get update` не менялся и взят старым, поэтому install качает пакеты по протухшим ссылкам. Канонично объединять их в один слой: `RUN apt-get update && apt-get install -y ...`. Prune временно «помог» бы, но причина не в повреждении кэша.',
  },
  {
    type: 'code',
    id: 'b14',
    difficulty: 'hard',
    title: 'Entrypoint: миграции перед стартом сервера',
    description:
      'В Dockerfile указано `ENTRYPOINT ["./docker-entrypoint.sh"]` и `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]`. Напишите `docker-entrypoint.sh`: применить миграции `alembic upgrade head` (при ошибке контейнер должен упасть), затем запустить команду из CMD так, чтобы сервер стал PID 1 и получал SIGTERM при `docker stop`.',
    language: 'bash',
    starterCode: `#!/usr/bin/env bash
# TODO: строгий режим
# TODO: применить миграции; при ошибке — контейнер падает
# TODO: запустить команду из CMD так, чтобы она получала сигналы
`,
    hints: [
      'Аргументы, переданные из CMD, доступны скрипту как "$@".',
      'Обычный запуск команды породит дочерний процесс, а PID 1 останется у bash — и SIGTERM от docker stop до сервера не дойдёт.',
      'Три ключевые строки: set -e, alembic upgrade head, exec "$@".',
    ],
    solution: `#!/usr/bin/env bash
set -euo pipefail

echo "Applying migrations..."
alembic upgrade head

# exec замещает shell процессом сервера: тот становится PID 1
# и получает SIGTERM от docker stop напрямую
exec "$@"`,
  },
  {
    type: 'quiz',
    id: 'b15',
    difficulty: 'hard',
    question:
      'Образ получился на 1.8 ГБ. Чтобы уменьшить его, в конец Dockerfile добавили `RUN rm -rf /root/.cache /var/tmp/build` — но размер по `docker images` не изменился. Почему?',
    options: [
      'rm молча не сработал: инструкциям RUN запрещено удалять файлы из чужих слоёв',
      'docker images показывает размер вместе с кэшем сборки, а реальный размер образа уменьшился',
      'Слои неизменяемы: rm в новом слое лишь помечает файлы удалёнными, их данные остаются в предыдущих слоях. Удалять нужно в том же RUN, где файлы появились, либо использовать multi-stage',
      'После сборки нужно выполнить docker image prune — он физически вычищает удалённые файлы из слоёв',
    ],
    correctIndex: 2,
    explanation:
      'Каждая инструкция создаёт слой поверх предыдущих; удаление в верхнем слое — это запись «этого файла больше нет», нижние слои не переписываются и продолжают весить столько же. `docker image prune` удаляет неиспользуемые образы целиком, а не файлы внутри слоёв.',
  },
  {
    type: 'code',
    id: 'b16',
    difficulty: 'hard',
    title: 'Cron без наложений: flock и trap',
    description:
      'Скрипт синхронизации запускается из cron каждые 5 минут, но иногда работает дольше — запуски накладываются и портят данные. Напишите каркас скрипта: эксклюзивная блокировка через `flock` (второй экземпляр сразу завершается с сообщением), рабочий временный каталог через `mktemp -d`, который гарантированно удаляется при любом исходе через `trap`.',
    language: 'bash',
    starterCode: `#!/usr/bin/env bash
set -euo pipefail

# TODO: блокировка flock — второй экземпляр выходит сразу
# TODO: временный каталог mktemp -d + trap для гарантированной очистки

# основная работа:
rsync -a /var/data/ "$TMP_DIR/"
`,
    hints: [
      'Идиома: exec 9>/var/lock/sync.lock открывает файловый дескриптор, а flock -n 9 пытается взять блокировку без ожидания.',
      'trap с командой очистки на EXIT срабатывает при любом завершении — и при ошибке, и при обычном выходе.',
      'mktemp -d создаёт уникальный каталог; сохраните путь в переменную и удаляйте именно её в trap.',
    ],
    solution: `#!/usr/bin/env bash
set -euo pipefail

exec 9>/var/lock/sync.lock
if ! flock -n 9; then
  echo "Previous run is still active, exiting" >&2
  exit 0
fi

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# основная работа:
rsync -a /var/data/ "$TMP_DIR/"
echo "Sync finished"`,
  },
  {
    type: 'quiz',
    id: 'b17',
    difficulty: 'hard',
    question:
      'FastAPI отдаёт прогресс задачи через Server-Sent Events. Локально события приходят мгновенно, а через nginx — пачками с задержкой в несколько секунд. В чём причина?',
    options: [
      'SSE работает только по HTTP/2, а nginx проксирует бэкенд по HTTP/1.1',
      'Браузер буферизует поток text/event-stream — задержка возникает на клиенте',
      'nginx по умолчанию буферизует ответ бэкенда (proxy_buffering) и отдаёт его крупными кусками; для стриминга буферизацию отключают: proxy_buffering off или заголовок X-Accel-Buffering: no',
      'gunicorn копит события в очереди, пока не заполнится worker_connections',
    ],
    correctIndex: 2,
    explanation:
      'Буферизация ответов — поведение nginx по умолчанию: она полезна для обычных ответов (быстро забрать у бэкенда, медленно отдавать клиенту), но ломает стриминг. SSE прекрасно работает по HTTP/1.1, а браузер поток не буферизует.',
  },
  {
    type: 'code',
    id: 'b18',
    difficulty: 'hard',
    title: 'Workflow: публикация образа по git-тегу',
    description:
      'Напишите workflow GitHub Actions: на пуш тега вида `v1.2.3` собрать Docker-образ и опубликовать его в GitHub Container Registry как `ghcr.io/<owner>/<repo>:<версия без v>`. Авторизация — встроенным `GITHUB_TOKEN`, без личных токенов.',
    language: 'yaml',
    starterCode: `name: Release

# TODO: триггер на теги вида v1.2.3
on:

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    # TODO: права для публикации через GITHUB_TOKEN
    steps:
      - uses: actions/checkout@v4
      # TODO: docker/login-action, сборка и push в ghcr.io
`,
    hints: [
      'Триггер: on: push: tags: с маской v*. Чтобы GITHUB_TOKEN мог пушить в ghcr.io, джобе нужно право packages: write в секции permissions.',
      'docker/login-action@v3: registry — ghcr.io, username — github.actor, password — secrets.GITHUB_TOKEN.',
      'Имя тега лежит в github.ref_name (например v1.2.3); срезать префикс v можно bash-подстановкой ${GITHUB_REF_NAME#v}.',
    ],
    solution: `name: Release

on:
  push:
    tags: ['v*']

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        run: |
          IMAGE=ghcr.io/\${{ github.repository }}:\${GITHUB_REF_NAME#v}
          docker build -t "$IMAGE" .
          docker push "$IMAGE"`,
  },
  {
    type: 'quiz',
    id: 'b19',
    difficulty: 'hard',
    question:
      'После релиза в access.log nginx резко выросло число ответов со статусом **499**. Что означает этот код?',
    options: [
      'Клиент закрыл соединение, не дождавшись ответа: чаще всего бэкенд стал отвечать дольше, чем готовы ждать клиенты — смотрите на тайминги upstream',
      '499 — внутренняя ошибка конфигурации nginx, аналог 500 для стадии проксирования',
      'Бэкенд вернул нестандартный код, и nginx записал его в лог как есть',
      'nginx сам разорвал соединение из-за превышения client_body_timeout',
    ],
    correctIndex: 0,
    explanation:
      '499 — нестандартный код самого nginx: «client closed request». В HTTP-ответе он не отправляется (отправлять уже некому) и обычно сигналит о медленном бэкенде либо слишком коротких таймаутах у клиентов. Если бы соединение разрывал nginx по таймауту тела, в логе был бы 408.',
  },
  {
    type: 'code',
    id: 'b20',
    difficulty: 'hard',
    title: 'Compose: web ждёт здоровые db и redis',
    description:
      'Напишите `docker-compose.yml` для стека web + PostgreSQL + Redis: сервис `web` стартует только после того, как обе зависимости **прошли healthcheck** (а не просто запущены); данные PostgreSQL — в named volume; все сервисы переживают перезагрузку сервера благодаря restart-политике.',
    language: 'yaml',
    starterCode: `services:
  web:
    build: .
    ports:
      - '8000:8000'
    # TODO: depends_on с condition: service_healthy для db и redis
    # TODO: restart-политика

  db:
    image: postgres:16
    # TODO: env, named volume, healthcheck через pg_isready

  redis:
    image: redis:7-alpine
    # TODO: healthcheck через redis-cli ping

# TODO: объявите named volume
`,
    hints: [
      'healthcheck в compose: test, interval, timeout, retries. Для PostgreSQL — pg_isready -U <user>, для Redis — redis-cli ping.',
      'depends_on в развёрнутой форме: под именем сервиса строка condition: service_healthy. Короткая форма списка ждёт лишь запуска контейнера, а не готовности.',
      'Named volume объявляется в корневой секции volumes; политика restart: unless-stopped поднимет сервисы после сбоя и перезагрузки хоста.',
    ],
    solution: `services:
  web:
    build: .
    ports:
      - '8000:8000'
    environment:
      DATABASE_URL: postgresql://app:app@db:5432/app
      REDIS_URL: redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U app -d app']
      interval: 5s
      timeout: 3s
      retries: 10
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 10
    restart: unless-stopped

volumes:
  pgdata:`,
  },
  {
    type: 'quiz',
    id: 'b21',
    difficulty: 'hard',
    question:
      'На сервере `df -h` показывает 95% занятого места, а `du -sh /` насчитывает вдвое меньше. Вчера вы удалили огромный лог командой `rm /var/log/app.log`, но место так и не освободилось. Что происходит?',
    options: [
      'du не учитывает скрытые файлы, поэтому всегда показывает меньше, чем df',
      'Файловая система повреждена — нужно размонтировать её и запустить fsck',
      'rm перемещает файлы в корзину; нужно дополнительно очистить каталог корзины',
      'Процесс всё ещё держит удалённый файл открытым: данные освободятся только после закрытия дескриптора (перезапуск или сигнал ротации); найти такие файлы можно через lsof | grep deleted',
    ],
    correctIndex: 3,
    explanation:
      '`rm` удаляет имя из каталога, но данные живут, пока хоть один процесс держит файл открытым: df видит реально занятые блоки, а du обходит только существующие имена. Поэтому логи «освобождают» ротацией с сигналом процессу или truncate, а не rm. Никакой корзины у rm нет.',
  },
  {
    type: 'quiz',
    id: 'b22',
    difficulty: 'hard',
    question:
      'Сервис в контейнере периодически падает: `docker ps -a` показывает `Exited (137)`, в `docker inspect` — `"OOMKilled": true`. Что случилось и что делать?',
    options: [
      '137 — код Python при необработанном исключении; нужно смотреть traceback в логах приложения',
      'Контейнер упёрся в лимит памяти, и ядро убило процесс: 137 = 128 + 9 (SIGKILL). Нужно искать утечку или снижать потребление — либо осознанно поднять лимит --memory',
      'Docker-демон перезапускался и остановил все контейнеры этим кодом',
      'Приложению не хватило CPU-квоты, и планировщик принудительно завершил его',
    ],
    correctIndex: 1,
    explanation:
      'Коды выше 128 означают смерть от сигнала: 137 − 128 = 9, то есть SIGKILL — его шлёт OOM killer при выходе за лимит памяти, что и подтверждает флаг `OOMKilled`. Нехватка CPU-квоты приводит к троттлингу (замедлению), но процесс из-за неё не убивают.',
  },
  {
    type: 'code',
    id: 'b23',
    difficulty: 'hard',
    title: 'Мягкая остановка процесса с дедлайном',
    description:
      'Напишите скрипт остановки сервиса по pid-файлу `/var/run/myapp.pid`: отправить SIGTERM, до 30 секунд ждать завершения (проверка раз в секунду), при graceful-завершении — сообщить и удалить pid-файл, а если процесс так и не умер — добить SIGKILL с предупреждением в stderr.',
    language: 'bash',
    starterCode: `#!/usr/bin/env bash
set -euo pipefail

PID_FILE=/var/run/myapp.pid
# TODO: SIGTERM, ждать до 30 секунд, затем SIGKILL
`,
    hints: [
      'kill -0 PID не посылает сигнал, а только проверяет, жив ли процесс: код возврата 0 — жив.',
      'SIGTERM даёт процессу шанс дописать данные и закрыть соединения; SIGKILL перехватить нельзя, поэтому он — последнее средство.',
      'Цикл из 30 итераций с sleep 1: если kill -0 вернул ошибку — процесс завершился, exit 0; после цикла — kill -KILL.',
    ],
    solution: `#!/usr/bin/env bash
set -euo pipefail

PID_FILE=/var/run/myapp.pid
PID=$(cat "$PID_FILE")

kill -TERM "$PID"
echo "Sent SIGTERM to $PID, waiting up to 30s..."

for i in $(seq 1 30); do
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "Process stopped gracefully"
    rm -f "$PID_FILE"
    exit 0
  fi
  sleep 1
done

echo "Deadline exceeded, sending SIGKILL" >&2
kill -KILL "$PID"
rm -f "$PID_FILE"`,
  },
  {
    type: 'quiz',
    id: 'b24',
    difficulty: 'hard',
    question:
      'В open-source репозитории коллега предлагает заменить в CI триггер `pull_request` на `pull_request_target`, чтобы прогонам PR из форков стали доступны секреты. Чем это опасно?',
    options: [
      'Ничем: pull_request_target — просто более новое имя того же триггера',
      'Опасности нет, если секреты объявлены в environment, а не на уровне репозитория',
      'Если workflow при этом выкачивает и исполняет код из PR (checkout ветки форка, установка зависимостей, тесты), злоумышленник пришлёт PR, который украдёт секреты: триггер даёт секреты, а код приходит недоверенный',
      'pull_request_target срабатывает только по расписанию, и CI перестанет реагировать на новые PR',
    ],
    correctIndex: 2,
    explanation:
      '`pull_request_target` выполняется в контексте базовой ветки и получает секреты — это безопасно, пока workflow не начинает исполнять недоверенный код из форка. Комбинация «checkout PR + запуск его скриптов + доступ к секретам» — классическая CI-уязвимость (pwn request), и environment сам по себе от неё не защищает.',
  },
  {
    type: 'quiz',
    id: 'b25',
    difficulty: 'hard',
    question: `В начало workflow добавили блок:

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

Что изменится в поведении CI?`,
    options: [
      'При новом пуше в ветку незавершённый прогон этой же ветки отменяется: очередь не копится, минуты CI не тратятся на устаревшие коммиты',
      'Jobs внутри одного прогона начнут выполняться строго последовательно',
      'Workflow сможет запускаться не чаще одного раза в час на каждую ветку',
      'Прогоны всех веток объединятся в одну очередь, потому что группа общая на репозиторий',
    ],
    correctIndex: 0,
    explanation:
      'Группа вычисляется из `github.ref`, то есть своя на каждую ветку; внутри группы одновременно живёт один прогон, а `cancel-in-progress: true` отменяет предыдущий при старте нового. Порядок jobs внутри прогона задаёт `needs`, к concurrency он отношения не имеет.',
  },
  {
    type: 'code',
    id: 'b26',
    difficulty: 'hard',
    title: 'Ручной деплой с выбором окружения',
    description:
      'Напишите workflow ручного деплоя: запуск кнопкой из интерфейса GitHub с выбором окружения из списка (`staging` или `production`), джоба привязана к соответствующему environment (его секреты и правила защиты), а два деплоя в одно окружение не могут идти параллельно — при этом уже идущий деплой отменять нельзя.',
    language: 'yaml',
    starterCode: `name: Deploy

# TODO: ручной запуск с выбором окружения (staging/production)
on:

# TODO: запретить параллельные деплои в одно окружение,
#       не отменяя уже идущий

jobs:
  deploy:
    runs-on: ubuntu-latest
    # TODO: подключите environment
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: ./scripts/deploy.sh
`,
    hints: [
      'Триггер workflow_dispatch принимает inputs; тип choice с options ограничивает значения. В workflow значение доступно как inputs.environment.',
      'Строка environment: в джобе подключает секреты окружения и его правила защиты — например, обязательное подтверждение для production.',
      'concurrency с group на основе inputs.environment; cancel-in-progress: false — новый запуск встанет в очередь, а идущий деплой не оборвётся на середине.',
    ],
    solution: `name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Куда деплоим'
        required: true
        type: choice
        options:
          - staging
          - production

concurrency:
  group: deploy-\${{ inputs.environment }}
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: \${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: ./scripts/deploy.sh "\${{ inputs.environment }}"`,
  },
  {
    type: 'quiz',
    id: 'b27',
    difficulty: 'hard',
    question:
      'Приложение хранило сессии в памяти процесса и работало на одном сервере. После масштабирования до трёх инстансов за балансировщиком пользователей стало случайным образом «разлогинивать». Какое решение правильное?',
    options: [
      'Увеличить TTL сессий, чтобы они не успевали протухать между запросами',
      'Вернуться к одному, но более мощному серверу: горизонтальное масштабирование несовместимо с сессиями',
      'Включить sticky sessions на балансировщике и считать проблему полностью решённой',
      'Вынести состояние из процессов: хранить сессии в общем хранилище (Redis, БД) или перейти на подписанные токены — тогда любой инстанс обслужит любой запрос',
    ],
    correctIndex: 3,
    explanation:
      'Горизонтальное масштабирование требует stateless-инстансов: запрос попадает на случайный сервер, а сессия лежит в памяти другого. Sticky sessions лишь маскируют проблему — при деплое или падении инстанса его пользователи всё равно теряют сессии, а нагрузка распределяется неровно.',
  },
  {
    type: 'quiz',
    id: 'b28',
    difficulty: 'hard',
    question:
      'Разработчик добавил в counter HTTP-запросов Prometheus метку `user_id`, чтобы видеть активность конкретных пользователей. Через неделю Prometheus съедает гигабайты памяти и еле отвечает на запросы. В чём ошибка?',
    options: [
      'counter не поддерживает метки — для меток нужно было взять gauge',
      'Каждое уникальное значение метки порождает отдельный временной ряд: метки высокой кардинальности (user_id, request_id) взрывают их число. Такие данные — в логи, а меткам положено малое число значений (метод, статус, путь-шаблон)',
      'Метки нужно заранее объявлять в конфиге Prometheus, иначе он индексирует их неэффективно',
      'Дело в scrape-интервале: при добавлении меток его нужно увеличивать пропорционально числу пользователей',
    ],
    correctIndex: 1,
    explanation:
      'Временной ряд создаётся на каждую уникальную комбинацию значений меток: миллион пользователей — миллион рядов на одну метрику, и память/индексы Prometheus взрываются. Метки поддерживают любой тип метрики, а объявлять их в конфиге сервера не нужно — проблема именно в кардинальности.',
  },
  {
    type: 'code',
    id: 'b29',
    difficulty: 'hard',
    title: 'Dockerfile: параметры сборки через ARG',
    description:
      'Напишите Dockerfile, где версия Python задаётся при сборке (`docker build --build-arg PYTHON_VERSION=3.11 .`, по умолчанию `3.12`), а версия приложения передаётся арг-ом `APP_VERSION` и должна быть доступна и процессу в рантайме (переменная окружения), и в метаданных образа (LABEL). Зависимости — отдельным кэшируемым слоем.',
    language: 'docker',
    starterCode: `# TODO: версия Python через --build-arg (по умолчанию 3.12)
# TODO: APP_VERSION доступна в рантайме и в LABEL
FROM ...
`,
    hints: [
      'ARG, объявленный до FROM, действует только в самой строке FROM; чтобы пользоваться значением после FROM, объявите ARG с тем же именем ещё раз внутри стадии.',
      'ARG существует только во время сборки — в запущенном контейнере его нет. Чтобы значение видел процесс, скопируйте его в ENV.',
      'Стандартный ключ метаданных для версии: LABEL org.opencontainers.image.version=...',
    ],
    solution: `ARG PYTHON_VERSION=3.12
FROM python:\${PYTHON_VERSION}-slim

# ARG до FROM после него недоступен — объявляем заново
ARG APP_VERSION=dev

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ENV сохраняется в рантайме, сам ARG — только на время сборки
ENV APP_VERSION=\${APP_VERSION}
LABEL org.opencontainers.image.version=\${APP_VERSION}

CMD ["python", "-m", "app"]`,
  },
  {
    type: 'quiz',
    id: 'b30',
    difficulty: 'hard',
    question: `Что выведет скрипт, если в servers.txt пять строк?

count=0
cat servers.txt | while read -r line; do
  count=$((count + 1))
done
echo "$count"`,
    options: [
      '5 — цикл прочитает пять строк и столько же раз увеличит счётчик',
      '5, но только если файл заканчивается переводом строки; иначе 4',
      '0 — правая часть пайпа выполняется в подоболочке: count увеличивается в её копии, а echo в родительском процессе видит исходное значение',
      'Скрипт упадёт с ошибкой: read нельзя использовать в правой части пайпа',
    ],
    correctIndex: 2,
    explanation:
      'Каждое звено пайпа — отдельный процесс, и изменения переменных в подоболочке не видны родителю, поэтому наружу вернётся 0. Идиоматичное решение — обойтись без пайпа: `while read -r line; do ...; done < servers.txt`. Особенность с последней строкой без перевода строки реальна, но на итоговый вывод здесь не влияет.',
  },
]
