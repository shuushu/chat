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
