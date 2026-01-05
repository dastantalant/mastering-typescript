import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
const commonUrl = ref('/dictionary/country');

export default class CountryService {

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }
}