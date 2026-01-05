import {fetchWrapper} from '../../helpers';
import {ref} from 'vue';
import type {Registrar, RegistrarFilter} from "../../models/dictionary/registrar.model.ts";

const commonUrl = ref('/dictionary/registrars');
const ENTITY_NAME = 'Регистраторы';

export default class RegistrarService {

    save(registrar: Registrar) {
        return fetchWrapper.put(commonUrl.value, registrar).then((data) => data);
    }

    delete(roleId: number) {
        return fetchWrapper.delete(commonUrl.value + "/" + roleId, null).then((data) => data);
    }

    findAll(registrarFilter: RegistrarFilter) {
        let params = "?page=" + registrarFilter.page + "&size=" + registrarFilter.size;
        if (registrarFilter.msisdn)
            params += "&msisdn=" + registrarFilter.msisdn;
        if (registrarFilter.fio)
            params += "&fio=" + registrarFilter.fio;
        if (registrarFilter.svfio)
            params += "&svfio=" + registrarFilter.svfio;

        return fetchWrapper.get(commonUrl.value + params, null).then((d) => d);
    }

    findHistoryById(id: number): Promise<any[]> {
        return fetchWrapper.get(`/dictionary/entity-history/${ENTITY_NAME}/${id}`, undefined);
    }

    getByChannel(registrarChannel: string) {
        return fetchWrapper.get(`${commonUrl.value}/by-chanel/${registrarChannel}`, null).then((d) => d);
    }
}