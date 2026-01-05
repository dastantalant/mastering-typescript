import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {ConnectionData} from "../../models/dictionary/connection-data.model.ts";
import {Cacheable, Fluent, type FluentService} from "../../utils/Fluent.ts";

const commonUrl = ref('/dictionary/connection-data');
const ENTITY_NAME = 'Данные подключения (Saima)';

@Fluent()
class ConnectionDataService {

    save(connectionData: ConnectionData) {
        return fetchWrapper.put(commonUrl.value , connectionData).then((data) => data);
    }

    delete(mobileVersionId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + mobileVersionId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    @Cacheable(5 * 60 * 1000)
    getAllConnectionDataTypes(): Promise<ConnectionData> {
        return fetchWrapper.get(`/dictionary/connection-data/all`, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}
export default ConnectionDataService as unknown as FluentService<ConnectionDataService, typeof ConnectionDataService>;
