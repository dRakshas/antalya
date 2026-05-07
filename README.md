# 18 мест Антальи

Статический лендинг-путеводитель по 18 лучшим местам Антальи. Пользователь просматривает карточки с фотографиями, голосует «Хочу сюда», собирает список и копирует его. Без регистрации, без бэкенда, без трения.

**Live:** https://drakshas.github.io/antalya/

## Стек

- HTML5 (семантика, BEM-подобные классы)
- CSS3 (custom properties, Grid, Flexbox, `clamp()`, scroll-driven animations) — без препроцессоров
- Vanilla JavaScript ES2020 (modules) — без фреймворков, бандл < 10 kb gzip
- Google Fonts self-hosted: Fraunces (variable), Inter (variable)
- Деплой: GitHub Pages из ветки `main`

## Как запускать локально

```bash
npx serve .
# или
python3 -m http.server 8080
```

Открыть http://localhost:3000 (или 8080).

> ES-модули работают только через HTTP, не через `file://`.

## Структура файлов

```
antalya/
├── index.html          # Единственная страница
├── css/                # Стили: reset, tokens, base, layout, components, animations
├── js/                 # Логика: main, store, voting, carousel, theme, share, render
├── data/places.js      # Данные 18 мест
├── fonts/              # Self-hosted шрифты
├── img/                # Фото: hero/, places/<slug>/, icons/
├── robots.txt
├── sitemap.xml
├── ATTRIBUTIONS.md
└── LICENSE
```

## Лицензии

- **Код**: MIT — `LICENSE`
- **Шрифты**: SIL OFL 1.1 (Fraunces, Inter)
- **Фотографии**: различные лицензии — `ATTRIBUTIONS.md`
