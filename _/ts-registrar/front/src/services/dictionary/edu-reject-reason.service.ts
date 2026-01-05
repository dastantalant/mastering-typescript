import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type { EduRejectReason } from '../../models/dictionary/edu-reject-reason.model.ts'

const commonUrl = ref('/dictionary/edu-reject-reasons');
const ENTITY_NAME = 'Причины отказа для заявок на спец. ТП';

export default class EduRejectReasonService {

    save(eduRejectReason: EduRejectReason) {
        return fetchWrapper.put(commonUrl.value , eduRejectReason).then((data) => data);
    }

    delete(eduRejectReasonId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + eduRejectReasonId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findAllPersonalised(lang: string) {
        return fetchWrapper.get(commonUrl.value + "/by-lang/" + lang, null).then((d) => d);
    }

    findRequestTypes() {
        return fetchWrapper.get(commonUrl.value + "/request-types", null).then((d) => d);
    }
    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}