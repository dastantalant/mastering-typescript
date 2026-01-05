export class URLUtil{

    public static buildParams(filter: any | null): string {
        if (!filter) return '';
        const params = new URLSearchParams();
        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                const stringValue = value instanceof Date ? value.toISOString() : value.toString();
                params.append(key, stringValue);
            }
        });
        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
    }

}