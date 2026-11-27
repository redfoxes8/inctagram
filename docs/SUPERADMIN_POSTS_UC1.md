# IN-175 · UC-1: Posts list в суперадминке

Реализован маршрут `/superadmin/posts`, доступный через Posts list в Sidebar.
Исходная ветка: `IN-175-superadmin-posts-list`; перед работой рабочее дерево было чистым.

## Контракт и операции

Источники: [frontend guide](GRAPHQL_SUPERADMIN_FRONTEND_API.md),
[runtime SDL 1.7.0](graphql/superadmin/v1/runtime.graphql).
Оба новых документа проверяются локальными тестами через GraphQL `validate` по runtime SDL.

| Операция                                                 | Назначение                                            | Переменные                                    |
| -------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| `SuperadminPostsPage` → `superadminPosts`                | Начальная страница и Apollo `fetchMore`               | `input: { first: 4, searchUsername, after? }` |
| `SuperadminPostsLive` → `superadminPostPublished`        | Новые публикации и служебные события                  | `input: { searchUsername }`                   |
| Существующая `SuperadminBanUser` → `superadminBlockUser` | Ban автора после подтверждения в существующем диалоге | Существующие `input: { userId }`, `reason`    |

Используются только подтверждённые поля Post: `postId`, `userId`, `username`, `description`,
`publishedAt`, `images { fileId url order }` и `pageInfo { endCursor hasNextPage }`.
`first=4` соответствует default контракта и бюджету сложности с Apollo `__typename`.
Cursor берётся из ответа сервера без преобразований; `totalCount` у этого API отсутствует.

## Поведение

- Сетка из четырёх карточек на desktop, адаптация до одной колонки. Фотографии, переключение
  изображений, nullable URL/username, пустое описание, UTC-дата, раскрытие длинного описания.
- Поиск применяется по Enter или нажатию значка поиска. Trim, новая subscription и загрузка
  без `after`; предыдущие карточки, cursor, запросы и события сбрасываются. Сервер выполняет
  поиск по username; дополнительная проверка событий сохраняет literal substring semantics.
- `IntersectionObserver` запускает `fetchMore` по одному запросу; есть кнопка Load more.
  При ошибке следующей страницы сохраняются карточки и cursor для явного Retry,
  автоматическая подгрузка приостановлена. Конец определяется по `hasNextPage`.
- Пустой успешный результат отличается от загрузки, nullable/error ответа и разрыва соединения.
  При истёкшей сессии доступна ссылка Sign In.
- HTTP snapshot запускается сразу, независимо от WebSocket. Subscription подключается параллельно;
  после `READY` выполняется дополнительный HTTP snapshot для сверки пропущенных публикаций.
  Если начальный HTTP ещё не завершён, сверка ставится в очередь после него.
  События объединяются со snapshot. Дедупликация по `postId`, сортировка `publishedAt DESC, postId DESC`.
  События во время `fetchMore` также сохраняются. Подгрузка не ограничивает ленту 200 постами;
  буфер событий во время загрузки snapshot ограничен 200 уникальными совпадениями.
- `RESYNC_REQUIRED`, overflow, transport error, timeout и неожиданный complete запускают новую
  subscription и новый snapshot после `READY`. Пока WS недоступен, список и пагинация сохраняются;
  цепочка cursor сбрасывается только при запуске нового snapshot. Старый результат `fetchMore`
  не может восстановить цепочку cursor после начала сверки.
  Один supervisor: максимум 10 последовательных попыток, backoff 1–30 секунд с jitter,
  timeout запуска 15 секунд, сброс бюджета после 30 секунд стабильной работы.
  Auth/validation/forbidden/rate-limit ошибки останавливают автоматические повторы.
  Обрабатываются GraphQL errors как в `next`, так и в error callback.
- Unmount/смена поиска закрывают subscription/socket, останавливают ObservableQuery,
  отменяют HTTP через AbortController, очищают таймеры; запоздалые результаты игнорируются.

## Apollo и transport

Существующий Apollo Client/provider сохранён. Добавлена WS-ветка через `ApolloLink.split`
и `GraphQLWsLink` с библиотекой `graphql-ws` (lockfile: 6.4.3).
Протокол **`graphql-transport-ws`**, не Socket.IO, SSE или legacy `subscriptions-transport-ws`.
Endpoint выводится из существующего `NEXT_PUBLIC_SUPERADMIN_GRAPHQL_URL`:
`https://<gateway>/api/v1/graphql` → `wss://<gateway>/api/v1/graphql`, локальный HTTP → WS.
Это подтверждённое документацией правило, а не подтверждение публичного deployment.

Socket создаётся только при browser subscription. `retryAttempts: 0`, `keepAlive: 0`:
повторами управляет только контроллер ленты. Cookies/Origin передаёт браузер;
`connectionParams`, токены, CSRF и Authorization для WS не добавляются.
Обычные query/mutation сохраняют существующий HTTP transport: POST JSON,
`credentials: include`, `cache: no-store`, in-memory CSRF nonce. HTTP и WS запрещены при SSR.
Provider, login/session и HTTP transport не изменены.

## Ban и FSD

Widget компонует features Posts и Users: карточка передаёт Post, widget использует
подтверждённый `post.userId`, существующий `Icon name="Block"`, `BanUserDialog` и
`useBanSuperadminUser`. Mutation и причины не продублированы. Тип props диалога допускает
минимальную цель `{ userId, username }`; UI/валидация/сценарий Users list не менялись.
Повторное подтверждение и закрытие во время mutation блокируются.
`NOT_FOUND`/`USER_DELETED` показываются в диалоге; `BLOCKED`/`ALREADY_BLOCKED` закрывают его.
После блокировки пост остаётся в административной ленте согласно контракту.

Авторизация, Payments, детали пользователя, Delete/Un-ban не менялись.
Между соседними features нет импортов: их связывает слой widgets.

## Figma

Единственный приложенный кадр `10355:17066` получен одним пакетным export-запросом:
[локальный PNG](design/superadmin-posts/posts-list.png), 1280×720.
После сохранения использовался локальный файл; повторных запросов кадра не было.
В Post API отсутствуют avatar и public profile URL, поэтому вымышленные аватары и ссылки
из макета не подставляются. Вместо относительного времени показана точная дата UTC.

## Ограничения backend / окружения

- SDL и guide подтверждают реализацию subscription, но публичные WSS URL, rollout согласованных
  Gateway/Post builds и браузерная интеграция в guide пока не подтверждены.
- Нужны READY Post username projection после bootstrap/rollout marker, private Post gRPC/Rabbit,
  proxy WS upgrade на точном `/api/v1/graphql` с Cookie/Origin/Sec-WebSocket-Protocol
  и idle timeout ≥60 секунд. Нужны корректные allow-list origin, HTTPS, SameSite/Secure cookies.
- Без работающего subscription/READY HTTP-список и infinite scroll продолжают работать.
  Состояние подключения realtime и кнопка Retry live updates показаны отдельно от состояния данных;
  realtime не имитируется polling или локальными постами.
- Нет replay offline событий: восстановление перечитывает актуальную голову, более старые
  посты доступны через scroll. Realtime rename/edit/delete не предоставлены контрактом;
  rename может запаздывать из-за projection.
- Нет avatar, public profile URL и состояния автора в Post. Ban вызывается по сохранённому
  `userId`; наличие/состояние автора подтверждает существующая mutation своими outcomes.

## Безопасная ручная browser-проверка subscription

1. Согласовать у backend URL Gateway, развёрнутую версию, READY projection, WS proxy и разрешённый
   frontend origin. Указать URL HTTP endpoint в `NEXT_PUBLIC_SUPERADMIN_GRAPHQL_URL`, перезапустить frontend.
2. Войти в суперадминку своей учебной admin session и открыть `/superadmin/posts`.
   В DevTools Network проверить WS на том же `/api/v1/graphql`, subprotocol `graphql-transport-ws`,
   Независимо от WS ожидается HTTP `SuperadminPostsPage` с `first: 4`, без `after`.
   После `READY` ожидается дополнительный HTTP snapshot без `after`.
   Не публиковать cookies/nonce или полный сетевой дамп.
3. Прокрутить список: следующие HTTP операции используют `after` из предыдущего `endCursor`.
   Ввести username своего тестового аккаунта и применить поиск: старая subscription закрывается,
   новая использует этот поиск, snapshot не содержит `after`.
4. В отдельном браузерном профиле открыть обычное приложение под **своим тестовым аккаунтом**.
   Самостоятельно опубликовать один тестовый пост. Суперадминку не перезагружать:
   ожидаются `POST_PUBLISHED` и одна карточка с тем же `postId` и username.
   Поиск другого username не должен показывать этот пост. Очистить поиск и проверить появление.
5. Для проверки восстановления временно отключить сеть, затем вернуть её:
   ожидаются новая subscription, новый `READY`, snapshot без старого `after`, без дубликатов.
   Публикация во время отключения выполняется только вручную владельцем тестового аккаунта.
6. Для проверки открытия Ban нажать значок у своего тестового поста, проверить причины
   и нажать **No** или закрыть диалог. **Yes не нажимать**: реальная блокировка для этой проверки не нужна.

Эти ручные шаги подготовлены, но в рамках задачи не выполнялись. Реальные посты не создавались,
реальные пользователи не блокировались. **Реальных HTTP/WS запросов к Gateway не выполнялось.**

## Локальная проверка

- `pnpm exec vitest run --config vitest.unit.config.ts`: **167/167**, 17 файлов проходят
  (39 проверок UC-1 в пяти новых test-файлах).
  Новые проверки: настоящий Apollo с тестовым link для cursor/fetchMore/search/dedupe/READY/
  buffered events/resync/error/timeout/cleanup; mock transports для HTTP/WS split, cookies,
  CSRF и SSR; локальные UI hooks/IntersectionObserver для scroll-trigger и состояний;
  widget callback-тесты для переиспользования Ban по ID, отмены и outcomes.
- `pnpm build`: production build проходит, `/superadmin/posts` присутствует в выводе маршрутов.
- Scoped ESLint, Stylelint и Prettier, `git diff --check` выполняются для затронутых файлов.
- Mock-ответы/transport используются только в `*.test.ts(x)`. Browser end-to-end проверка
  с развёрнутым Gateway остаётся отдельной приёмкой по шагам выше.

## Изменённые файлы

- `src/app/superadmin/posts/page.tsx` — маршрут.
- `src/widgets/superadmin-sidebar/ui/SuperadminSidebar.tsx` — ссылка Posts list.
- `src/features/superadmin-posts/api/posts-api.ts` — query/subscription.
- `src/features/superadmin-posts/model/{types,posts-feed}.ts` — типы, merge, controller.
- `src/features/superadmin-posts/ui/SuperadminPosts.tsx`, `SuperadminPosts.module.css` — UI.
- `src/widgets/superadmin-posts/ui/SuperadminPostsWidget.tsx` — композиция с Ban.
- `src/features/superadmin-users/ui/BanUserDialog.tsx` — только тип цели диалога.
- `src/shared/api/apollo/{client,subscription-link}.ts` — HTTP/WS split.
- Тесты: `posts-feed.test.ts`, `posts-transport.test.ts`, `SuperadminPosts.test.tsx`, `SuperadminPostsWidget.test.tsx`,
  `src/shared/api/apollo/client.test.ts`.
- `package.json`, `pnpm-lock.yaml` — graphql-ws.
- `docs/design/superadmin-posts/posts-list.png`, этот документ — дизайн и отчёт.

## Исправление зависимости HTTP от WSS

При первоначальной реализации `readHead()` вызывался только из обработчика `READY`,
а общий cleanup при сбое subscription отменял query. Поэтому успешный `RestoreSuperadminSession`
не приводил к `SuperadminPostsPage` при недоступном WSS. Apollo split работал правильно:
только subscription направляется в WS, остальные операции идут в HTTP. Widget подключён
к общему client через feature; сценарий Ban не участвует в запуске списка.

Исправление разделяет жизненные циклы HTTP и WS. `status/error/retryTarget` описывают данные,
`connectionStatus/connectionError` — realtime. Сбой WS не отменяет initial query/fetchMore,
не удаляет карточки и cursor. Retry live updates перезапускает только WS. После `READY`
выполняется сверка головы с буфером событий, включая READY во время первого HTTP.

Production Apollo split проверен с mock fetch и mock graphql-ws: `SuperadminPostsPage`
реально доходит до HTTP link как POST, даже при синхронной ошибке WS; ответ отображается;
при отсутствии READY/таймауте WS список и cursor сохраняются, `fetchMore` работает.
Mock-only проверки не являются доказательством доступности реального Gateway.

Проверка Network/Console в живом браузере не состоялась: два вызова браузерного инструмента
завершились до подключения с `missing field sandboxPolicy`. Поэтому отправка HTTP запроса
в реальном браузере и статус WS handshake **не подтверждены**; нельзя утверждать ни 101,
ни 403, ни конкретную сетевую ошибку. Реальных Gateway HTTP/WS запросов в ходе исправления,
публикаций и mutations не выполнялось.
