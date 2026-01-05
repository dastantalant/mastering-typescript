import {computed} from 'vue';
import type {ComputedRef} from 'vue';
import type {ToastServiceMethods} from 'primevue/toastservice';

import type {DataTableConfig, FetchDataParams} from '@/components/datatable/types';
import {CellDisplay, FilterType, Severity} from '@/components/datatable/types';
import {DatetimeUtil} from "@/util/datetime.util.ts";
import type DurationUtil from "@/utils/duration.ts";
import type {Enum} from "@/models/enum.model.ts";
import type {Page} from "@/models/page.model.ts";
import type {ShortSaimaAgentDTO, SaimaAgentFilter} from "@/models/saima-agent.model.ts";

import SaimaAgentService from "@/services/__test__/saima-agent.service.ts";
import {SaimaState} from "@/enums/saima-agent.enum.ts";
import {Pin} from "../components/datatable.types.ts";

interface UseSaimaAgentDataTableOptions {
    dictionaries: {
        saimaState: ComputedRef<Enum[]>;
        saimaStateMap: ComputedRef<Map<string, Enum>>;
        channels: ComputedRef<Enum[]>;
        regions: ComputedRef<Enum[]>;
    };
    services: {
        toast: ToastServiceMethods;
        durationUtil: DurationUtil;
    };
}

export function useSaimaAgentDataTable(options: UseSaimaAgentDataTableOptions) {
    const {dictionaries, services} = options;

    const getHHMMSS = (ms: number | null | undefined): string => {
        if (ms === null || ms === undefined) {
            return '';
        }
        return services.durationUtil.convertMillisToHHMMSS(ms);
    };

    const saimaStateSeverityMap = new Map([
        [SaimaState.REJECTED, Severity.Danger],
        [SaimaState.FOR_CORRECTION, Severity.Danger],
        [SaimaState.TECHNICAL_SHEET_ISSUED, Severity.Success],
        [SaimaState.PERSONAL_ACCOUNT_ISSUED, Severity.Success],
        [SaimaState.SELECTED, Severity.Warning],
        [SaimaState.ADDING_AN_ADDRESS, Severity.Warning],
        [SaimaState.PENDING, Severity.Info]
    ]);
    const tableConfig = computed((): DataTableConfig<ShortSaimaAgentDTO> => ({
        title: "Агенты Saima",
        dataKey: "id",
        columns: [
            {field: 'id', header: 'ID', frozen: Pin.Left},
            {
                field: 'state', header: 'Статус', frozen: Pin.Left,
                customBody: (data: ShortSaimaAgentDTO) => ({
                    component: CellDisplay.Tag,
                    value: dictionaries.saimaStateMap.value.get(data.state)?.name || data.state,
                    severity: saimaStateSeverityMap.get(data.state) || Severity.Secondary
                }),
                filter: {
                    type: FilterType.Select,
                    options: dictionaries.saimaState.value,
                    optionLabel: 'name',
                    optionValue: 'value'
                }
            },
            {field: 'msisdn', header: 'Номер абонента', filter: {type: FilterType.Numeric}},
            {field: 'accountNumber', header: 'Номер лицевого счета', filter: {type: FilterType.Text}},
            {field: 'fullName', header: 'ФИО', filter: {type: FilterType.Text}},
            {field: 'inn', header: 'ИНН'},
            {field: 'registrarFullName', header: 'Регистратор', filter: {type: FilterType.Text}},
            {field: 'registrarMsisdn', header: 'Номер регистратора'},
            {
                field: 'region', header: 'Регион',
                filter: {
                    type: FilterType.Select,
                    options: dictionaries.regions.value,
                    optionLabel: 'name',
                    optionValue: 'value'
                }
            },
            {field: 'district', header: 'Район'},
            {field: 'city', header: 'Город'},
            {field: 'address', header: 'Адрес'},
            {
                field: 'channel', header: 'Канал',
                filter: {
                    type: FilterType.Select,
                    options: dictionaries.channels.value,
                    optionLabel: 'name',
                    optionValue: 'value'
                }
            },
            {field: 'supervisorFullName', header: 'Супервайзер', filter: {type: FilterType.Text}},
            {field: 'supervisorMsisdn', header: 'Номер супервайзера'},
            {
                field: 'createdAt', header: 'Создан', style: 'min-width: 18rem',
                filter: {
                    type: FilterType.DateRange, componentProps: {
                        selectionMode: 'range', dateFormat: 'dd.mm.yy', manualInput: true, style: 'min-width: 210px'
                    }
                },
                customBody: (data: ShortSaimaAgentDTO) => ({
                    component: CellDisplay.Text, value: DatetimeUtil.formatStringDate(data.createdAt)
                })
            },
            {
                field: 'updatedAt', header: 'Изменен', style: 'min-width: 14rem',
                customBody: (data: ShortSaimaAgentDTO) => ({
                    component: CellDisplay.Text, value: DatetimeUtil.formatStringDate(data.updatedAt)
                })
            },
            {
                field: 'timeTaken', header: 'Время в обработке',
                customBody: (data: ShortSaimaAgentDTO) => ({
                    component: CellDisplay.Text,
                    value: getHHMMSS(data.timeTaken)
                })
            },
            {
                field: 'isBlocked', header: 'Блокирован',
                customBody: (data: ShortSaimaAgentDTO) => ({
                    component: CellDisplay.Text,
                    value: data.isBlocked ? 'ДА' : 'НЕТ'
                })
            },
            {field: 'webRegistrar', header: 'WEB Регистратор', filter: {type: FilterType.Text}},
        ],
        actionColumn: {
            frozen: Pin.Right,
            actions: [
                {id: 'view', icon: 'pi pi-eye', severity: Severity.Info, tooltip: 'Просмотр'},
                {id: 'history', icon: 'pi pi-history', severity: Severity.Info, tooltip: 'История'},
                {id: 'old-history', icon: 'pi pi-history', severity: Severity.Warning, tooltip: 'История (старая)'},
            ]
        }
    }));

    async function fetchData(params: FetchDataParams) {
        const filter: SaimaAgentFilter = {
            page: params.page,
            size: params.rows,
            ...SaimaAgentService.createSaimaAgentFilter(params.filters)
        };
        try {
            const data: Page<ShortSaimaAgentDTO> = await SaimaAgentService.findAll(filter);
            return {items: data.content || [], totalRecords: data.totalElements || 0};
        } catch (error: any) {
            services.toast.add({
                severity: 'error',
                summary: 'Ошибка загрузки данных',
                detail: error.message,
                life: 5000
            });
            return {items: [], totalRecords: 0};
        }
    }

    async function exportData(params: { filters: Record<string, any> }) {
        const algaProcessFilter: SaimaAgentFilter = SaimaAgentService.createSaimaAgentFilter(params.filters);
        try {
            await SaimaAgentService.getExcel(algaProcessFilter);
            services.toast.add({
                severity: 'success',
                summary: 'Экспорт начат',
                detail: 'Файл скоро будет загружен.',
                life: 3000
            });
        } catch (error: any) {
            services.toast.add({severity: 'error', summary: 'Ошибка экспорта', detail: error.message, life: 5000});
        }
    }

    return {
        tableConfig,
        fetchData,
        exportData,
    };
}