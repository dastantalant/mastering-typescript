import {fetchWrapper} from '../../helpers';
import {ref} from 'vue';
import type {SaimaTemplateCategory} from '../../models/dictionary/saima-template-category.model.ts';
import {Fluent, type FluentService} from "../../utils/Fluent.ts";

const commonUrl = ref('/dictionary/saima-template-categories');
const ENTITY_NAME = 'Классификация шаблонов для агентов саймы';
@Fluent()
class SaimaTemplateCategoryService {

    save(saimaTemplateCategory: SaimaTemplateCategory) {
        return fetchWrapper.put(commonUrl.value, saimaTemplateCategory).then((data) => data);
    }

    delete(categoryId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + categoryId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findAllExtended(): Promise<SaimaTemplateCategory[]> {
        return fetchWrapper.get(`/dictionary/saima-template-categories/extended/all`, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}
export default SaimaTemplateCategoryService as unknown as FluentService<SaimaTemplateCategoryService, typeof SaimaTemplateCategoryService>;
