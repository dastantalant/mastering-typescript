import { fetchWrapper } from '../helpers';
import { ref } from 'vue';
import type {
    PersonificationUploadModel, RegistrarFiosResponse,
    SubscriberFilter,
    UpdatePersonificationModel
} from '../models/subscriber.model';

const commonUrl = ref('/personification');

export default class SubscriberService {
    findAll(filter: SubscriberFilter) {

        const params = new URLSearchParams({
            page: String(filter.page || 0),
            size: String(filter.size || 10)
        });

        return fetchWrapper.post(`${commonUrl.value}?${params}`, filter).then((d) => {
            return {
                data: d.content,
                totalRecords: d.totalElements
            };
        });    }

    exportPersonification(exportType: 'PDF' | 'EXCEL' | 'CSV', filter: SubscriberFilter) {
        return fetchWrapper.postFileDownload(
            commonUrl.value + '/export?exportType=' + exportType,
            filter
        ).then((d) => d);
    }

    getUploadsWithContent(requestId: number): Promise<PersonificationUploadModel[]> {
        return fetchWrapper.get(`${commonUrl.value}/${requestId}/uploads`, null)
            .then(response => response as PersonificationUploadModel[]);
    }


    findById(id: number) {
        return fetchWrapper.get(`${commonUrl.value}/get-by-id/${id}`, null).then((d) => d);
    }

    updatePersonification(id: number, personification: UpdatePersonificationModel) {
        return fetchWrapper.put(`${commonUrl.value}/${id}`, personification).then((d) => d);
    }

    findHistoryById(id: number) {
        return fetchWrapper.get(commonUrl.value + "/history/" + id, null).then((d) => d);
    }

    findRegistrarAndSupervisorFios(startDate: string, endDate: string):Promise<RegistrarFiosResponse> {
        const params = new URLSearchParams({
            startDate: startDate,
            endDate: endDate
        });
        return fetchWrapper.get(`${commonUrl.value}/registrars-in-pers?${params}`, null)
            .then((d) => d as RegistrarFiosResponse);
    }
}

