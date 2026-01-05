import type {SaimaTemplateCategory} from "./saima-template-category.model";

export interface SaimaTemplate {
    id: number;
    category?: SaimaTemplateCategory;
    name: string;
    ruText: string;
    kgText: string;
    enText: string;
    createdAt: string;
}