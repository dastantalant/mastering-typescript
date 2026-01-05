// src/components/dialog/dataEditor.enums.ts

export enum MessageSeverity {
    Success = 'success',
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
}

export enum FieldType {
    Text = 'text',
    Textarea = 'textarea',
    Number = 'number',
    Tag = 'tag',
    Date = 'date',
    Select = 'select',
    Dropdown = 'dropdown',
    MultiSelect = 'multiselect',
    DependentSelect = 'dependent-select',
    Divider = 'divider',
    Button = 'button',
}

export enum ActionVisibility {
    View = 'view',
    Edit = 'edit',
    Always = 'always',
}

export enum ButtonLabels {
    Cancel = 'Отмена',
    Save = 'Сохранить',
    Close = 'Закрыть',
    Edit = 'Редактировать',
}

export enum Icon {
    Times = 'pi pi-times',
    Check = 'pi pi-check',
    Pencil = 'pi pi-pencil',
    ExclamationTriangle = 'pi pi-exclamation-triangle',
    Image = 'pi pi-image',
}

export enum DefaultMessages {
    RequiredField = 'Поле "{label}" обязательно для заполнения',
    InvalidFormat = 'Неверный формат',
    LengthMustBe = 'Длина поля "{label}" должна быть ровно {len} символов',
    MinLength = 'Минимальное значение: {min}',
    MaxLength = 'Максимальное значение: {max}',
    NoUrl = 'URL отсутствует',
    Empty = '—',
}