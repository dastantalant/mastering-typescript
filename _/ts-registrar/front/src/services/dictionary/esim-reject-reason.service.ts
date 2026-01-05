import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {EsimRejectReason} from "../../models/dictionary/esim-reject-reason.model.ts";

const commonUrl = ref('/dictionary/esim-reject-reasons');
const ENTITY_NAME = 'Причины отказа для e-sim';

export default class EsimRejectReasonService {

    save(esimRejectReason: EsimRejectReason) {
        return fetchWrapper.put(commonUrl.value , esimRejectReason).then((data) => data);
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