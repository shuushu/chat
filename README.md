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

### 시나리오

1) 로그인 ? 채팅리스트 진입 : member add
- [redux-pender](https://velopert.com/3401#2-3-redux-promise-middleware)
```
프로미스 기반 액션들을 관리하기 위한 미들웨어와 도구가 포함되어있는 라이브러리
```
- [redux-actions](https://velopert.com/3358)
- [Provider](https://velopert.com/1266)
```
렌더링 될 때 Redux 컴포넌트인 <Provider> 에 store 를 설정해주면 그 하위 컴포넌트들에 따로 parent-child 구조로 전달해주지 않아도 connect 될 때 store에 접근 할 수 있게 해줍니다
```

2) 채팅룸 initialize member 
3) 룸리스트 ? 채널에 1개라도 룸리스트가 있으면 보여줌 : 채널에 첫 접속자가 방을만듦
4) RoomList / socketID별 채팅방 구현


