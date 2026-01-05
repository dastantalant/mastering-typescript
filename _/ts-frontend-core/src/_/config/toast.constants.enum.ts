// src/enums/toast.constants.enum.ts
export enum ToastSummary {
    Error = 'Ошибка',
    Success = 'Успешно',
    Warning = 'Внимание',
    ExportStarted = 'Экспорт начат',
}

export enum ToastDetail {
    DictionaryError = 'Ошибка загрузки справочников',
    AgentError = 'Не удалось загрузить данные агента',
    DataSaved = 'Данные сохранены',
    ExportStarted = 'Файл скоро будет загружен.',
    HistoryError = 'Ошибка загрузки истории',
    EnterInnAndDocId = 'Введите ИНН и номер документа',
    PassportDataNotFound = 'Данные по ПИН не найдены.',
    PassportFetchError = 'Не удалось получить данные паспорта.',
    DataApplied = 'Данные применены',
}