import {fetchWrapper} from '../helpers/fetch-wrapper';
import {ref} from 'vue';
import type {Enum} from "../models/enum.model.ts";
import {Fluent, type FluentClass, type FluentService} from "../utils/Fluent.ts";

const commonUrl = ref('/enums');

@Fluent({ caching: true, ttl: 10 * 60 * 1000})
class EnumsService {

    findAllRegistrarChanel() {
        return fetchWrapper.get(commonUrl.value + "/registrar-channel", null).then((d) => d);
    }

    findAllMobileTab() {
        return fetchWrapper.get(commonUrl.value + "/mobile-tab", null).then((d) => d);
    }

    findAllLangs() {
        return fetchWrapper.get(commonUrl.value + "/lang", null).then((d) => d);
    }

    findAllVersionStatuses() {
        return fetchWrapper.get(commonUrl.value + "/version-statuses", null).then((d) => d);
    }

    findAllDeviceTypes() {
        return fetchWrapper.get(commonUrl.value + "/device-types", null).then((d) => d);
    }

    findAllConnectionDataTypes() {
        return fetchWrapper.get(commonUrl.value + "/connection-data-types", null).then((d) => d);
    }

    findAllAlgaProcessStatuses() {
        return fetchWrapper.get(commonUrl.value + "/alga-process-statuses", null).then((d) => d);
    }

    findAllProcessTypes() {
        return fetchWrapper.get(commonUrl.value + "/process-types", null).then((d) => d);
    }

    getAllStageState() {
        return fetchWrapper.get(commonUrl.value + "/stage-states", null).then((d) => d);
    }

    getAllStageName() {
        return fetchWrapper.get(commonUrl.value + "/stage-names", null).then((d) => d);
    }

    findAllDocumentTypes() {
        return fetchWrapper.get(commonUrl.value + "/document-types", null).then((d) => d);
    }

    findAllPersonificationStatus() {
        return fetchWrapper.get(commonUrl.value + "/pers-status", null).then((d) => d);
    }






    getAllESimState() {
        return fetchWrapper.get(`${commonUrl.value}/e-sim-states`, undefined);
    }

    getAllESimDocumentType() {
        return fetchWrapper.get(`${commonUrl.value}/e-sim-document-types`, undefined);
    }

    getAllSaimaState(): Promise<Enum[]> {
        return fetchWrapper.get(commonUrl.value + "/saima-state", null);
    }

    getAllSaimaPhotoType(): Promise<Enum[]> {
        return fetchWrapper.get(commonUrl.value + "/saima-photo-type", null);
    }

    getAllDocumentType(): Promise<Enum[]> {
        return fetchWrapper.get(commonUrl.value + "/document-type", null);
    }

    getAllRegion(): Promise<Enum[]> {
        return fetchWrapper.get(commonUrl.value + "/region", null);
    }

    getAllSaimaSubEditData(): Promise<Enum[]> {
        return fetchWrapper.get(commonUrl.value + "/saima-sub-edit-data", null);
    }

    getAllESimState() {
        return fetchWrapper.get(`${commonUrl.value}/e-sim-states`, undefined);
    }

    getAllESimDocumentType() {
        return fetchWrapper.get(`${commonUrl.value}/e-sim-document-types`, undefined);
    }

    getAllEduPPRequestStates() {
        return fetchWrapper.get(`${commonUrl.value}/edu-pp-request-states`, undefined);
    }
    getAllEduPPRequestTypes() {
        return fetchWrapper.get(`${commonUrl.value}/edu-pp-request-types`, undefined);
    }
    findAllDocumentTypes() {
        return fetchWrapper.get(commonUrl.value + "/document-types", null).then((d) => d);
    }

    findAllPersonificationStatus() {
        return fetchWrapper.get(commonUrl.value + "/pers-status", null).then((d) => d);
    }
    getAllSimRecoveryStates() {
        return fetchWrapper.get(`${commonUrl.value}/sim-recovery-states`, undefined);
    }

    getAllESimState() {
        return fetchWrapper.get(`${commonUrl.value}/e-sim-states`, undefined);
    }

    getAllESimDocumentType() {
        return fetchWrapper.get(`${commonUrl.value}/e-sim-document-types`, undefined);
    }

    getAllEduPPRequestStates() {
        return fetchWrapper.get(`${commonUrl.value}/edu-pp-request-states`, undefined);
    }

    getAllEduPPRequestCertificateType() {
        return fetchWrapper.get(`${commonUrl.value}/edu-pp-request-certificate-type`, undefined);
    }
}

export default EnumsService as unknown as FluentService<EnumsService, typeof EnumsService>;
