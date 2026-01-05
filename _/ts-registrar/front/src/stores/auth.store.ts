import {defineStore} from 'pinia';
import router from '../router';

// --- НАЧАЛО МОК-РЕАЛИЗАЦИИ ---

/**
 * Вспомогательная функция для создания фейкового JWT-токена.
 * Она создает строку, похожую на настоящий токен, с реальным временем истечения.
 * @param minutesToExpire - Через сколько минут токен должен "протухнуть".
 */
const createFakeJWT = (minutesToExpire: number): string => {
    const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // Фиктивный заголовок

    // Создаем полезную нагрузку с реальным временем истечения (exp)
    const payload = {
        sub: '1234567890',
        name: 'John Doe',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor((Date.now() + minutesToExpire * 60 * 1000) / 1000),
    };

    // Кодируем полезную нагрузку в Base64
    const encodedPayload = btoa(JSON.stringify(payload));

    const signature = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'; // Фиктивная подпись

    return `${header}.${encodedPayload}.${signature}`;
};

/**
 * Симуляция нашего fetchWrapper.
 * Вместо реальных HTTP-запросов он возвращает Promise с мок-данными.
 */
const mockFetchWrapper = {
    post: (url: string, body: object): Promise<any> => {
        return new Promise(resolve => {
            setTimeout(() => {
                // Если это логин
                if (url.includes('/access')) {
                    const user = {
                        // @ts-ignore
                        username: body.username,
                        accessToken: createFakeJWT(1), // Токен "протухнет" через 1 минуту для теста
                        refreshToken: 'fake-refresh-token-' + Math.random(),
                    };
                    resolve(user);
                }
                // Если это обновление токена
                if (url.includes('/refresh-token')) {
                    const user = {
                        username: 'refreshedUser',
                        accessToken: createFakeJWT(1), // Выдаем новый токен
                        refreshToken: 'new-fake-refresh-token-' + Math.random(),
                    };
                    resolve(user);
                }
            }, 500); // Задержка в 500 мс для имитации сети
        });
    },
    delete: (url: string, body: object): Promise<void> => {
        return Promise.resolve(); // Просто успешно завершаем
    },
};

// --- КОНЕЦ МОК-РЕАЛИЗАЦИИ ---


let ifRefreshing = false;

export const useAuthStore = defineStore("auth", {
    state: () => ({
        // При запуске пытаемся достать пользователя из localStorage
        user: JSON.parse(localStorage.getItem('user')),
        refreshTokenTimeout: null
    }),
    actions: {
        async login(username: string, password: string) {
            // Используем наш моковый fetchWrapper
            this.user = await mockFetchWrapper.post(`/auth/access`, {
                username,
                password
            });
            localStorage.setItem('user', JSON.stringify(this.user));
            this.startRefreshTokenTimer();
            // Перенаправляем на главную страницу после успешного мок-логина
            await router.push('/');
        },
        logout() {
            // Моковый вызов, который ничего не делает
            mockFetchWrapper.delete(`/auth/revoke-token`, {});
            this.stopRefreshTokenTimer();
            this.user = null;
            // Очищаем localStorage
            localStorage.removeItem('user');
            router.push('/login');
        },
        async refreshToken() {
            if (ifRefreshing) return;

            ifRefreshing = true;

            const refreshToken = this.user.refreshToken;
            // Используем наш моковый fetchWrapper
            this.user = await mockFetchWrapper.post(`/auth/refresh-token`, { refreshToken });

            localStorage.setItem('user', JSON.stringify(this.user));
            this.startRefreshTokenTimer();
            ifRefreshing = false;
        },
        startRefreshTokenTimer() {
            // Эта логика остается без изменений, она будет работать с нашим фейковым JWT
            if (!this.user?.accessToken) return;


            const jwtBase64 = this.user.accessToken.split('.')[1];
            const jwtToken = JSON.parse(atob(jwtBase64));

            const expires = new Date(jwtToken.exp * 1000);
            // Обновляем за 10 секунд до истечения
            const timeout = expires.getTime() - Date.now() - 10000;


            // Если таймаут отрицательный (токен уже истек), обновляем немедленно
            if (timeout < 0) {
                this.refreshToken();
                return;
            }

            // @ts-ignore
            this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), timeout);
        },
        stopRefreshTokenTimer() {
            // @ts-ignore
            clearTimeout(this.refreshTokenTimeout);
        }
    }
});