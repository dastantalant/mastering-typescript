import {fetchWrapper, requestFile} from '../helpers';
import type {
    FullSaimaAgentDTO,
    SaimaAgent,
    SaimaAgentFilter,
    SaimaAgentUpdateDTO,
    SaimaAgentUploads,
    ShortSaimaAgentDTO
} from "../models/saima-agent.model";
import type {Page} from "../models/page.model.ts";
import type {EntityChangesModel} from "../models/entity-changes.model.ts";
import {Fluent, type FluentService} from "../utils/Fluent.ts";

@Fluent()
class SaimaAgentService {

    static async getFullSaimaAgent(id: number): Promise<FullSaimaAgentDTO> {
        return fetchWrapper.get(`/saima-agent/${id}`).then((d) => d);
    }

    static async findAll(filter: SaimaAgentFilter): Promise<Page<ShortSaimaAgentDTO>> {
        return fetchWrapper.post(`/saima-agent/page`, filter);
    }

    static async put(model: SaimaAgent, saimaAgent: SaimaAgentUpdateDTO): Promise<FullSaimaAgentDTO> {
        if (saimaAgent.state === 'TECHNICAL_SHEET_ISSUED') {
            let hasAgreement = false; // фото договора
            let hasAppFirstPage = false; // приложение 1 стр
            model.saimaAgentUploads?.forEach(agent => {
                hasAgreement = agent.saimaPhotoType === 'LOAN_AGREEMENT' || hasAgreement;
                hasAppFirstPage = agent.saimaPhotoType === 'APPLICATION_FIRST_PAGE' || hasAppFirstPage;
            })
            if (hasAgreement && hasAppFirstPage) {
                return fetchWrapper.put(`/saima-agent`, saimaAgent).then((d) => d);
            }
            const error = new Error('Нельзя ставить статус *Технический лист выпущен* если загружены не все фотографии');
            (error as any).status = 400;
            throw error;
        }
        return fetchWrapper.put(`/saima-agent`, saimaAgent).then((d) => d);
    }

    static async setSelected(id: number): Promise<FullSaimaAgentDTO> {
        return fetchWrapper.patch(`/saima-agent/select/${id}`).then((d) => d);
    }

    static async getExcel(filter: SaimaAgentFilter) {
        return requestFile('POST')(`/saima-agent/excel`, filter);
    }

    static async getSaimaAgentUpload(id: number): Promise<SaimaAgentUploads[]> {
        return fetchWrapper.get(`/saima-agent/upload/${id}`, null).then((d) => d);
    }

    static async getSaimaAgentHistoryById(id: number): Promise<EntityChangesModel[]> {
        return fetchWrapper.get(`/saima-agent/history/${id}`, null).then((d) => d);
    }

    static createSaimaAgentFilter(filters: Record<string, any>): SaimaAgentFilter {
        const [startDate, endDate] = filters.createdAt || [null, null];
        return <SaimaAgentFilter>{
            saimaAgent: filters.fullName,
            accountNumber: filters.accountNumber,
            channel: filters.channel,
            state: filters.state,
            msisdn: filters.msisdn,
            supervisor: filters.supervisorFullName,
            registrar: filters.registrarFullName,
            webRegistrar: filters.webRegistrar,
            region: filters.region,
            startDate: startDate || null,
            endDate: endDate || null
        };
    };
}

export default SaimaAgentService as unknown as FluentService<SaimaAgentService, typeof SaimaAgentService>;
