import type {SaimaTemplate} from "./saima-template.model.ts";

export interface SaimaTemplateCategory {
    id: number;
    uploadPhotoTypes: string[];
    reSent: boolean;
    active: boolean;
    name: string;
    createdAt: string;
    saimaTemplates?: SaimaTemplate[];
}