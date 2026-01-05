import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {VerificationRejectReason} from "../../models/dictionary/verification-reject-reason.model.ts";

const commonUrl = ref('/dictionary/verification-reject-reasons');
const ENTITY_NAME = 'Причины отказа для верификации';

export default class VerificationRejectReasonService {

    save(verificationRejectReason: VerificationRejectReason) {
        return fetchWrapper.put(commonUrl.value , verificationRejectReason).then((data) => data);
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