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

export { convertDate }