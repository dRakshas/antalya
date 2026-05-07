# Анталья 18 — интерактивный путеводитель

Лендинг «18 мест Антальи» — выбери, куда хочется, и скопируй список.

**Сайт**: [drakshas.github.io/antalya](https://drakshas.github.io/antalya/)

## Что это

Подборка 18 мест провинции Анталья: дикие бухты, античные города, каньоны и водопады. Нажми «Хочу сюда» на карточках — список сохраняется в браузере и можно скопировать или поделиться.

## Запуск локально

Статический сайт, никакой сборки не нужно. Используй любой HTTP-сервер:

```bash
npx serve .
# или
python3 -m http.server 8080
```

Открой `http://localhost:8080`.

> Нельзя открыть через `file://` — ES-модули не работают без HTTP сервера.

## Структура

```
├── index.html          — единственная страница
├── css/                — дизайн-система (tokens, reset, base, grid, carousel)
├── js/                 — vanilla ES-модули (render, voting, carousel, theme)
├── data/places.js      — 18 мест, единственный источник данных
├── img/places/         — локальные AVIF/WebP версии фото (где доступны)
└── fonts/              — self-hosted woff2 (Fraunces + Inter variable)
```

## Фото и атрибуция

Фотографии из [Wikimedia Commons](https://commons.wikimedia.org/) под лицензиями CC BY / CC BY-SA / CC0. Полная атрибуция — в файле [ATTRIBUTIONS.md](ATTRIBUTIONS.md).

## Лицензия

Код — MIT. Фотографии — под лицензиями их авторов (см. ATTRIBUTIONS.md).
