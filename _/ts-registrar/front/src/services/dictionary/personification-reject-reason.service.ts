import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {PersonificationRejectReason} from "../../models/dictionary/personification-reject-reason.model.ts";

const commonUrl = ref('/dictionary/simple-personification-reject-reasons');
const ENTITY_NAME = 'Причины отказа для Мой О! персонификация';

export default class PersonificationRejectReasonService {

    save(personificationRejectReason: PersonificationRejectReason) {
        return fetchWrapper.put(commonUrl.value , personificationRejectReason).then((data) => data);
    }

    delete(regionId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + regionId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}