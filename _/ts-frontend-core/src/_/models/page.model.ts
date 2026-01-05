export interface Page<T> {
    content: T[]; // Список объектов на текущей странице.
    size: number; // Количество элементов на странице.
    number: number; // Текущий номер страницы (с нулевой индексацией).
    totalElements: number; // Общее количество элементов на всех страницах.
    totalPages: number; // Общее количество доступных страниц.
    first?: boolean; // Логическое значение, указывающее, является ли это первой страницей.
    last?: boolean; // Логическое значение, указывающее, является ли это последней страницей.
    numberOfElements?: number; // Количество элементов на странице.
    empty?: boolean;
    sort?: Sort;
    pageable?: Pageable;
}

export interface Pageable {
    pageNumber: number;
    pageSize: number;
    offset: number;
    unpaged: boolean;
    paged: boolean;
    sort: Sort;
}

export interface Sort {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}