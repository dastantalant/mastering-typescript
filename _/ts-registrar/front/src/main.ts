import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.ts';
import { createPinia } from 'pinia';
import { useAuthStore } from './stores';
import AuthStorePlugin from './plugins/authStore';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import Tooltip from 'primevue/tooltip';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';


const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);


const savedTheme = localStorage.getItem("darkMode");
const media = window.matchMedia('(prefers-color-scheme: dark)')
if (savedTheme != undefined) {
    if (savedTheme === "true") {
        document.documentElement.classList.add('app-dark');
    }
}else if (media.matches) {
    document.documentElement.classList.add('app-dark');
}
app.use(createPinia());
app.use(PrimeVue, {
    locale: {
        firstDayOfWeek: 1, // Monday
        dayNames: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
        dayNamesShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        dayNamesMin: ["В", "П", "В", "С", "Ч", "П", "С"],
        monthNames: [
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        ],
        monthNamesShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        today: "Сегодня",
        clear: "Очистить"
    },
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.directive('tooltip', Tooltip);

app.use(ToastService);
app.use(ConfirmationService);
app.use(pinia);
app.use(AuthStorePlugin, { pinia });
app.use(router);


try {
    const authStore = useAuthStore();
     authStore.refreshToken();
} catch {
    // catch error to start app on success or failure
}

app.mount('#app');
