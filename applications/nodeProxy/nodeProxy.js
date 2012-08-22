var http = require('http');
var WebSocketServer = require('websocket').server;
var startStopDaemon = require('start-stop-daemon');
var jsonParser = require("xml2json");

var configuration = require('./configuration');

var JaSAmApp = require('../../framework/JaSAmApp.js').JaSAmApp;
var Exception = require('../../framework/messages/Exception.js').Exception;
var NodeAjaxCall = require("./core/NodeAjaxCall.js").NodeAjaxCall;
var ClassicWorker = require("./worker/ClassicWorker.js").ClassicWorker;
var SocketWorker = require("./worker/SocketWorker.js").SocketWorker;


var jaSAmApp = null;

var classicHttpServer = null;
var socketHttpServer = null;
var socketServer = null;
var socketServerWorker = new Array();

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
    jaSAmApp = new JaSAmApp(configuration.username, configuration.password);
    var config = {};
    config[JaSAmApp.Configuration.baseUrl] =  configuration.baseUrl;
    config[JaSAmApp.Configuration.autoLogin] =  true;
    config[JaSAmApp.Configuration.autoQueryEntities] =  true;
    config[JaSAmApp.Configuration.enableEventlistening] =  true;
    config[JaSAmApp.Configuration.enableEventBuffering] =  true;
    config[JaSAmApp.Configuration.enableKeepalive] = true;
    jaSAmApp.setConfiguration(config);

    
    jaSAmApp.getAsteriskManager().setJsonParser(jsonParser);

    var ajaxCall = new NodeAjaxCall();
    jaSAmApp.getAsteriskManager().setAjaxCall(ajaxCall);
    
    // start JaSAmApp - when done, startServer!
    jaSAmApp.start(startServer, this);

});

function startServer(isSuccess){
    // if JaSAmApp successfully startet, start server!

    if(!isSuccess){
        console.info((new Date()) + ": Error! Could not start JaSAmApp!");
        return;
    }
    
    console.info((new Date()) + ": start server ...");

    startClassicHttpServer();
    startSocketServer(); 
}

function startClassicHttpServer(){
    var worker = new ClassicWorker(jaSAmApp, configuration.classicHttpServer.token, configuration.classicHttpServer.mysqlLogin);
    classicHttpServer = http.createServer(worker.work);
    classicHttpServer.listen(configuration.classicHttpServer.port);
    console.info((new Date()) + ": ClassicHttpServer listening on port " + configuration.classicHttpServer.port);
}

function startSocketServer(){
    socketHttpServer = http.createServer();
    socketHttpServer.listen(configuration.socketServer.port);
    socketServer = new WebSocketServer({
        httpServer: socketHttpServer
    });
    socketServer.on('request', function(request) {
        // accept incoming request, add message worker!

        var connection = request.accept(null, request.origin);
        var worker = new SocketWorker(jaSAmApp, connection, configuration.socketServer.token);
        var workerPosition = socketServerWorker.length;
        socketServerWorker.push(worker);
        
        connection.on('message', worker.work);
        connection.on('close', function(connection) {
            // delete worker from array
            socketServerWorker.splice(workerPosition, 1);
        });
    });    
    console.info((new Date()) + ": SocketHttpServer listening on port " + configuration.socketServer.port);    
}