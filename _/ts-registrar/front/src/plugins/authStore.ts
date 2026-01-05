import {useAuthStore} from '../stores';
import type {Plugin} from 'vue';
import type {App} from 'vue';
import type {Pinia} from 'pinia';

interface AuthStorePluginOptions {
    pinia: Pinia;
}

const authStorePlugin: Plugin = {
    install(app: App, options: AuthStorePluginOptions) {
        if (!options || !options.pinia) {
            throw new Error('Pinia instance is required for authStorePlugin');
        }

        const store2 = useAuthStore(options.pinia);
        const userData = localStorage.getItem('user');

        store2.user = userData ? JSON.parse(userData) : null;
        app.config.globalProperties.$store = store2;


    }
};

export default authStorePlugin;