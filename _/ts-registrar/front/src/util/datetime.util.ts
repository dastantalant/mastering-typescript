export class DatetimeUtil {

    static parse(str: string, format: string = 'yyyy-MM-ddTHH:mm:ss.SSSSSS', locale: string = 'ky-KG'): Date | null {
        if (!str) return null;
        if (str.includes('T') && !format.includes('T')) {
            format = str.includes('.') ? 'yyyy-MM-ddTHH:mm:ss.SSSSSS' : 'yyyy-MM-ddTHH:mm:ss';
        }
        const tokens = format.match(/yyyy|yy|MMMM|MM|M|DDD|dd|d|HH|H|hh|h|mm|m|ss|s|SSS|SSSSSS|tt|t|T|\./g);
        if (!tokens) return null;
        const parts: { [key: string]: string } = {};
        let remainingStr = str.trim();
        for (const token of tokens) {
            const patternMap: { [key: string]: RegExp } = {
                yyyy: /^(\d{4})/,
                yy: /^(\d{2})/,
                MMMM: /^([A-Za-zА-Яа-я]+)/,
                MM: /^(\d{2})/,
                M: /^(\d{1,2})/,
                DDD: /^([A-Za-zА-Яа-я]+)/,
                dd: /^(\d{2})/,
                d: /^(\d{1,2})/,
                HH: /^(\d{2})/,
                H: /^(\d{1,2})/,
                hh: /^(\d{2})/,
                h: /^(\d{1,2})/,
                mm: /^(\d{2})/,
                m: /^(\d{1,2})/,
                ss: /^(\d{2})/,
                s: /^(\d{1,2})/,
                SSS: /^(\d{3})/,
                SSSSSS: /^(\d{6})/,
                tt: /^(AM|PM)/i,
                t: /^(A|P)/i,
                T: /^T/,
                '.': /^\./,
            };

            if (token === 'T' || token === '.') {
                if (remainingStr[0] !== token) return null;
                remainingStr = remainingStr.slice(1).trim();
                continue;
            }

            const match = remainingStr.match(patternMap[token]);
            if (!match) return null;

            parts[token] = match[1];
            remainingStr = remainingStr.slice(match[0].length).trim();
            remainingStr = remainingStr.replace(/^[\s\-\/,]+/, '');
        }
        if (remainingStr.length > 0) return null;
        let year = new Date().getFullYear();
        let month = 0;
        let day = 1;
        let hours = 0;
        let minutes = 0;
        let seconds = 0;
        let milliseconds = 0;
        let isPM = false;
        for (const token of tokens) {
            if (token === 'yyyy') year = parseInt(parts[token], 10);
            if (token === 'yy') year = parseInt(parts[token], 10) + (parseInt(parts[token], 10) < 50 ? 2000 : 1900);
            if (token === 'MM' || token === 'M') month = parseInt(parts[token], 10) - 1;
            if (token === 'MMMM') {
                const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
                const monthNames = Array.from({ length: 12 }, (_, i) =>
                    formatter.format(new Date(2020, i, 1)).toLowerCase()
                );
                month = monthNames.indexOf(parts[token].toLowerCase());
                if (month === -1) return null;
            }
            if (token === 'dd' || token === 'd') day = parseInt(parts[token], 10);
            if (token === 'HH' || token === 'H') hours = parseInt(parts[token], 10);
            if (token === 'hh' || token === 'h') {
                hours = parseInt(parts[token], 10);
                if (hours === 12) hours = 0;
            }
            if (token === 'mm' || token === 'm') minutes = parseInt(parts[token], 10);
            if (token === 'ss' || token === 's') seconds = parseInt(parts[token], 10);
            if (token === 'SSS' || token === 'SSSSSS') milliseconds = parseInt(parts[token], 10);
            if (token === 'tt' || token === 't') isPM = parts[token].toUpperCase().startsWith('P');
        }
        if ((format.includes('hh') || format.includes('h')) && isPM) {
            hours += 12;
        }
        const result = new Date(year, month, day, hours, minutes, seconds, milliseconds);
        return isNaN(result.getTime()) ? null : result;
    }

    static formatStringDate(dateString: string): string {
        if(dateString == null){
            return '';
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    static formatDate(date: Date | null, format: string = 'yyyy-MM-ddTHH:mm:ss.SSSSSS', locale: string = 'ky-KG'): string {
        if (!(date instanceof Date) || isNaN(date.getTime())) return '';
        const padZero = (value: number): string => String(value).padStart(2, '0');
        const is12Hour: boolean = format.includes('hh') || format.includes('tt');
        const hours: number = date.getHours();
        const hours12: number = hours % 12 || 12;
        const parts: DateParts = {
            yyyy: date.getFullYear(),
            yy: String(date.getFullYear()).slice(-2),
            MM: padZero(date.getMonth() + 1),
            M: date.getMonth() + 1,
            dd: padZero(date.getDate()),
            d: date.getDate(),
            HH: padZero(hours),
            H: hours,
            hh: padZero(hours12),
            h: hours12,
            mm: padZero(date.getMinutes()),
            m: date.getMinutes(),
            ss: padZero(date.getSeconds()),
            s: date.getSeconds(),
            tt: hours >= 12 ? 'PM' : 'AM',
            t: hours >= 12 ? 'P' : 'A',
        };
        const formatter = new Intl.DateTimeFormat(locale, {month: 'long', weekday: 'long'});
        const localizedParts = formatter.formatToParts(date);
        const monthName = localizedParts.find((part) => part.type === 'month')?.value;
        const weekdayName = localizedParts.find((part) => part.type === 'weekday')?.value;
        parts['MMMM'] = monthName || '';
        parts['DDD'] = weekdayName || '';
        return format.replace(
            /yyyy|yy|MMMM|MM|M|DDD|dd|d|HH|H|hh|h|mm|m|ss|s|tt|t/g,
            (match) => String(parts[match] ?? match)
        );
    }
}

interface DateParts {
    [key: string]: string | number;
}