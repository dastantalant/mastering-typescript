import type {SaimaTemplateCategory} from '../../../models/dictionary/saima-template-category.model.ts';
import type {SaimaTemplate} from "../../../models/dictionary/saima-template.model.ts";
import {Fluent, type FluentClass, type FluentService} from "../../../utils/Fluent.ts";

const mockFetchWrapper = {
    get: async (url: string): Promise<any> => {
        if (url.endsWith("/extended/all")) {
            const templatesForRejection: SaimaTemplate[] = [
                {
                    id: 101,
                    ruText: 'Клиент не соответствует требованиям компании.',
                    kgText: 'Кардар компаниянын талаптарына жооп бербейт.',
                    enText: 'enText',
                    createdAt: 'createdAt'
                } as SaimaTemplate,
                {
                    id: 102,
                    ruText: 'Предоставлены неверные паспортные данные.',
                    kgText: 'Паспорттук маалыматтар туура эмес берилген.',
                    enText: 'enText',
                    createdAt: 'createdAt'
                } as SaimaTemplate,
            ];

            const templatesForCorrection: SaimaTemplate[] = [
                {
                    id: 201,
                    ruText: 'Фото паспорта нечеткое. Пожалуйста, переснимите.',
                    kgText: 'Паспорттун сүрөтү так эмес. Сураныч, кайра тартыңыз.',
                    enText: 'enText',
                    createdAt: 'createdAt'
                } as SaimaTemplate,
                {
                    id: 202,
                    ruText: 'Адрес указан не полностью. Уточните, пожалуйста.',
                    kgText: 'Дарек толук көрсөтүлгөн эмес. Сураныч, тактаңыз.',
                    enText: 'enText',
                    createdAt: 'createdAt'
                } as SaimaTemplate,
            ];

            const data: SaimaTemplateCategory[] = [
                {
                    id: 1,
                    name: 'Отказ',
                    active: true,
                    reSent: false,
                    uploadPhotoTypes: [],
                    createdAt: new Date().toISOString(),
                    saimaTemplates: templatesForRejection
                },
                {
                    id: 2,
                    name: 'На доработку',
                    active: true,
                    reSent: true,
                    uploadPhotoTypes: ['PASSPORT_FRONT', 'PASSPORT_BACK'],
                    createdAt: new Date().toISOString(),
                    saimaTemplates: templatesForCorrection
                }
            ];
            return Promise.resolve(data);
        }
        return Promise.reject(new Error(`[MOCK] URL не найден: ${url}`));
    },
    put: async (url: string, body: any) => {
        return Promise.resolve(body);
    },
    delete: async (url: string) => {
        return Promise.resolve({status: 'OK'});
    }
};

@Fluent()
class SaimaTemplateCategoryService {

    save(saimaTemplateCategory: SaimaTemplateCategory) {
        return mockFetchWrapper.put('/dictionary/saima-template-categories', saimaTemplateCategory);
    }

    delete(categoryId: number) {
        return mockFetchWrapper.delete(`/dictionary/saima-template-categories/${categoryId}`);
    }

    findAll() {
        return mockFetchWrapper.get(`/dictionary/saima-template-categories/extended/all`);
    }

    findAllExtended(): Promise<SaimaTemplateCategory[]> {
        return mockFetchWrapper.get(`/dictionary/saima-template-categories/extended/all`);
    }

    findHistoryById(id: number): Promise<any[]> {
        return Promise.resolve([]);
    }
}
export default SaimaTemplateCategoryService as unknown as FluentService<SaimaTemplateCategoryService, typeof SaimaTemplateCategoryService>;
