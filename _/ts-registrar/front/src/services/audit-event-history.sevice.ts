import { fetchWrapper } from '../helpers';
import { ref } from 'vue';

const commonUrl = ref('/audit-event-history');

export default class AuditEventHistoryService {

    getHistory(tableName: string, rowId: number) {
        return fetchWrapper.get(commonUrl.value + "/" + tableName + "/" + rowId, null).then((d) => d);
    }

}