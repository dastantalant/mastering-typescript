export interface Permission {
    id: number;
    key: string;
    label: string;
    code: string;
    icon: string;
    children: Permission[];
}