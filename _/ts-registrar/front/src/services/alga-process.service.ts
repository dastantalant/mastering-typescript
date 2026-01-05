import {fetchWrapper} from '../helpers';
import {ref} from 'vue';
import type {AlgaProcessFilter} from "../models/alga-process.model.ts";

const commonUrl = ref('/alga-process');

export default class AlgaProcessService {


    findAll(algaProcessFilter: AlgaProcessFilter) {
        let params = "?page=" + algaProcessFilter.page + "&size=" + algaProcessFilter.size + getParams(algaProcessFilter);

        return fetchWrapper.get(commonUrl.value + params, null).then((d) => d);
    }


    getExcel(algaProcessFilter: AlgaProcessFilter) {
        let params = "?";
        params += getParams(algaProcessFilter);
        return fetchWrapper.getFile(commonUrl.value + "/exel" + params, null).then((d) => d);
    }

    async getHistoryById(processId?: number | null) {
        return fetchWrapper.get(commonUrl.value + "/flow-history?id=" + processId, null).then((d) => d);
    }
}

function getParams(algaProcessFilter: AlgaProcessFilter) {
    let params = "";
    if (!algaProcessFilter)
        return "";
    if (algaProcessFilter.status)
        params += "&status=" + algaProcessFilter.status;
    if (algaProcessFilter.type)
        params += "&type=" + algaProcessFilter.type;
    if (algaProcessFilter.organizationId)
        params += "&organizationId=" + algaProcessFilter.organizationId;
    if (algaProcessFilter.startDate)
        params += "&startDate=" + algaProcessFilter.startDate;
    if (algaProcessFilter.endDate)
        params += "&endDate=" + algaProcessFilter.endDate;
    if (algaProcessFilter.prMsisdn)
        params += "&prMsisdn=" + algaProcessFilter.prMsisdn;
    if (algaProcessFilter.chanelType)
        params += "&chanelType=" + algaProcessFilter.chanelType;
    if (algaProcessFilter.regionId)
        params += "&regionId=" + algaProcessFilter.regionId;
    if (algaProcessFilter.msisdn)
        params += "&msisdn=" + algaProcessFilter.msisdn;
    if (algaProcessFilter.fullName)
        params += "&fullName=" + algaProcessFilter.fullName;
    return params
}