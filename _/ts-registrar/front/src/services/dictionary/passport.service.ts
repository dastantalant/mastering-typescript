// import {fetchWrapper} from "../../helpers";
// import type {PassportResponse} from "../../models/dictionary/passport.model.ts";
//
// export default class PassportService {
//     static async getPassportData(pin : number, documentId: string): Promise<PassportResponse> {
//         const type = documentId.substring(0, 2);
//         const number= documentId.substring(2);
//         return fetchWrapper.get(`/rest/v2/grs/getPassportData/${pin}/${type}/${number}`).then((d) => d);
//     }
// }