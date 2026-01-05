// Путь: src/services/dictionary/connection-data.service.ts

import type { ConnectionData, ConnectionDataDTO } from "@/_/models/dictionary/connection-data.model.ts";
import {Cacheable, Fluent, type FluentService} from "@/_/utils/Fluent.ts";

// --- НАЧАЛО МОК-РЕАЛИЗАЦИИ ---
const mockFetchWrapper = {
    get: async (url: string): Promise<ConnectionData> => { // Указываем правильный тип возвращаемого значения

        if (url.endsWith("/connection-data/all")) {
            const tariffs: ConnectionDataDTO[] = Array.from({ length: 5 }, (_, i) => ({
                id: 10 + i, name: `Тариф Saima Online ${50 + i * 10} Мбит/с`, type: 'TARIFF', typeName: 'Тариф',
                activeStatus: true, description: `Скорость до ${50 + i * 10} Мбит/с`, price: 850 + i * 100
            }));

            const routers: ConnectionDataDTO[] = [
                { id: 1, name: 'TP-Link Archer C80', type: 'ROUTER', typeName: 'Роутер', activeStatus: true, description: 'AC1900, гигабитный', price: 3500 },
                { id: 2, name: 'Xiaomi Mi Router 4A Giga', type: 'ROUTER', typeName: 'Роутер', activeStatus: true, description: 'Двухдиапазонный', price: 2100 },
            ];

            const consoles: ConnectionDataDTO[] = [
                { id: 101, name: 'Saima TV Box Pro', type: 'CONSOLE', typeName: 'Приставка', activeStatus: true, description: '4K Ultra HD, Android TV', price: 4000 },
                { id: 102, name: 'Без приставки', type: 'CONSOLE', typeName: 'Приставка', activeStatus: true, description: 'Для Smart TV', price: 0 },
            ];

            // Этот объект теперь полностью соответствует исправленному интерфейсу ConnectionData
            const responseData: ConnectionData = { tariffs, routers, consoles };
            return Promise.resolve(responseData);
        }

        return Promise.reject(new Error(`[MOCK] URL не найден: ${url}`));
    },
    // ... другие мок-методы (put, delete)
};
// --- КОНЕЦ МОК-РЕАЛИЗАЦИИ ---

@Fluent()
class ConnectionDataService {
    save(connectionData: ConnectionData) {
        // @ts-ignore
        return mockFetchWrapper.put('/dictionary/connection-data', connectionData);
    }

    delete(id: number) {
        // @ts-ignore
        return mockFetchWrapper.delete(`/dictionary/connection-data/${id}`);
    }

    /**
     * Этот метод возвращает объект, содержащий списки тарифов, роутеров и приставок.
     */
    @Cacheable(5 * 60 * 1000)
    getAllConnectionDataTypes(): Promise<ConnectionData> {
        return mockFetchWrapper.get(`/dictionary/connection-data/all`);
    }

    findHistoryById(id: number): Promise<any[]> {
        id - 1;
        return Promise.resolve([]);
    }
}
export default ConnectionDataService as unknown as FluentService<ConnectionDataService, typeof ConnectionDataService>;
