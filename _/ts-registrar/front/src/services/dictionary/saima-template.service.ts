import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type { SaimaTemplate } from '../../models/dictionary/saima-template.model.ts';

const commonUrl = ref('/dictionary/saima-templates');
const ENTITY_NAME = 'Шаблоны ответов для агентов саймы';
export default class SaimaTemplateService {

    save(saimaTemplate: SaimaTemplate) {
        return fetchWrapper.put(commonUrl.value, saimaTemplate).then((data) => data);
    }

    delete(templateId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + templateId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}