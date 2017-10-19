const convertDate = (f) => {
    let weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    let d = new Date();
    let setString = (t) => {
        let value = '';

        // t type 검사
        if (typeof t === 'number') {
            value = String(t);

            if(value.length < 2) {
                value = '0' + value;
            }

            return value;
        }
    };

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return setString(d.getFullYear() % 1000);
            case "MM": return setString(d.getMonth() + 1);
            case "dd": return setString(d.getDate());
            case "E": return weekName[d.getDay()];
            case "HH": return setString(d.getHours());
            case "hh": return setString(d.getHours() % 12);
            case "mm": return setString(d.getMinutes());
            case "ss": return setString(d.getSeconds());
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};


const convertTime = (tt) => {
    const date = new Date(tt);
    const getYear = date.getFullYear();
    const getMonth = date.getMonth() + 1;
    const getDate = date.getDate();

    return `${getYear}년 ${getMonth}월 ${getDate}일 (월)`;
}

const convertAPM = (tt) => {
    const date = new Date(tt);

    let ampm = '';
    let hour = date.getHours();
    let minute = date.getMinutes();


    if (hour > 12) {
        ampm = '오후';
        hour -= 12;
    } else if (hour < 12) {
        ampm = '오전';
    } else {
        ampm = '오후';
    }

    if (minute < 10) {
        minute = '0' + minute;
    }

    return `${ampm} ${hour}:${minute}`;
};

// 최근 1시간전은 분으로 나타내기
const latestTime = (tt) => {
    const current = new Date();
    const date = new Date(tt);

    if(current.getDate() === date.getDate() && current.getHours() - date.getHours() === 0) {
        let cur = current.getMinutes() - date.getMinutes();

        if(cur === 0) {
            return '지금';
        } else {
            return `${cur}분전`;
        }
    } else {
        return convertAPM(tt);
    }
}

export { convertDate, convertTime, convertAPM, latestTime }