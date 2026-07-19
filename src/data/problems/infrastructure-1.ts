import type { Problem } from '@/types/course'

// Сборник задач: Инфраструктура, часть 1
export const problems: Problem[] = [
  {
    type: 'quiz',
    id: 'a1',
    difficulty: 'easy',
    question: 'Что покажет команда `docker ps` без флагов?',
    options: [
      'Все образы, скачанные на машину',
      'Все контейнеры, включая остановленные',
      'Только запущенные в данный момент контейнеры',
      'Список процессов внутри последнего запущенного контейнера',
    ],
    correctIndex: 2,
    explanation:
      '`docker ps` показывает только работающие контейнеры; чтобы увидеть и остановленные, нужен флаг `-a`. Список образов выводит другая команда — `docker images`.',
  },
  {
    type: 'quiz',
    id: 'a2',
    difficulty: 'easy',
    question: 'В чём ключевое отличие `CMD` от `ENTRYPOINT` в Dockerfile?',
    options: [
      'Аргументы после `docker run образ` полностью заменяют CMD, а к ENTRYPOINT — добавляются',
      'ENTRYPOINT выполняется при сборке образа, а CMD — при запуске контейнера',
      'CMD в Dockerfile может быть только один, а ENTRYPOINT — сколько угодно',
      'Отличий нет — это синонимы, оставленные для совместимости',
    ],
    correctIndex: 0,
    explanation:
      'CMD — команда по умолчанию, которую легко переопределить аргументами `docker run`; ENTRYPOINT — «несменяемая» часть команды, к которой аргументы дописываются. Оба выполняются при запуске контейнера, а не при сборке — во время сборки работает `RUN`.',
  },
  {
    type: 'code',
    id: 'a3',
    difficulty: 'easy',
    title: 'Dockerfile для скрипта-утилиты',
    description:
      'У вас есть скрипт `report.py` без внешних зависимостей. Напишите Dockerfile: базовый образ `python:3.12-slim`, рабочая директория `/app`, копирование скрипта и запуск через **ENTRYPOINT в exec-форме** — чтобы `docker run report --month 6` передавал аргументы прямо скрипту.',
    language: 'docker',
    starterCode: `# TODO: базовый образ python:3.12-slim
# TODO: рабочая директория /app
# TODO: скопируйте report.py
# TODO: ENTRYPOINT в exec-форме, чтобы аргументы docker run попадали в скрипт`,
    hints: [
      'Начните с FROM python:3.12-slim и WORKDIR /app.',
      'Exec-форма — это JSON-массив: ENTRYPOINT ["python", "report.py"].',
      'Нужен именно ENTRYPOINT, а не CMD: аргументы docker run добавляются к ENTRYPOINT, а CMD они бы заменили целиком.',
    ],
    solution: `FROM python:3.12-slim
WORKDIR /app
COPY report.py .
ENTRYPOINT ["python", "report.py"]`,
  },
  {
    type: 'quiz',
    id: 'a4',
    difficulty: 'easy',
    question: 'В docker-compose.yml у сервиса указано `ports: ["8000:80"]`. Как трактовать эту запись?',
    options: [
      'Порт 8000 контейнера доступен на порту 80 хоста',
      'Порт 80 контейнера доступен на порту 8000 хоста',
      'Контейнер слушает сразу оба порта: 8000 и 80',
      'Трафик с порта 8000 перенаправляется на порт 80 внутри сети Docker без выхода на хост',
    ],
    correctIndex: 1,
    explanation:
      'Формат записи — `хост:контейнер`: слева порт машины, справа порт внутри контейнера. Перепутать их местами — классическая ошибка, из-за которой сервис «не отвечает» с хоста.',
  },
  {
    type: 'code',
    id: 'a5',
    difficulty: 'easy',
    title: 'Бэкап каталога с датой в имени',
    description:
      'Напишите скрипт, который архивирует каталог `/var/app/uploads` в файл `uploads-ГГГГ-ММ-ДД.tar.gz` внутри `/backups` и печатает имя созданного архива. Дата — текущая, в формате `date +%F`.',
    language: 'bash',
    starterCode: `#!/bin/bash
# TODO: сформируйте имя файла с текущей датой (date +%F)
# TODO: создайте архив каталога /var/app/uploads в /backups
# TODO: выведите имя созданного файла`,
    hints: [
      'Подстановка команды $(date +%F) вернёт строку вида 2026-07-17 — её можно вставить прямо в имя файла.',
      'Флаг -C /var/app говорит tar сначала перейти в каталог: в архиве будут пути uploads/..., а не /var/app/uploads/... целиком.',
      'tar -czf "$NAME" -C /var/app uploads, затем echo "$NAME".',
    ],
    solution: `#!/bin/bash
set -e
NAME=/backups/uploads-$(date +%F).tar.gz
tar -czf "$NAME" -C /var/app uploads
echo "Создан архив: $NAME"`,
  },
  {
    type: 'quiz',
    id: 'a6',
    difficulty: 'easy',
    question:
      'Вы скачали `deploy.sh`, но `./deploy.sh` выдаёт **Permission denied**. Что делает команда `chmod +x deploy.sh`, которая решает проблему?',
    options: [
      'Запускает скрипт от имени root',
      'Снимает атрибут «только для чтения», чтобы файл можно было изменять',
      'Регистрирует скрипт в PATH, чтобы вызывать его из любого каталога',
      'Добавляет файлу право на исполнение — теперь его можно запускать как программу',
    ],
    correctIndex: 3,
    explanation:
      '`+x` добавляет execute-бит: без него шелл отказывается запускать файл как программу. Права root здесь ни при чём (это про `sudo`), а переменную PATH `chmod` не трогает.',
  },
  {
    type: 'quiz',
    id: 'a7',
    difficulty: 'easy',
    question: 'В workflow GitHub Actions указан триггер `on: pull_request`. Когда он сработает?',
    options: [
      'При открытии PR и при каждом новом пуше коммитов в его ветку',
      'Только один раз — в момент создания pull request',
      'Только когда PR будет смержен в main',
      'При любом пуше в любую ветку репозитория',
    ],
    correctIndex: 0,
    explanation:
      'По умолчанию `pull_request` реагирует на события opened, synchronize (новые коммиты в ветку PR) и reopened — так проверки перезапускаются на каждое обновление кода. Момент мержа — это уже событие `push` в целевую ветку.',
  },
  {
    type: 'code',
    id: 'a8',
    difficulty: 'easy',
    title: 'Первый CI-workflow',
    description:
      'Создайте workflow `tests.yml`: запуск при пуше в ветку `main`; одна джоба `test` на `ubuntu-latest` — checkout репозитория, установка Python 3.12 через `actions/setup-python@v5`, установка зависимостей из `requirements.txt` и запуск `pytest`.',
    language: 'yaml',
    starterCode: `name: tests
# TODO: триггер — пуш в ветку main
on:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # TODO: checkout, установка Python 3.12, зависимости, pytest`,
    hints: [
      'Триггер записывается вложенно: on -> push -> branches: [main].',
      'Готовые действия подключаются через uses (actions/checkout@v4, actions/setup-python@v5), свои команды — через run.',
      'Версия Python передаётся в setup-python через with: python-version.',
    ],
    solution: `name: tests
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      - run: pytest`,
  },
  {
    type: 'quiz',
    id: 'a9',
    difficulty: 'easy',
    question: 'Что такое runner в GitHub Actions?',
    options: [
      'Контейнер с вашим приложением, который собирается в ходе workflow',
      'Файл в `.github/workflows/`, описывающий шаги pipeline',
      'Сервер (виртуальная машина), на котором выполняются джобы workflow',
      'Утилита командной строки для локального запуска тестов перед пушем',
    ],
    correctIndex: 2,
    explanation:
      'Runner — это машина-исполнитель: GitHub предоставляет hosted-раннеры (например, `ubuntu-latest`), а можно подключить и свой self-hosted. Файл в `.github/workflows/` — это сам workflow, то есть инструкция для раннера, а не он сам.',
  },
  {
    type: 'quiz',
    id: 'a10',
    difficulty: 'easy',
    question: 'Что делает директива `proxy_pass http://127.0.0.1:8000;` в конфиге nginx?',
    options: [
      'Кэширует ответы приложения, работающего на порту 8000',
      'Передаёт входящий запрос приложению на 127.0.0.1:8000 и возвращает клиенту его ответ',
      'Отвечает клиенту HTTP-редиректом на адрес 127.0.0.1:8000',
      'Открывает порт 8000 наружу для прямых подключений из интернета',
    ],
    correctIndex: 1,
    explanation:
      '`proxy_pass` — это проксирование: nginx сам ходит к бэкенду (например, gunicorn) и отдаёт клиенту полученный ответ; клиент общается только с nginx. Редирект (301/302) делали бы директивы `return` или `rewrite`, и адрес 127.0.0.1 у клиента вообще бы не открылся.',
  },
  {
    type: 'code',
    id: 'a11',
    difficulty: 'easy',
    title: 'Скрипт проверки здоровья сервиса',
    description:
      'Напишите скрипт `check.sh`: он запрашивает `http://localhost:8000/health` через curl; если сервис ответил успешно (2xx) — печатает `OK` и завершается с кодом 0, иначе печатает `FAIL` и завершается с кодом 1. Такой скрипт удобно дёргать из cron или CI.',
    language: 'bash',
    starterCode: `#!/bin/bash
# TODO: запросите http://localhost:8000/health через curl
#       (флаг -f заставит curl вернуть ненулевой код при HTTP-ошибке)
# TODO: по результату выведите OK (exit 0) или FAIL (exit 1)`,
    hints: [
      'curl -f возвращает ненулевой код выхода при статусах 4xx/5xx — это можно использовать прямо в if.',
      'Флаги -sS убирают прогресс-бар, но оставляют сообщения об ошибках; -o /dev/null прячет тело ответа.',
      'if curl -fsS -o /dev/null URL; then ... else ... fi',
    ],
    solution: `#!/bin/bash
if curl -fsS -o /dev/null http://localhost:8000/health; then
  echo "OK"
  exit 0
else
  echo "FAIL"
  exit 1
fi`,
  },
  {
    type: 'quiz',
    id: 'a12',
    difficulty: 'easy',
    question:
      'Зачем в репозитории хранят файл `.env.example`, если сам `.env` добавлен в `.gitignore`?',
    options: [
      'Это резервная копия .env на случай его случайного удаления',
      'Docker Compose требует его наличия для подстановки переменных',
      '.env.example автоматически подхватывается в CI вместо .env',
      'Это шаблон со списком нужных переменных без секретных значений: новый разработчик копирует его в .env и заполняет',
    ],
    correctIndex: 3,
    explanation:
      '`.env.example` документирует, какие переменные нужны приложению, не раскрывая секретов. Резервной копией он быть не может — реальные значения в нём как раз и не хранят, только имена переменных и безопасные заглушки.',
  },
  {
    type: 'quiz',
    id: 'a13',
    difficulty: 'easy',
    question:
      'Контейнер пишет загруженные пользователями файлы в каталог `/app/data`. Volume не подключён. Что произойдёт с файлами после удаления контейнера командой `docker rm`?',
    options: [
      'Они будут безвозвратно удалены вместе с файловой системой контейнера',
      'Они сохранятся в образе и появятся в следующем контейнере из этого образа',
      'Docker автоматически перенесёт их в скрытый системный volume',
      'Ничего не произойдёт: контейнеры всегда пишут файлы напрямую на диск хоста',
    ],
    correctIndex: 0,
    explanation:
      'Слой записи контейнера живёт ровно столько, сколько сам контейнер, — поэтому всё ценное монтируют в volume или bind mount. В образ данные попасть не могут: образ неизменяем, записи времени выполнения в него не сохраняются.',
  },
  {
    type: 'code',
    id: 'a14',
    difficulty: 'easy',
    title: 'Compose: PostgreSQL с постоянным хранилищем',
    description:
      'Опишите в `docker-compose.yml` сервис `db`: образ `postgres:16`, переменная окружения `POSTGRES_PASSWORD=secret`, проброс порта 5432 на 5432 хоста и **named volume** `pgdata`, смонтированный в `/var/lib/postgresql/data`, чтобы данные переживали пересоздание контейнера.',
    language: 'yaml',
    starterCode: `services:
  db:
    image: postgres:16
    # TODO: переменная окружения POSTGRES_PASSWORD
    # TODO: проброс порта 5432:5432
    # TODO: volume pgdata -> /var/lib/postgresql/data

# TODO: объявите named volume pgdata в секции volumes верхнего уровня`,
    hints: [
      'Переменные окружения задаются в секции environment, порты — списком в ports.',
      'Монтирование named volume выглядит как pgdata:/var/lib/postgresql/data в volumes сервиса.',
      'Named volume нужно объявить дважды: у сервиса и в секции volumes верхнего уровня (достаточно пустой записи pgdata:).',
    ],
    solution: `services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`,
  },
  {
    type: 'quiz',
    id: 'a15',
    difficulty: 'easy',
    question:
      'Логгер настроен на уровень `WARNING`. Какие из вызовов попадут в вывод: `logger.debug(...)`, `logger.info(...)`, `logger.warning(...)`, `logger.error(...)`?',
    options: [
      'Только warning — уровень задаёт единственный видимый тип записей',
      'debug и info — уровень отсекает всё, что серьёзнее него',
      'warning и error — проходят записи уровня WARNING и выше',
      'Все четыре — уровень влияет только на формат вывода, а не на фильтрацию',
    ],
    correctIndex: 2,
    explanation:
      'Уровень — это нижний порог: пропускается всё, что не менее серьёзно (WARNING, ERROR, CRITICAL), а DEBUG и INFO отбрасываются. Уровень — именно фильтр, формат записей задаётся отдельно, форматтером.',
  },
  {
    type: 'quiz',
    id: 'a16',
    difficulty: 'easy',
    question: 'В начале деплой-скрипта стоит `set -e`. Как это меняет поведение скрипта?',
    options: [
      'Все команды выполняются с правами суперпользователя',
      'Скрипт немедленно завершится, если любая команда вернёт ненулевой код выхода',
      'Каждая команда перед выполнением печатается в терминал',
      'Ошибки команд подавляются, и скрипт всегда завершается успешно',
    ],
    correctIndex: 1,
    explanation:
      'Без `set -e` bash продолжает выполнять скрипт после упавшей команды — деплой пойдёт дальше даже после неудачной миграции. Печать каждой команды — это другой флаг, `set -x`.',
  },
  {
    type: 'code',
    id: 'a17',
    difficulty: 'easy',
    title: 'HEALTHCHECK для образа с API',
    description:
      'Допишите в Dockerfile инструкцию `HEALTHCHECK`: каждые **30 секунд** запрашивать `http://localhost:8000/health` (curl уже установлен в образ), таймаут — **3 секунды**; при HTTP-ошибке проверка должна проваливаться (флаг `-f` у curl), чтобы Docker пометил контейнер как unhealthy.',
    language: 'docker',
    starterCode: `FROM python:3.12-slim
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
# TODO: HEALTHCHECK: интервал 30 с, таймаут 3 с, curl -f на /health
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]`,
    hints: [
      'Синтаксис: HEALTHCHECK [опции] CMD команда. Опции интервала и таймаута: --interval и --timeout.',
      'curl -f вернёт ненулевой код при статусе 4xx/5xx — именно ненулевой код и означает «нездоров».',
      'HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1',
    ],
    solution: `FROM python:3.12-slim
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]`,
  },
  {
    type: 'quiz',
    id: 'a18',
    difficulty: 'easy',
    question: 'Как Prometheus получает метрики от вашего приложения?',
    options: [
      'Приложение само отправляет метрики в Prometheus при каждом обработанном запросе',
      'Метрики пишутся в общую базу данных, откуда Prometheus их периодически читает',
      'Агент на сервере пересылает логи приложения, а Prometheus извлекает метрики из них',
      'Prometheus сам периодически опрашивает HTTP-эндпоинт `/metrics` приложения (pull-модель)',
    ],
    correctIndex: 3,
    explanation:
      'Prometheus работает по pull-модели: сам ходит по списку целей и забирает метрики с `/metrics`. Отправка метрик приложением — это push-модель (StatsD, Pushgateway), а логи — вообще другой сигнал, ими занимаются системы вроде Loki или ELK.',
  },
  {
    type: 'quiz',
    id: 'a19',
    difficulty: 'medium',
    question:
      'Команда использует в Dockerfile базовый образ `FROM python:latest`. Вчера и сегодня сборка дала разные результаты. В чём причина и как правильно?',
    options: [
      'latest всегда указывает на самую стабильную версию — проблема в кэше, его нужно чистить перед каждой сборкой',
      'Тег latest со временем указывает на разные версии образа — нужно зафиксировать конкретную, например `python:3.12-slim`',
      'Docker не поддерживает тег latest для официальных образов, поэтому выбирается случайный тег',
      'Проблема только в размере образа: latest тяжелее, но на воспроизводимость сборки не влияет',
    ],
    correctIndex: 1,
    explanation:
      'latest — обычный «плавающий» тег: после выхода новой версии Python он начинает указывать на другой образ, и сборка перестаёт быть воспроизводимой. Чистка кэша только усугубит: как раз кэш какое-то время маскирует проблему, продолжая использовать старый скачанный образ.',
  },
  {
    type: 'code',
    id: 'a20',
    difficulty: 'medium',
    title: 'Multi-stage: лёгкий образ без компиляторов',
    description:
      'Часть зависимостей проекта компилируется при установке, поэтому нужен полный образ с тулчейном — но тащить его в продакшен не хочется. Напишите двухстадийный Dockerfile: стадия `builder` (образ `python:3.12`) создаёт виртуальное окружение `/opt/venv` и ставит в него `requirements.txt`; финальная стадия (`python:3.12-slim`) забирает готовый venv через `COPY --from=builder` и добавляет его в `PATH`.',
    language: 'docker',
    starterCode: `FROM python:3.12 AS builder
# TODO: создайте venv в /opt/venv, добавьте его в PATH
# TODO: установите зависимости из requirements.txt

FROM python:3.12-slim
# TODO: скопируйте /opt/venv из builder-стадии
# TODO: добавьте /opt/venv/bin в начало PATH через ENV
COPY . /app
WORKDIR /app
CMD ["python", "main.py"]`,
    hints: [
      'venv создаётся командой python -m venv /opt/venv; чтобы pip ставил пакеты в него, добавьте /opt/venv/bin в PATH через ENV.',
      'COPY --from=builder /opt/venv /opt/venv переносит окружение между стадиями; компиляторы из builder-стадии в финальный образ не попадут.',
      'ENV PATH="/opt/venv/bin:$PATH" нужен в обеих стадиях: в builder — для установки, в финальной — для запуска.',
    ],
    solution: `FROM python:3.12 AS builder
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY . /app
WORKDIR /app
CMD ["python", "main.py"]`,
  },
  {
    type: 'quiz',
    id: 'a21',
    difficulty: 'medium',
    question:
      'В джобе GitHub Actions задана матрица: `python: ["3.11", "3.12"]` и `os: [ubuntu-latest, windows-latest]`. Сколько запусков джобы получится?',
    options: [
      '1 — матрица лишь задаёт значения по умолчанию для переменных',
      '2 — по одному запуску на каждую версию Python, операционные системы чередуются',
      '4 — декартово произведение: каждая версия Python на каждой ОС',
      '8 — каждая комбинация запускается дважды для защиты от flaky-тестов',
    ],
    correctIndex: 2,
    explanation:
      'Матрица порождает джобу для каждой комбинации осей: 2 версии × 2 ОС = 4 параллельных запуска. «Чередование» осей — распространённое заблуждение: оси перемножаются, а не идут парами.',
  },
  {
    type: 'code',
    id: 'a22',
    difficulty: 'medium',
    title: 'Деплой-скрипт с проверкой после перезапуска',
    description:
      'Напишите `deploy.sh` для VPS: включите строгий режим `set -euo pipefail`; выполните `git pull`, `docker compose pull` и `docker compose up -d`; затем подождите 5 секунд и проверьте `http://localhost:8000/health` через `curl -f`. Если проверка провалилась — сообщение **в stderr** и выход с кодом 1, иначе — сообщение об успехе.',
    language: 'bash',
    starterCode: `#!/bin/bash
# TODO: строгий режим (ошибка любой команды останавливает скрипт)

# TODO: git pull, docker compose pull, docker compose up -d

# TODO: подождите 5 секунд и проверьте /health через curl -f
# TODO: при неудаче — сообщение в stderr и exit 1`,
    hints: [
      'set -euo pipefail: -e останавливает при ошибке, -u ругается на несуществующие переменные, pipefail не даёт конвейеру скрыть ошибку.',
      'Перенаправление в stderr: echo "текст" >&2.',
      'Проверка с отрицанием: if ! curl -fsS URL > /dev/null; then ... fi.',
    ],
    solution: `#!/bin/bash
set -euo pipefail

git pull
docker compose pull
docker compose up -d

sleep 5
if ! curl -fsS http://localhost:8000/health > /dev/null; then
  echo "Деплой не прошёл проверку: /health недоступен" >&2
  exit 1
fi
echo "Деплой успешно завершён"`,
  },
  {
    type: 'quiz',
    id: 'a23',
    difficulty: 'medium',
    question:
      'После деплоя nginx отдаёт клиентам **502 Bad Gateway**, хотя вчера всё работало. Какая причина наиболее вероятна?',
    options: [
      'Backend (gunicorn) не запустился или слушает не тот адрес — nginx не может достучаться до upstream',
      'Клиенты отправляют некорректные запросы: 502 означает ошибку на стороне клиента',
      'Кончилось место на диске под статику, и nginx не может отдавать файлы',
      'Истёк TLS-сертификат, поэтому nginx отклоняет все соединения',
    ],
    correctIndex: 0,
    explanation:
      '502 — это ответ прокси: nginx жив, но не получил корректный ответ от upstream, чаще всего потому, что процесс приложения упал или слушает другой порт/сокет. Ошибки клиента — это коды 4xx, а проблемы с сертификатом проявились бы на этапе TLS-рукопожатия, ещё до какого-либо HTTP-статуса.',
  },
  {
    type: 'code',
    id: 'a24',
    difficulty: 'medium',
    title: 'Pipeline: деплой только после тестов и только из main',
    description:
      'Дополните workflow: джоба `deploy` должна запускаться **только после успешных** `lint` и `test` (ключ `needs`) и **только** для пушей в ветку `main` — условие `if` со сравнением `github.ref` со строкой `refs/heads/main`. Шаг деплоя уже написан.',
    language: 'yaml',
    starterCode: `name: pipeline
on: push

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ruff check .
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pytest
  deploy:
    runs-on: ubuntu-latest
    # TODO: needs — только после lint и test
    # TODO: if — только для ветки main
    steps:
      - run: ./deploy.sh`,
    hints: [
      'needs принимает список джоб: needs: [lint, test] — deploy подождёт обе и не стартует, если любая упала.',
      'Полное имя ветки в github.ref выглядит как refs/heads/main, а не просто main.',
      "Условие: if: github.ref == 'refs/heads/main' — строка сравнения в одинарных кавычках.",
    ],
    solution: `name: pipeline
on: push

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ruff check .
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pytest
  deploy:
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - run: ./deploy.sh`,
  },
  {
    type: 'quiz',
    id: 'a25',
    difficulty: 'medium',
    question:
      'Вы выполнили `systemctl start myapi`, сервис заработал. Но после перезагрузки сервера API снова недоступен. Какой команды не хватило?',
    options: [
      '`systemctl reload myapi` — без него конфигурация сервиса не сохраняется на диск',
      '`systemctl daemon-reload` — именно он закрепляет сервис в автозагрузке',
      'Никакой: start всегда добавляет сервис в автозагрузку, проблема в самом приложении',
      '`systemctl enable myapi` — start запускает сервис только до перезагрузки, автозапуск включает enable',
    ],
    correctIndex: 3,
    explanation:
      '`start` запускает сервис здесь и сейчас, а `enable` создаёт симлинк, благодаря которому systemd поднимет его при загрузке; часто их объединяют в `enable --now`. `daemon-reload` лишь заставляет systemd перечитать unit-файлы после их редактирования и к автозагрузке отношения не имеет.',
  },
  {
    type: 'code',
    id: 'a26',
    difficulty: 'medium',
    title: 'Prometheus: подключите приложение к мониторингу',
    description:
      'Ваше FastAPI-приложение отдаёт метрики на `app:8000/metrics` (имя `app` — из сети Docker Compose). Допишите `prometheus.yml`: job с именем `fastapi-app`, опрос каждые **15 секунд** (глобальный интервал — 60 с, его менять нельзя), target — `app:8000`. Путь `/metrics` используется по умолчанию, указывать его не нужно.',
    language: 'yaml',
    starterCode: `global:
  scrape_interval: 60s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']
  # TODO: job fastapi-app — опрос app:8000 каждые 15 секунд`,
    hints: [
      'Новый элемент списка scrape_configs начинается с - job_name: ....',
      'scrape_interval, указанный внутри job, переопределяет значение из global только для этого job.',
      "Цели задаются как static_configs -> targets: ['app:8000'] — без http:// и без /metrics.",
    ],
    solution: `global:
  scrape_interval: 60s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']
  - job_name: fastapi-app
    scrape_interval: 15s
    static_configs:
      - targets: ['app:8000']`,
  },
  {
    type: 'quiz',
    id: 'a27',
    difficulty: 'medium',
    question:
      'Почему в контейнеризованных приложениях логи принято писать в stdout, а не в файл внутри контейнера?',
    options: [
      'stdout работает быстрее файловой системы — это оптимизация производительности',
      'Файл исчезнет вместе с контейнером, а stdout подхватывает Docker: логи доступны через `docker logs` и легко отправляются в централизованное хранилище',
      'Писать в файлы из контейнера запрещено политиками безопасности Docker',
      'stdout автоматически ротирует старые записи, а файлы растут бесконечно',
    ],
    correctIndex: 1,
    explanation:
      'По 12-factor приложение просто пишет поток событий в stdout, а сбором, хранением и ротацией занимается платформа — logging driver Docker и системы агрегации. Скорость тут ни при чём, а писать в файлы никто не запрещает — это просто неудобно и недолговечно.',
  },
  {
    type: 'code',
    id: 'a28',
    difficulty: 'medium',
    title: 'Топ-5 IP-адресов в access.log',
    description:
      'На сервер идёт подозрительно много запросов. Напишите конвейер (pipeline), который по файлу `/var/log/nginx/access.log` выведет **пять IP-адресов с наибольшим числом запросов** и счётчик для каждого. IP — первое поле каждой строки лога.',
    language: 'bash',
    starterCode: `#!/bin/bash
# Формат строки лога:
# 203.0.113.7 - - [17/Jul/2026:10:00:00 +0000] "GET / HTTP/1.1" 200 ...
# TODO: выделите первое поле, посчитайте повторы,
#       отсортируйте по убыванию и возьмите топ-5`,
    hints: [
      "awk '{print $1}' достаёт первое поле каждой строки (можно и cut -d' ' -f1).",
      'uniq -c считает подряд идущие повторы, поэтому перед ним нужен sort.',
      "Итоговый конвейер: awk '{print $1}' файл | sort | uniq -c | sort -rn | head -5.",
    ],
    solution: `#!/bin/bash
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -5`,
  },
  {
    type: 'quiz',
    id: 'a29',
    difficulty: 'medium',
    question:
      'Средняя задержка API — 80 мс, дашборд выглядит отлично, но пользователи жалуются на периодические «зависания». Какую метрику стоит добавить на дашборд, чтобы увидеть проблему?',
    options: [
      'RPS — при жалобах в первую очередь нужно смотреть на нагрузку',
      'Минимальную задержку — она покажет лучший достижимый результат',
      'Перцентили задержки (p95/p99) — среднее скрывает медленный «хвост» запросов',
      'Аптайм сервиса — если он 100%, проблема на стороне пользователей',
    ],
    correctIndex: 2,
    explanation:
      'Если 1% запросов выполняется по 5 секунд, среднее почти не сдвинется, а p99 сразу это покажет — жалуются как раз пользователи из «хвоста» распределения. RPS отвечает на другой вопрос (сколько запросов), а не на «насколько медленно» им отвечают.',
  },
  {
    type: 'code',
    id: 'a30',
    difficulty: 'medium',
    title: 'Контейнер останавливается 10 секунд: почините Dockerfile',
    description:
      '`docker stop` каждый раз «висит» 10 секунд, после чего контейнер убивается принудительно. Причина — shell-форма CMD: PID 1 занимает `/bin/sh`, и SIGTERM не доходит до gunicorn. Перепишите CMD в **exec-форму**. Заодно почините вторую проблему: `print(...)` из приложения появляются в `docker logs` с большой задержкой, потому что Python буферизует stdout вне терминала, — добавьте переменную окружения `PYTHONUNBUFFERED=1`.',
    language: 'docker',
    starterCode: `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# TODO: отключите буферизацию stdout у Python (переменная окружения)
# TODO: перепишите CMD в exec-форму, чтобы gunicorn получал SIGTERM
CMD gunicorn -b 0.0.0.0:8000 app:app`,
    hints: [
      'В shell-форме команду запускает /bin/sh -c: сигнал SIGTERM получает шелл, а gunicorn о нём даже не узнаёт.',
      'Exec-форма — JSON-массив: CMD ["gunicorn", ...] — процесс становится PID 1 и сам получает сигналы.',
      'Переменная задаётся инструкцией ENV PYTHONUNBUFFERED=1: при любом непустом значении Python пишет в stdout/stderr без буферизации.',
    ],
    solution: `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONUNBUFFERED=1
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]`,
  },
]
