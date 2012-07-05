var http = require('http');
var WebSocketServer = require('websocket').server;
var startStopDaemon = require('start-stop-daemon');

var JaSAmApp = require('../JaSAm/JaSAmApp.js').JaSAmApp;
var Exception = require('../JaSAm/messages/Exception.js').Exception;
var NodeAjaxCall = require("./core/NodeAjaxCall.js").NodeAjaxCall;
var ClassicWorker = require("./worker/ClassicWorker.js").ClassicWorker;
var SocketWorker = require("./worker/SocketWorker.js").SocketWorker;

var jaSAmApp = null;

var classicHttpServer = null;
var socketHttpServer = null;
var socketServer = null;
var socketServerWorker = new Array();

var socketServerPort = 5859;
var classicHttpServerPort = 5860;

var options = {
    daemonFile: "log/nodeServer.dmn", 
    outFile: "log/nodeServer.out",
    errFile: "log/nodeServer.err",    
    onCrash: function(e){
        console.info("server crashed! Closing httpserver and restarting nodeServer now ...", e);
        classicHttpServer.close();
        socketHttpServer.close();
        this.crashRestart();
    }
};

startStopDaemon(options, function() {
    
    // initialize JaSAmApp
    console.info((new Date()) + ': initialize JaSAmApp');
    
    jaSAmApp = new JaSAmApp("testmanager", "sehrsehrgeheim");
    var config = {};
    config[JaSAmApp.Configuration.baseUrl] =  "http://tel.rsu-hausverwalter.de:8088/asterisk/mxml";
    config[JaSAmApp.Configuration.autoLogin] =  true;
    config[JaSAmApp.Configuration.autoQueryEntities] =  true;
    config[JaSAmApp.Configuration.enableEventlistening] =  true;
    config[JaSAmApp.Configuration.enableEventBuffering] =  true;
    jaSAmApp.setConfiguration(config);

    var parser = require("libxml");
    jaSAmApp.getAsteriskManager().setParser(parser);

    var ajaxCall = new NodeAjaxCall();
    jaSAmApp.getAsteriskManager().setAjaxCall(ajaxCall);
    
    // start JaSAmApp - when done, startServer!
    jaSAmApp.start(startServer, this);

});

function startServer(isSuccess){
    // if JaSAmApp successfully startet, start server!
    
    if(!isSuccess){
        console.info((new Date()) + ": Fehler beim Starten der JaSAmApp!");
        return;
    }
    
    console.info((new Date()) + ": start server ...");

    startClassicHttpServer();
    startSocketServer(); 
}

function startClassicHttpServer(){
    var worker = new ClassicWorker(jaSAmApp, socketServerWorker);
    classicHttpServer = http.createServer(worker.work).listen(classicHttpServerPort);
    console.info((new Date()) + ": ClassicHttpServer listening on port " + classicHttpServerPort);
}

function startSocketServer(){
    socketHttpServer = http.createServer().listen(socketServerPort);
    socketServer = new WebSocketServer({
        httpServer: socketHttpServer
    });
    socketServer.on('request', function(request) {
        // accept incoming request, add message worker!

        var connection = request.accept(null, request.origin);
        var worker = new SocketWorker(jaSAmApp, connection);
        var workerPosition = socketServerWorker.length;
        socketServerWorker.push(worker);
        
        connection.on('message', worker.work);
        connection.on('close', function(connection) {
            // delete worker from array
            socketServerWorker.splice(workerPosition, 1);
        });
    });    
    console.info((new Date()) + ": SocketHttpServer listening on port " + socketServerPort);    
}