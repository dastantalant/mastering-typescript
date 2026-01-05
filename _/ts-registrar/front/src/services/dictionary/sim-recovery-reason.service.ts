import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {SimRecoveryRejectReason} from "../../models/dictionary/sim-recovery-reject-reason.model.ts";

const commonUrl = ref('/dictionary/sim-recovery-reject-reasons');
const ENTITY_NAME = 'Причины отказа для восстановление сим-карты';

export default class SimRecoveryRejectReasonService {

    save(simRecoveryRejectReason: SimRecoveryRejectReason) {
        return fetchWrapper.put(commonUrl.value , simRecoveryRejectReason).then((data) => data);
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