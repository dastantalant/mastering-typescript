import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {User} from "../../models/dictionary/user.model.ts";

const commonUrl = ref('/dictionary/users');
const ENTITY_NAME = 'Пользователи';
export default class UserService {

    save(user: User) {
        return fetchWrapper.put(commonUrl.value , user).then((data) => data);
    }

    delete(userId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + userId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}