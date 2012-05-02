var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + " createServer ");
});
server.listen(5859, function() {
    console.log((new Date()) + " Server is listening on port " + 5859);
});

wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var requestObj = JSON.parse(message.utf8Data);

            var response = {requestId: requestObj.requestId, response: 'alle meine entchen ...'};
            connection.sendUTF(JSON.stringify(response));
        }
    });
});