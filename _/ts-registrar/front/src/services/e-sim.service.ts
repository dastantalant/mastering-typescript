import type { ESimModel, ESimDetailModel, ESimFilter } from '../models/esim.model';
import { fetchWrapper } from '../helpers/fetch-wrapper';

const baseUrl = '/e-sim';

export default class ESimService {
  async findAll(filter: ESimFilter): Promise<{content: ESimModel[], totalElements: number}> {
    const params = new URLSearchParams();
    if (filter.state) params.append('state', filter.state);
    if (filter.fromDate) params.append('fromDate', filter.fromDate);
    if (filter.toDate) params.append('toDate', filter.toDate);
    if (filter.webRegistrar) params.append('webRegistrar', filter.webRegistrar);
    if (filter.msisdn) params.append('msisdn', filter.msisdn);
    if (filter.firstName) params.append('firstName', filter.firstName);
    if (filter.lastName) params.append('lastName', filter.lastName);
    if (filter.personalNumber) params.append('personalNumber', filter.personalNumber);
    if (filter.docType) params.append('docType', filter.docType);
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());
    return fetchWrapper.get(`${baseUrl}?${params.toString()}`, undefined);
  }

  async findById(id: number): Promise<ESimDetailModel> {
    return fetchWrapper.get(`${baseUrl}/by-id/${id}`, undefined);
  }

  async findByIdForEdit(id: number): Promise<ESimDetailModel> {
    return fetchWrapper.get(`${baseUrl}/by-id-for-edit/${id}`, undefined);
  }

  async save(model: ESimDetailModel): Promise<void> {
    return fetchWrapper.post(`${baseUrl}`, model);
  }

  async findHistoryById(id: number): Promise<any[]> {
    return fetchWrapper.get(`${baseUrl}/history/${id}`, undefined);
  }

  async getExcel(filter: ESimFilter) {
    const params = new URLSearchParams();
    if (filter.state) params.append('state', filter.state);
    if (filter.fromDate) params.append('fromDate', filter.fromDate);
    if (filter.toDate) params.append('toDate', filter.toDate);
    if (filter.webRegistrar) params.append('webRegistrar', filter.webRegistrar);
    if (filter.msisdn) params.append('msisdn', filter.msisdn);
    if (filter.firstName) params.append('firstName', filter.firstName);
    if (filter.lastName) params.append('lastName', filter.lastName);
    if (filter.personalNumber) params.append('personalNumber', filter.personalNumber);
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());

    return fetchWrapper.getFile(`${baseUrl}/excel?${params.toString()}`, null).then((d) => d);
  }

  async getPassportData(inn: string, passportNumber: string): Promise<any> {
    return fetchWrapper.get(`${baseUrl}/get-passport-data/${inn}/${passportNumber}`, null, {});
  }
} 