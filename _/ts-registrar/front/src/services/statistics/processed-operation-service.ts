import {fetchWrapper} from '../../helpers';
import {ref} from 'vue';

const commonUrl = ref('/statistic/processed-operation');

export default class ProcessedOperationStatisticService {

    findAuto(date: Date, username: String) {
        let yearMonth = date.getFullYear() + "-" + (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1);
        let params = "?yearMonth=" + yearMonth;
        if (username)
            params += "&username=" + username;
        return fetchWrapper.get(commonUrl.value + params, null).then((d) => d);
    }

    getExcel(date: Date, username: String) {
        let yearMonth = date.getFullYear() + "-" + (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1);
        let params = "?yearMonth=" + yearMonth;
        if (username)
            params += "&username=" + username;
        return fetchWrapper.getFile(commonUrl.value + "/exel" + params, null).then((d) => d);
    }

}