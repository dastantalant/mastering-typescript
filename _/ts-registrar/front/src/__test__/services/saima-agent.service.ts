import type {
    FullSaimaAgentDTO,
    SaimaAgent,
    SaimaAgentFilter,
    SaimaAgentUpdateDTO,
    SaimaAgentUploads,
    ShortSaimaAgentDTO
} from "../../models/saima-agent.model";
import type {Page} from "../../models/page.model.ts";
import type {EntityChangesModel} from "../../models/entity-changes.model.ts";
import {SaimaState} from "../../enums/saima-agent.enum.ts";
import {Fluent, type FluentClass, type FluentService} from "../../utils/Fluent.ts";


// ==========================================
// 1. ГЕНЕРАЦИЯ МОК ДАННЫХ
// ==========================================

const generateMockData = (count: number): ShortSaimaAgentDTO[] => {
    const agents: ShortSaimaAgentDTO[] = [];
    const states = Object.values(SaimaState);
    const channels = ['Дилер', 'Веб', 'Офис'];

    for (let i = 1; i <= count; i++) {
        const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);

        agents.push({
            id: 1000 + i,
            msisdn: 996555000000 + i,
            accountNumber: `ACC${1000 + i}`,
            fullName: `Agent Name ${i}`,
            inn: `123456789012${i}`,
            registrarFullName: `Registrar ${i}`,
            registrarMsisdn: `99670000000${i}`,
            region: (i % 7) + 1,
            district: `District ${i}`,
            city: `City ${i}`,
            address: `Address ${i}`,
            channel: channels[i % 3],
            supervisorFullName: `Supervisor ${i}`,
            supervisorMsisdn: `99677700000${i}`,
            state: states[i % states.length],
            createdAt: createdAt.toISOString(),
            updatedAt: new Date().toISOString(),
            timeTaken: String(Math.floor(Math.random() * 50000)),
            isBlocked: i % 10 === 0,
            webRegistrar: `WebReg ${i}`,
            street: `Street ${i}`,
            house: `${i}`,
            apartmentNumber: `${i}`
        });
    }
    return agents.reverse(); // Новые сверху
};

// Хранилище данных в памяти
let dbAgents = generateMockData(155);

// Генератор загрузок (чтобы проходила валидация PUT)
const generateUploads = (id: number | undefined): SaimaAgentUploads[] => {
    if (id === undefined) return [];
    return [
        {saimaPhotoType: 'LOAN_AGREEMENT', signedUrl: 'http://via.placeholder.com/150'},
        {saimaPhotoType: 'APPLICATION_FIRST_PAGE', signedUrl: 'http://via.placeholder.com/150'},
        {saimaPhotoType: 'PASSPORT_FRONT', signedUrl: 'http://via.placeholder.com/150'}
    ];
}

// Генератор легаси истории
const generateHistory = (id: number): EntityChangesModel[] => {
    return [
        {
            id: `hist-${id}-1`,
            action: 'UPDATE',
            originalId: id,
            entity: 'saima_agent',
            newValue: '{"state": "ACCEPTED"}',
            createdBy: 'admin',
            cts: new Date(Date.now() - 100000) // Date object (Legacy)
        },
        {
            id: `hist-${id}-2`,
            action: 'INSERT',
            originalId: id,
            entity: 'saima_agent',
            newValue: '{"state": "PENDING"}',
            createdBy: 'system',
            cts: new Date(Date.now() - 200000)
        }
    ];
};

// ==========================================
// 2. MOCK SERVICE CLASS
// ==========================================

@Fluent()
class SaimaAgentService {

    // Имитация задержки сети
    private static async delay(ms: number = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async getFullSaimaAgent(id: number): Promise<FullSaimaAgentDTO> {
        await this.delay();
        const agent = dbAgents.find(a => a.id === id);
        if (!agent) throw new Error("Agent not found");

        // Расширяем ShortDTO до FullDTO, добавляя uploads для валидации
        return {
            ...agent,
            saimaAgentUploads: generateUploads(id)
        } as unknown as FullSaimaAgentDTO;
    }

    static async findAll(filter: SaimaAgentFilter): Promise<Page<ShortSaimaAgentDTO>> {
        await this.delay();

        // 1. Фильтрация
        let filtered = dbAgents.filter(agent => {
            if (filter.saimaAgent && !agent.fullName.toLowerCase().includes(filter.saimaAgent.toLowerCase())) return false;
            if (filter.accountNumber && !agent.accountNumber.toLowerCase().includes(filter.accountNumber.toLowerCase())) return false;
            if (filter.msisdn && !String(agent.msisdn).includes(String(filter.msisdn))) return false;
            if (filter.state && agent.state !== filter.state) return false;
            if (filter.channel && agent.channel !== filter.channel) return false;
            if (filter.region && agent.region !== Number(filter.region)) return false;

            // Фильтрация по дате
            if (filter.startDate) {
                if (new Date(agent.createdAt) < new Date(filter.startDate)) return false;
            }
            if (filter.endDate) {
                const end = new Date(filter.endDate);
                end.setHours(23, 59, 59, 999);
                if (new Date(agent.createdAt) > end) return false;
            }

            return true;
        });

        // 2. Пагинация (обработка значений по умолчанию)
        const page = filter.page ?? 0;
        const size = filter.size ?? 10;

        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);
        const content = filtered.slice(page * size, (page + 1) * size);

        return {
            content,
            totalElements,
            totalPages,
            number: page,
            size: size,
            first: page === 0,
            last: page >= totalPages - 1,
            numberOfElements: content.length,
            empty: content.length === 0
        };
    }

    static async put(model: SaimaAgent, saimaAgent: SaimaAgentUpdateDTO): Promise<FullSaimaAgentDTO> {
        await this.delay();

        // --- LEGACY VALIDATION LOGIC (COPIED) ---
        if (saimaAgent.state === 'TECHNICAL_SHEET_ISSUED') {
            let hasAgreement = false; // фото договора
            let hasAppFirstPage = false; // приложение 1 стр

            // Проверяем uploads из переданной модели (FullSaimaAgentDTO)
            model.saimaAgentUploads?.forEach(agent => {
                hasAgreement = agent.saimaPhotoType === 'LOAN_AGREEMENT' || hasAgreement;
                hasAppFirstPage = agent.saimaPhotoType === 'APPLICATION_FIRST_PAGE' || hasAppFirstPage;
            });

            if (!hasAgreement || !hasAppFirstPage) {
                const error = new Error('Нельзя ставить статус *Технический лист выпущен* если загружены не все фотографии');
                (error as any).status = 400;
                throw error;
            }
        }
        // ----------------------------------------

        // Обновление в "БД"
        const index = dbAgents.findIndex(a => a.id === saimaAgent.id);
        if (index !== -1) {
            // Обновляем поля
            dbAgents[index] = { ...dbAgents[index], ...saimaAgent } as any;

            // Возвращаем обновленный объект
            return {
                ...dbAgents[index],
                saimaAgentUploads: generateUploads(saimaAgent.id)
            } as unknown as FullSaimaAgentDTO;
        }

        throw new Error("Agent not found for update");
    }

    static async setSelected(id: number): Promise<FullSaimaAgentDTO> {
        await this.delay();
        const index = dbAgents.findIndex(a => a.id === id);
        if (index !== -1) {
            dbAgents[index].state = SaimaState.SELECTED; // Меняем статус
            return {
                ...dbAgents[index],
                saimaAgentUploads: generateUploads(id)
            } as unknown as FullSaimaAgentDTO;
        }
        throw new Error("Agent not found");
    }

    static async getExcel(filter: SaimaAgentFilter) {
        await this.delay(1000);
        return new Blob(["Mock Excel Content"], { type: 'application/vnd.ms-excel' });
    }

    static async getSaimaAgentUpload(id: number): Promise<SaimaAgentUploads[]> {
        await this.delay();
        return generateUploads(id);
    }

    static async getSaimaAgentHistoryById(id: number): Promise<EntityChangesModel[]> {
        await this.delay();
        return generateHistory(id);
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
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null
        };
    };
}

export default SaimaAgentService as unknown as FluentService<SaimaAgentService, typeof SaimaAgentService>;