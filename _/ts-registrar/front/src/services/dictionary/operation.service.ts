import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';

const commonUrl = ref('/dictionary/operations');

export default class OperationService {

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    getConfigItems(operationConfigId: number){
        return fetchWrapper.get(commonUrl.value + "/config-items/" + operationConfigId, null).then((d) => d);
    }

}