import db from '../db';

export let getLogin = (state) => {
    let { id, pw, nick } = state;


};
// 회원등록
export let setLogin = (state) => {
    let { id, pw, nick } = state;
    let ref = db.ref(`member/${nick}`);

    ref.on('value', (query) => {
         if(query.val()) {
            alert('닉네임으로 사용할 수 없습니다');
            return false;
        } else {
            ref.update({
                id: id,
                pw: pw
            });
        }
    }, (errorObject) => {
        console.log("The read failed: " + errorObject.code);
    });
};