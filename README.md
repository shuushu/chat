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
2) 채팅룸 initialize member 
3) 룸리스트 ? 채널에 1개라도 룸리스트가 있으면 보여줌 : 채널에 첫 접속자가 방을만듦
4) RoomList / socketID별 채팅방 구현


