import {fetchWrapper} from '../helpers';
import {ref} from 'vue';
import type {EducationDetailModel, EducationFilter} from "../models/education.model.ts";

const commonUrl = ref('/education');

export default class EducationService {
    findAll(educationFilter: EducationFilter) {
        let params = "?page=" + educationFilter.page + "&size=" + educationFilter.size + getParams(educationFilter);

        return fetchWrapper.get(commonUrl.value + params, null).then((d) => d);
    }

    findByIdForEdit(id: number) {
        return fetchWrapper.get(commonUrl.value + "/edit/" + id, null).then((d) => d);
    }

    save(educationDetail: EducationDetailModel) {
        return fetchWrapper.post(commonUrl.value + "/save", educationDetail).then((d) => d);

    }

    findAllFilesById(ppRequestId: number) {
        return fetchWrapper.get(commonUrl.value + "/files/" + ppRequestId, null).then((d) => d);

    }

    findHistoryByOriginalId(originalId: number) {
        return fetchWrapper.get(commonUrl.value + "/history/" + originalId, null).then((d) => d);
    }

    syncPassportData(id : number) {
        return fetchWrapper.post(commonUrl.value + "/sync-passport-data/"+ id, null).then((d) => d);
    }

    getExcel(educationFilter: EducationFilter) {
        let params = "?";
        params += getParams(educationFilter);
        return fetchWrapper.getFile(commonUrl.value + "/exel" + params, null).then((d) => d);
    }

}

function getParams(educationFilter: EducationFilter) {
    let params = "";
    if (!educationFilter)
        return "";
    if (educationFilter.ban)
        params += "&ban=" + educationFilter.ban;
    if (educationFilter.msisdn)
        params += "&msisdn=" + educationFilter.msisdn;
    if (educationFilter.state)
        params += "&state=" + educationFilter.state;
    if (educationFilter.type)
        params += "&type=" + educationFilter.type;
    if (educationFilter.webRegistrar)
        params += "&webRegistrar=" + educationFilter.webRegistrar;
    if (educationFilter.startDate)
        params += "&startDate=" + educationFilter.startDate;
    if (educationFilter.endDate)
        params += "&endDate=" + educationFilter.endDate;
    if (educationFilter.byId)
        params += "&byId=" + educationFilter.byId;
    return params
}
