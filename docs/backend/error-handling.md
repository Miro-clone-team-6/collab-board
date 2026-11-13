# Обработка ошибок

Глобальный `HttpExceptionFilter` зарегистрирован через `APP_FILTER`.

| Ошибка | Ответ клиенту |
| --- | --- |
| HTTP 4xx Nest | Сохраняются статус и тело |
| Зарегистрированная `ApplicationError` с 4xx | Публичные `statusCode`, `error` (код), `message` |
| Незарегистрированная ошибка приложения | Безопасный 500 |
| HTTP 5xx или неожиданное исключение | Статус и стандартное сообщение без внутренних деталей |

5xx и неожиданные исключения логируются на сервере. Stack trace, SQL и `cause`
не передаются клиенту. Тела 4xx публичны: внутренние данные туда не помещаются.
Ошибки запуска находятся вне HTTP-фильтра. Штатный health 503 возвращает свой DTO.
Используется стандартный Logger Nest; отдельный сбор логов не настроен.

Ошибка приложения лежит рядом со своим модулем, наследует `ApplicationError`
и имеет стабильный `code`. Пример добавления:

```ts
export class UserNotFoundError extends ApplicationError {
  readonly code = "USER_NOT_FOUND";

  constructor() {
    super("User not found");
  }
}
```

В `src/errors/application-error-statuses.ts` добавляется
`["USER_NOT_FOUND", HttpStatus.NOT_FOUND]`. Сценарий выбрасывает
`new UserNotFoundError()`. Сообщение публично, техническая причина передаётся
через `cause`. Сейчас таблица пуста: ошибок бизнес-модулей ещё нет.
