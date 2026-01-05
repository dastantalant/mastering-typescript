import { fetchWrapper } from '../../helpers';
import { ref } from 'vue';
import type {TariffPlan} from "../../models/dictionary/tariff-plan.model.ts";

const commonUrl = ref('/dictionary/tariff-plans');

export default class TariffPlanService {

    save(tariffPlan: TariffPlan) {
        return fetchWrapper.put(commonUrl.value , tariffPlan).then((data) => data);
    }

    delete(regionId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + regionId, null).then((data) => data);
    }

    findAll() {
        return fetchWrapper.get(commonUrl.value, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`${commonUrl.value}/history/${id}`, undefined);
    }
}