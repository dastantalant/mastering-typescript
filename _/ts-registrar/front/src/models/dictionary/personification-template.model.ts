import type {PersonificationTemplateCategory} from "./personification-template-category.model.ts";

export interface PersonificationTemplate {
    id: number;
    category: PersonificationTemplateCategory;
    name: string;
    ruText: string;
    kgText: string;
    enText: string;
    createdAt: string;
}