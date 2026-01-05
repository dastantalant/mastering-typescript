import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {Role} from "../../models/dictionary/role.model.ts";

const commonUrl = ref('/dictionary/roles');
const ENTITY_NAME = 'Роли';
export default class RoleService {

    save(role: Role) {
        return fetchWrapper.put(commonUrl.value , role).then((data) => data);
    }

    delete(roleId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + roleId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}