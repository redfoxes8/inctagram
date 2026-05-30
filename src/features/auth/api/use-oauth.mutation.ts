import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation" // для редиректа
// Импортируем настроенный экземпляр API клиента (для типизированных запросов)
import { client } from "@/shared/api/client"

// Импортируем типы и константы, необходимые для OAuth
// localStorageKeys - ключи для хранения данных в localStorage
// OAuthLoginPayload - тип данных, которые отправляем на бэкенд
// OAuthResponse - тип данных, которые получаем с бэкенда
// OAuthProvider - тип для провайдера ("google" | "github")
import { localStorageKeys, OAuthLoginPayload, OAuthResponse, OAuthProvider } from "./auth.type"

// Описываем структуру ошибки, которую может вернуть бэкенд
type ApiError = {
  statusCode: number // HTTP статус код (400, 401, 409 и т.д.)
  message: string // Текст ошибки
  errorsMessages?: {
    // Детализированные ошибки по полям (опционально)
    message: string
    field: string
  }[]
}

// Создаем специальный класс ошибки для ситуации
export class EmailExistsWithoutProviderError extends Error {
  public email: string // Email, который уже существует в системе
  public provider: OAuthProvider // Провайдер, через который пытаются войти

  constructor(email: string, provider: OAuthProvider) {
    // Вызываем конструктор родительского класса Error с сообщением
    super(`User with email ${email} already exists but ${provider} account is not linked`)

    // Устанавливаем имя ошибки
    this.name = "EmailExistsWithoutProviderError"

    // Сохраняем email и провайдера в свойствах экземпляра
    this.email = email
    this.provider = provider
  }
}

// Хук используется для входа/регистрации через Google или GitHub
export const useOAuthMutation = () => {
  // Получаем экземпляр QueryClient для управления кэшем React Query
  const queryClient = useQueryClient()
  // Получаем роутер для программной навигации (редирект на /profile)
  const router = useRouter()

  // OAuthResponse - что возвращает бэкенд, Error - тип ошибки, OAuthLoginPayload - что передаем
  return useMutation<OAuthResponse, Error, OAuthLoginPayload>({
    // ФУНКЦИЯ ОТПРАВКИ ЗАПРОСА
    mutationFn: async (payload: OAuthLoginPayload) => {
      // Деструктурируем payload, чтобы получить provider и code отдельно
      const { provider, code } = payload
      // Отправляем POST запрос на бэкенд, URL формируется из переменной окружения NEXT_PUBLIC_BASE_URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/oauth`, {
        method: "POST", // HTTP метод
        headers: {
          "Content-Type": "application/json", // Отправляем JSON
        },
        body: JSON.stringify({
          // Тело запроса в JSON
          provider, // "google" или "github"
          code, // Временный код от провайдера
        }),
      })

      // ОБРАБОТКА ОШИБОК ОТ БЭКЕНДА

      // Если статус ответа не 2xx (не OK)
      if (!response.ok) {
        // Пытаемся распарсить тело ошибки как JSON
        // Если не получается - подставляем пустой объект
        const errorData = await response.json().catch(() => ({}))

        // Статус 409 - Означает, что email уже существует, но провайдер не привязан
        if (response.status === 409) {
          // Извлекаем email из сообщения ошибки
          const emailMatch = errorData.message?.match(/email:?\s*([^\s,]+@[^\s,]+)/i)
          // Если нашли email - берем его, иначе пустая строка
          const email = emailMatch ? emailMatch[1] : ""

          // Выбрасываем ошибку, фронтенд перехватит её и покажет форму для привязки провайдера
          throw new EmailExistsWithoutProviderError(email, provider)
        }

        // ОБРАБОТКА ОСТАЛЬНЫХ ОШИБОК (400, 401, 500 и т.д.)
        const errorMessage =
          errorData.errorsMessages?.[0]?.message || // Ошибка по конкретному полю
          errorData.message || // Общее сообщение об ошибке
          `${provider} authentication failed` // Дефолтное сообщение

        // Выбрасываем обычную ошибку
        throw new Error(errorMessage)
      }

      // УСПЕШНЫЙ ОТВЕТ ОТ БЭКЕНДА, если response.ok === true, парсим JSON ответ
      const data = await response.json()

      // Возвращаем данные, типизированные как OAuthResponse - accessToken, isNewUser?, email?, username?
      return data as OAuthResponse
    },

    // onSuccess - КОЛБЭК - data - то, что вернул mutationFn, variables - исходные переменные (provider, code)
    onSuccess: async (data, variables) => {
      // СОХРАНЕНИЕ ТОКЕНА
      // Бэкенд вернул accessToken, сохраняем его в localStorage, использ. для авторизации последующих запросов
      if (data.accessToken) {
        localStorage.setItem(localStorageKeys.accessToken, data.accessToken)
      }

      // ИНВАЛИДАЦИЯ КЭША REACT QUERY - обновить состояние авторизации во всем приложении
      await queryClient.invalidateQueries()

      // ЛОГИРОВАНИЕ НОВОГО ПОЛЬЗОВАТЕЛЯ бэкенд вернул флаг isNewUser === true, значит пользователь
      // только что зарегистрировался через OAuth (ему сгенерирован username)
      if (data.isNewUser) {
        // Выводим в консоль информацию о новом пользователе
        console.log(`New user registered via ${variables.provider}: ${data.email} (username: ${data.username})`)
      }

      // РЕДИРЕКТ НА СТРАНИЦУ ПРОФИЛЯ ПОСЛЕ УСПЕШНОГО ВХОДА
      router.push("/profile")
    },

    // onError - КОЛБЭК ПРИ ОШИБКЕ- вызывается, если mutationFn выбросил ошибку
    onError: (error) => {
      // Логируем ошибку для отладки
      console.error("OAuth authentication error:", error.message)
    },
  })
}
