### react + express + socket.io

* React-router를 이용해서 client > server로 roomID 전달
  
```
// server.js
socket.on('joinroom', (data) => {
   socket.join(data.room);
});

// App.js
<Route path="/view/:userName/" component={ChatView} />

// view.js
componentDidMount() {
  socket.emit('joinroom',{room: this.props.match.params.userName});
}
```
### 종료
1) 로그인 개발

2) 회원가입 (email, google만 연동)

3) 주소 입력으로 이동 > 비로그인시 로그인 화면으로 이동

4) roomList 기본 frame 구성

5) 채팅방 생성 후 바로 채팅 룸으로 이동

6) 메세지 주고 받기

7) 메세지 입력시 현재 접속한 멤버에게만 보여주기




### Todo-list
1) 시나리오 변경

as-is
로그인 후 > 채팅룸 리스트

to-be
로그인 후 > 채팅룸 리스트 방이 있는지 판단 (false) 유저 리스트, (true) 채팅룸 > join > 채팅방 생성



### ERD
![ERD](http://postfiles14.naver.net/MjAxNzA4MDlfNDcg/MDAxNTAyMjA2NTQ4OTEy.-azxXWHErNmeqtTO97YmeVgy6Adbsi14A7dE7ZGyyjAg.h77ONIJ8OjEwTGhqsZaAdmRKVe3qtOeuEyM9HhWKg9sg.JPEG.efu0128/erd.jpg?type=w3)

### 이슈노트

- [진행중 이슈](https://github.com/shuushu/chat/issues?q=is%3Aopen+is%3Aissue)
- [종료된 이슈](https://github.com/shuushu/chat/issues?q=is%3Aissue+is%3Aclosed)

