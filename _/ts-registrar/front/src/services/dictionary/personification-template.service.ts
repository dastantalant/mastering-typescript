import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type { PersonificationTemplate } from '../../models/dictionary/personification-template.model.ts';

const commonUrl = ref('/dictionary/personification-templates');
const ENTITY_NAME = 'Шаблоны ответов для персонификации';

export default class PersonificationTemplateService {

    save(personificationTemplate: PersonificationTemplate) {
        return fetchWrapper.put(commonUrl.value, personificationTemplate).then((data) => data);
    }

    delete(templateId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + templateId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findAllByCategoryId(params?: { categoryId?: number; msisdn?: string }) {
        const query = new URLSearchParams();

        if (params?.categoryId != null) {
            query.append('categoryId', params.categoryId.toString());
        }

        if (params?.msisdn) {
            query.append('msisdn', params.msisdn);
        }

        return fetchWrapper.get(`${commonUrl.value}/by-category-id?${query.toString()}`, null);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }

}