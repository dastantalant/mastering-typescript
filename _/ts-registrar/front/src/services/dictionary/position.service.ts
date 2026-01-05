import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';

const commonUrl = ref('/dictionary/positions');

export default class PositionService {

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }
}