import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type { PersonificationTemplateCategory } from '../../models/dictionary/personification-template-category.model.ts';

const commonUrl = ref('/dictionary/personification-template-categories');
const ENTITY_NAME = 'Классификация шаблонов для персонификации';

export default class PersonificationTemplateCategoryService {

    save(personificationTemplateCategory: PersonificationTemplateCategory) {
        return fetchWrapper.put(commonUrl.value, personificationTemplateCategory).then((data) => data);
    }

    delete(categoryId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + categoryId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }
    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}