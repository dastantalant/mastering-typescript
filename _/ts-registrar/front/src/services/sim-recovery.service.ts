import {fetchWrapper} from '../helpers';
import {ref} from 'vue';
import type {SimRecovery, SimRecoveryFilter} from "../models/sim-recovery.model.ts";

const commonUrl = ref('/sim-recovery');

export default class SimRecoveryService {
    findAll(simRecoveryFilter: SimRecoveryFilter) {
        let params = "?page=" + simRecoveryFilter.page + "&size=" + simRecoveryFilter.size + getParams(simRecoveryFilter);

        return fetchWrapper.get(commonUrl.value + params, null).then((d) => d);
    }

    findByIdForEdit(id: number) {
        return fetchWrapper.get(commonUrl.value + "/edit/" + id, null).then((d) => d);
    }

    save(simRecovery: SimRecovery) {
        return fetchWrapper.post(commonUrl.value + "/save", simRecovery).then((d) => d);
    }

    findHistoryByOriginalId(originalId: number) {
        return fetchWrapper.get(commonUrl.value + "/history/" + originalId, null).then((d) => d);
    }

}

function getParams(simRecoveryFilter: SimRecoveryFilter) {
    let params = "";
    if (!simRecoveryFilter)
        return "";
    if (simRecoveryFilter.msisdn)
        params += "&msisdn=" + simRecoveryFilter.msisdn;
    if (simRecoveryFilter.webRegistrar)
        params += "&webRegistrar=" + simRecoveryFilter.webRegistrar;
    if (simRecoveryFilter.registrarMsisdn)
        params += "&registrarMsisdn=" + simRecoveryFilter.registrarMsisdn;
    if (simRecoveryFilter.startDate)
        params += "&startDate=" + simRecoveryFilter.startDate;
    if (simRecoveryFilter.endDate)
        params += "&endDate=" + simRecoveryFilter.endDate;
    return params
}
