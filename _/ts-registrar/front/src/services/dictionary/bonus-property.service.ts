import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {BonusProperty} from "../../models/dictionary/bonus-property.model.ts";

const commonUrl = ref('/dictionary/bonus-properties');
const ENTITY_NAME = 'Константы бонусов';

export default class BonusPropertyService {

    save(bonusProperty: BonusProperty) {
        return fetchWrapper.put(commonUrl.value , bonusProperty).then((data) => data);
    }

    refreshCache() {
        return fetchWrapper.get(commonUrl.value + "/refresh-cache" , null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}