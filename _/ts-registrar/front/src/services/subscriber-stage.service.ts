import {fetchWrapper} from '../helpers';
import {ref} from 'vue';
import type {SubscriberStageFilter, SubscriberStage} from "../models/subscriber-stage.model.ts";

const commonUrl = ref('/identification/subscriber-stage');

export default class SubscriberStageService {


    findAll(stageFilter: SubscriberStageFilter) {
        let params = "?page=" + stageFilter.page + "&size=" + stageFilter.size + getParams(stageFilter);

        return fetchWrapper.get(commonUrl.value + params, null).then((d) => d);
    }

    getExcel(stageFilter: SubscriberStageFilter) {
        let params = "?";
        params += getParams(stageFilter);
        return fetchWrapper.getFile(commonUrl.value + "/exel" + params, null).then((d) => d);
    }

    findById(id: number) {
        return fetchWrapper.get(commonUrl.value + "/by-id/" + id, null).then((d) => d);
    }

    findByIdForEdit(id: number) {
        return fetchWrapper.get(commonUrl.value + "/by-id-for-edit/" + id, null).then((d) => d);
    }

    save(subscriberStage: SubscriberStage) {
        return fetchWrapper.post(commonUrl.value, subscriberStage).then((d) => d);
    }

    findHistoryByOriginalId(originalId: number) {
        return fetchWrapper.get(commonUrl.value + "/history/" + originalId, null).then((d) => d);
    }

    syncPassportData(id : number) {
        return fetchWrapper.post(commonUrl.value + "/sync-passport-data/"+ id, null).then((d) => d);
    }
}

function getParams(stageFilter: SubscriberStageFilter) {
    let params = "";
    if (!stageFilter)
        return "";
    if (stageFilter.startDate)
        params += "&startDate=" + stageFilter.startDate;
    if (stageFilter.endDate)
        params += "&endDate=" + stageFilter.endDate;
    if (stageFilter.msisdn)
        params += "&msisdn=" + stageFilter.msisdn;
    if (stageFilter.firstName)
        params += "&firstName=" + stageFilter.firstName;
    if (stageFilter.lastName)
        params += "&lastName=" + stageFilter.lastName;
    if (stageFilter.state)
        params += "&state=" + stageFilter.state;
    if (stageFilter.editedBy)
        params += "&editedBy=" + stageFilter.editedBy;
    if (stageFilter.stage)
        params += "&stage=" + stageFilter.stage;
    return params
}