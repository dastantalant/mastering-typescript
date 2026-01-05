
// Предполагаемый путь: src/models/dictionary/connection-data.model.ts

/**
 * Описывает один элемент в списке (один тариф, один роутер или одну приставку).
 */
export interface ConnectionDataDTO {
    id: number;
    name: string;
    type: string;
    typeName: string;
    activeStatus: boolean;
    description: string;
    price: number;
}

/**
 * Описывает объект-обертку, который возвращает сервис.
 * Он содержит все списки данных для подключения.
 * Именно этот тип ожидает ваша страница SaimaAgent.vue.
 */
export interface ConnectionData {
    tariffs: ConnectionDataDTO[];
    consoles: ConnectionDataDTO[];
    routers: ConnectionDataDTO[];
}