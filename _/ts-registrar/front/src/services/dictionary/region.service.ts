import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {Region} from "../../models/dictionary/region.model.ts";

const commonUrl = ref('/dictionary/regions');
const ENTITY_NAME = 'Регионы';

export default class RegionService {

    save(region: Region) {
        return fetchWrapper.put(commonUrl.value , region).then((data) => data);
    }

    delete(regionId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + regionId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }
}