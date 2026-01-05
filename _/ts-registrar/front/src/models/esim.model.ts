import type {TDictionaryItem} from "./dictionary.type.ts";

export interface ESimFile {
  type: string;
  typeName: string;
  path: string;
  url: string;
  encodedFile: string;
  contentType: string;
}

export interface ESimModel {
  id: number;
  state: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  personalNumber?: string;
  passportIssuedDate?: string;
  passportIssuedBy?: string;
  webRegistrar?: string;
  blocked?: boolean;
  selectedDate?: string;
  registrationDate?: string;
  icc?: string;
  msisdn?: string;
  createdAt?: string;
  docTypeDescription?: string;
  intermediateTimeMillis?: number;
  processStartDate: string;
  msisdnReservedDate: string;
  paymentStatus: string;
}

export interface ESimDetailModel extends ESimModel {
  rejectReasonId?: number;
  region?: string;
  district?: string;
  city?: string;
  street?: string;
  house?: string;
  apartment?: string;
  address?: string;
  comments?: string;
  docType?: string;
  files?: ESimFile[];
  rejectReasons: TDictionaryItem[];
  manual?: boolean;
}

export interface ESimFilter {
  state?: string;
  fromDate?: string;
  toDate?: string;
  webRegistrar?: string;
  msisdn?: string;
  firstName?: string;
  lastName?: string;
  personalNumber?: string;
  docType?: string;
  page?: number;
  size?: number;
} 