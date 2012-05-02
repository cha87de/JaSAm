var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + " createServer ");
});
server.listen(5859, function() {
    console.log((new Date()) + " Server is listening on port " + 5859);
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var requestObj = JSON.parse(message.utf8Data);

            var response = {requestId: requestObj.requestId, response: 'alle meine entchen ...'};
            connection.sendUTF(JSON.stringify(response));
        }
    });

    connection.on('close', function(connection) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});