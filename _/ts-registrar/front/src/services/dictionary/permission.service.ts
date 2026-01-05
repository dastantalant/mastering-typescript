import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';

const commonUrl = ref('/dictionary/permissions');

export default class PermissionService {

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }
}