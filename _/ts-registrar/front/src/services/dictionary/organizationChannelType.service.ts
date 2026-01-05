import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {OrganizationChannelType} from "../../models/dictionary/organizationChannelType.model.ts";

const commonUrl = ref('/dictionary/organization-channel-types');
const ENTITY_NAME = 'Принадлежность организации к каналу';
export default class OrganizationChannelTypeService {

    save(organizationChannelType: OrganizationChannelType) {
        return fetchWrapper.put(commonUrl.value , organizationChannelType).then((data) => data);
    }

    delete(regionId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + regionId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findByOrganizationId(organizationId: number) {
        return fetchWrapper.get(commonUrl.value + "/by-organisation/" + organizationId, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}