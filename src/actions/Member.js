import db from '../db';

// 멤버조회
export let getLogin = (state, func) => {
    let { id, pw, socketID } = state;
    let ref = db.ref(`member/${socketID}`);

    ref.once('value', (query) => {       
        if(query.val()) {
            console.log('Access / ' , query.val());
            func();
        } else {
            alert('회원등록이 안되었거나, 로그인 오류!');
            return false;
        }
    })
};

// 회원등록
export let setLogin = (state) => {
    let { id, pw, socketID } = state;
    let ref = db.ref(`member/${socketID}`);

    ref.once('value', (query) => {
         if(query.val()) {
            alert('닉네임으로 사용할 수 없습니다');
            return false;
        } else {
            ref.update({
                id: id,
                pw: pw
            }, () => {
                alert(`회원등록 id: ${id}, pw: ${pw}`)
            });
        }
    }, (errorObject) => {
        console.log("The read failed: " + errorObject.code);
    });
};
