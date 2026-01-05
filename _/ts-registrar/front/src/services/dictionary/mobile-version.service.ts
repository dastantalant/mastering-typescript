import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {MobileVersion} from "../../models/dictionary/mobile-version.model.ts";

const commonUrl = ref('/dictionary/mobile-version');
const ENTITY_NAME = 'Версии мобильного приложения';

export default class MobileVersionService {

    save(mobileVersion: MobileVersion) {
        return fetchWrapper.put(commonUrl.value , mobileVersion).then((data) => data);
    }

    delete(mobileVersionId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + mobileVersionId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}