import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type { OperationConfig } from '../../models/dictionary/operation-config.model.ts';

const commonUrl = ref('/dictionary/operation-configs');
const ENTITY_NAME = 'Конфигурации вознаграждений';

export default class OperationConfigService {

    save(operationConfig: OperationConfig) {
        return fetchWrapper.put(commonUrl.value, operationConfig).then((data) => data);
    }

    delete(operationConfigId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + operationConfigId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    uploadRewards(configId: number, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        return fetchWrapper.postFile(commonUrl.value + "/rewards/upload/" + configId, formData).then((data) => data);
    }
    getHistory(){
        return fetchWrapper.get(commonUrl.value + "/history", null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}