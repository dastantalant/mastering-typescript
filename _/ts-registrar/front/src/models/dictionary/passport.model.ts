export interface PassportResponse {
    surname?: string,
    name?: string,
    patronymic?: string,
    dateOfBirth?: string,
    issuedDate?: string,
    expiredDate?: string,
    passportAuthority?: string,
    address?: string,
    addressGRS?: string,
    grsPhoto?: string, // base64
    gender?: 'M' | 'F',
    errorMessage?: string,
    expired?: boolean
}