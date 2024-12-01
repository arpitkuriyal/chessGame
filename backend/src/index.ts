import WebSocket ,{ WebSocketServer } from "ws";
const socket = new WebSocketServer({port:8080})

socket.on('connection', function (ws) {
    console.log("new connection is made");
    ws.send('hello new user')
    ws.on('error', console.error);
    ws.on('message',function message(data,isBinary){
        socket.clients.forEach(function each(client){
            if( client!=ws && client.readyState === WebSocket.OPEN){
                client.send(data.toString(),{binary: isBinary })
            }
        })
    })

});