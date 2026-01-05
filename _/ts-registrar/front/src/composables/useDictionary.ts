import { ref } from 'vue';

import EnumsService from "@/services/__test__/enums.service.js";
import ConnectionDataService from "@/services/dictionary/__tests__/connection-data.service.ts";
import SaimaTemplateCategoryService from "@/services/dictionary/__tests__/saima-template-category.service.ts";

import type { Enum } from "@/models/enum.model.ts";
import type { ConnectionDataDTO } from "@/models/saima-agent.model.ts";
import type { SaimaTemplateCategory } from "@/models/dictionary/saima-template-category.model.ts";
import type { SaimaTemplate } from "@/models/dictionary/saima-template.model.ts";
import type { Photo, SelectOption } from "@/components/DataEditorDialog.vue";
import {useToast} from "primevue/usetoast";
const toast = useToast();


export function useDictionary() {
    const tableIsDataReady = ref(false);
    const channels = ref<Enum[]>([]);
    const regions = ref<Enum[]>([]);
    const saimaState = ref<Enum[]>([]);
    const saimaStateMap = ref<Map<string, Enum>>(new Map());
    const saimaPhotoTypes = ref<Enum[]>([]);
    const documentType = ref<Enum[]>([]);
    const saimaSubEditData = ref<Enum[]>([]);
    const tariffs = ref<ConnectionDataDTO[]>([]);
    const routers = ref<ConnectionDataDTO[]>([]);
    const consoles = ref<ConnectionDataDTO[]>([]);
    const saimaTemplateCategory = ref<SaimaTemplateCategory[]>([]);
    const saimaTemplate = ref<Record<string, SelectOption[]>>({});
    const saimaTemplateMap = ref<Map<number, SaimaTemplate>>(new Map());
    const photoTypesList = ref<Array<Photo>>([]);
    const photoTypesMap = ref<Map<string, Photo>>(new Map());

    const enumsService = new EnumsService();
    const connectionDataService = new ConnectionDataService();
    const saimaTemplateCategoryService = new SaimaTemplateCategoryService();

    const fetchDictionary = async () => {
        try {
            const [
                channelsData,
                regionsData,
                saimaStateData,
                saimaPhotoData,
                documentData,
                connectionData,
                saimaTemplateCategoryData,
                saimaSubEdits
            ] = await Promise.all([
                enumsService.findAllRegistrarChanel(),
                enumsService.getAllRegion(),
                enumsService.getAllSaimaState(),
                enumsService.getAllSaimaPhotoType(),
                enumsService.getAllDocumentType(),
                connectionDataService.getAllConnectionDataTypes(),
                saimaTemplateCategoryService.findAllExtended(),
                enumsService.getAllSaimaSubEditData(),
            ]);

            channels.value = channelsData;
            regions.value = regionsData;
            saimaState.value = saimaStateData;
            saimaStateData.forEach((state: Enum) => saimaStateMap.value.set(state.value, state));

            saimaPhotoTypes.value = saimaPhotoData;
            saimaPhotoData.forEach((element: Enum) => {
                const photoType: Photo = {
                    id: element.code,
                    name: element.name,
                    type: element.value,
                };
                photoTypesList.value.push(photoType);
                photoTypesMap.value.set(element.value, photoType);
            });

            documentType.value = documentData;
            tariffs.value = connectionData.tariffs;
            routers.value = connectionData.routers;
            consoles.value = connectionData.consoles;

            saimaTemplateCategory.value = saimaTemplateCategoryData;
            saimaTemplateCategoryData.forEach((c: SaimaTemplateCategory) => {
                saimaTemplate.value[c.id] = c.saimaTemplates ?? [];
                c.saimaTemplates?.forEach((s: SaimaTemplate) => saimaTemplateMap.value.set(s.id, s));
            });

            saimaSubEditData.value = saimaSubEdits;
        } catch (error) {
            console.error("Failed to fetch dictionaries:", error);
            toast.add({
                severity: 'error',
                summary: 'Ошибка загрузки справочников',
                detail: error.message,
                life: 5000
            });
        } finally {
            tableIsDataReady.value = true;
        }
    };

    return {
        tableIsDataReady,
        channels,
        regions,
        saimaState,
        saimaStateMap,
        saimaPhotoTypes,
        documentType,
        saimaSubEditData,
        tariffs,
        routers,
        consoles,
        saimaTemplateCategory,
        saimaTemplate,
        saimaTemplateMap,
        photoTypesList,
        photoTypesMap,
        fetchDictionary,
    };
}