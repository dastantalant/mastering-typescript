import { fetchWrapper } from '../helpers';
import { ref } from 'vue';

const commonUrl = ref('/auth');

export default class CurrentUserService {

    getCurrent() {
        return fetchWrapper.get(commonUrl.value + "/current", null).then((d) => d);
    }

}