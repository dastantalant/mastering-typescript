import { fetchWrapper } from '../helpers';
import { ref } from 'vue';

const commonUrl = ref('/');

export default class MenuService {
    getMenu() {
        return fetchWrapper.get(commonUrl.value + 'menu', null).then((d) => d);
    }
}
