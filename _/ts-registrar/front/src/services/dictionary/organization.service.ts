import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type { Organization } from '../../models/dictionary/organization.model.ts'

const commonUrl = ref('/dictionary/organizations');
const ENTITY_NAME = 'Организации';

export default class OrganizationService {

    save(organization: Organization) {
        return fetchWrapper.put(commonUrl.value , organization).then((data) => data);
    }

    delete(organizationId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + organizationId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findProviders() {
        return fetchWrapper.get(commonUrl.value + "/providers", null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}
