import { mkdirSync } from 'node:fs'
import path from 'node:path'
// Со времён Node 22 SQLite встроен в саму платформу — внешний драйвер не нужен.
// DatabaseSync работает синхронно: для SQLite это нормально (операции — чтение
// локального файла, а не сетевые запросы) и сильно упрощает код.
import { DatabaseSync } from 'node:sqlite'
import { config } from './config.js'

mkdirSync(path.dirname(config.databasePath), { recursive: true })

export const db = new DatabaseSync(config.databasePath)

// WAL-режим позволяет читать во время записи; foreign_keys в SQLite
// по историческим причинам выключены по умолчанию — включаем явно.
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`)

// Простейшая "миграция": схема создаётся при старте, если её ещё нет.
// В реальном проекте здесь была бы система версионированных миграций.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS progress (
    user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    lessons    TEXT NOT NULL DEFAULT '[]',
    exercises  TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)
