import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {GiftSimCard} from "../../models/dictionary/gift-sim-card.model.ts";

const commonUrl = ref('/dictionary/gift-sim-cards');
const ENTITY_NAME = 'Подарки';

export default class GiftSimCardService {

    save(giftSimCard: GiftSimCard) {
        return fetchWrapper.put(commonUrl.value , giftSimCard).then((data) => data);
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