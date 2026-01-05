import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {RegistrarRole} from "../../models/dictionary/registrar-role.model.ts";

const commonUrl = ref('/dictionary/registrar-roles');
const ENTITY_NAME = 'Роли Регистраторов';
export default class RegistrarRoleService {

    save(registrarRole: RegistrarRole) {
        return fetchWrapper.put(commonUrl.value , registrarRole).then((data) => data);
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