var http = require('http');
var url = require('url');
var startStopDaemon = require('start-stop-daemon');
var mysql = require('mysql');
var querystring = require('querystring');

var JaSAmApp = require('../JaSAm/JaSAmApp.js').JaSAmApp;
var Exception = require('../JaSAm/messages/Exception.js').Exception;
var Task = require('../JaSAm/tasks/Task.js').Task;
var Originate = require('../JaSAm/tasks/Originate.js').Originate;
var DNDOn = require('../JaSAm/tasks/DNDOn.js').DNDOn;
var DNDOff = require('../JaSAm/tasks/DNDOff.js').DNDOff;
var AsteriskEvent = require('../JaSAm/tasks/AsteriskEvent.js').AsteriskEvent;
var CallDetailRecord = require('../JaSAm/tasks/CallDetailRecord.js').CallDetailRecord;
var Tunnel = require('../JaSAm/tasks/Tunnel.js').Tunnel;
var NodeAjaxCall = require("./core/NodeAjaxCall.js").NodeAjaxCall;

var jaSAmApp = null;
var httpServer = null;
var options = {
    daemonFile: "log/nodeServer.dmn", 
    outFile: "log/nodeServer.out",
    errFile: "log/nodeServer.err",    
    onCrash: function(e){
        console.info("server crashed! Closing httpserver and restarting nodeServer now ...");
        httpServer.close();
        this.crashRestart();
    }
};

var authenticatedSessions = {};
var acceptableToken = 123456;

startStopDaemon(options, function() {

    jaSAmApp = new JaSAmApp("testmanager", "sehrsehrgeheim");
    var config = {};
    config[JaSAmApp.Configuration.baseUrl] =  "http://localhost:8088/asterisk/mxml";
    config[JaSAmApp.Configuration.autoLogin] =  true;
    config[JaSAmApp.Configuration.autoQueryEntities] =  true;
    config[JaSAmApp.Configuration.enableEventlistening] =  true;
    config[JaSAmApp.Configuration.enableEventBuffering] =  true;
    jaSAmApp.setConfiguration(config);

    var parser = require("libxml");
    jaSAmApp.getAsteriskManager().setParser(parser);

    var ajaxCall = new NodeAjaxCall();
    jaSAmApp.getAsteriskManager().setAjaxCall(ajaxCall);
    jaSAmApp.start(startServer, this);

});

function startServer(isSuccess){
    var now = new Date();
    if(!isSuccess){
        console.info(now.toString() + ": Fehler beim Starten der JaSAmApp!");
        return;
    }
    console.info(now.toString() + ": start server ...");
    httpServer = http.createServer(function (request, httpResponse) {
        try{

            var params = url.parse(request.url, true);
            var token = params['query']['token'];
            var extension = params['query']['extension'];
            
            var cookies = {};
            request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
                var parts = cookie.split('=');
                cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
            });

            if(params['pathname'] == "/login"){
                var username = params['query'].username;
                var secret = params['query'].secret;
                if(username == "testmanager" && secret == "sehrsehrgeheim"){
                    var nodeSessionId;
                    do{
                        nodeSessionId = Math.floor((Math.random()*1000000)+1000);    
                    }while(authenticatedSessions[nodeSessionId]);
                    
                     authenticatedSessions[nodeSessionId] = new Date();
                     var successMessage = "<ajax-response><response type='object' id='unknown'><generic response='Success' /></response></ajax-response>";
                    executeCallback(successMessage, httpResponse, {nodeSessionId: nodeSessionId});
                }else{
                    throw new Error("Access denied. Wrong username or secret.");
                }
                
            }else if(token !== undefined && token != acceptableToken){
                if(extension === undefined)
                    throw new Error("Param extension is missing.");
                
                switch(params['pathname']){
                    case "/originateCall":
                        var remoteNumber = params['query']['remoteNumber'];
                        if(remoteNumber === undefined)
                            throw new Error("Param remoteNumber is missing.");
                        execute(Originate, httpResponse, {
                            extension: extension, 
                            remoteNumber: remoteNumber
                        });
                        break;
                        
                    case "/doNotDisturbOn":
                        execute(DNDOn, httpResponse, {
                            extension: extension
                        });
                        break;
                        
                    case "/doNotDisturbOff":
                        execute(DNDOff, httpResponse, {
                            extension: extension
                        });
                        break;
                    default:
                        throw new Error("Page not found.");
                }
                
            }else if(authenticatedSessions[cookies.nodeSessionId]){
                //update array, for timeout
                authenticatedSessions[cookies.nodeSessionId] = new Date();
                
                switch(params['pathname']){
                    case "/asteriskEvent":
                        var lastResponseTime = params['query']['lastResponseTime'];
                        execute(AsteriskEvent, httpResponse, {
                            lastResponseTime: lastResponseTime,
                            nodeSessionId: cookies.nodeSessionId
                        });
                        break;
                        
                    case "/tunnel":
                        var urlParams = params['query'];
                        execute(Tunnel, httpResponse, {
                            urlParams: urlParams,
                            nodeSessionId: cookies.nodeSessionId
                        });
                        break;
                        
                    case "/callDetailRecord":
                        request.setEncoding("utf8");
                        request.addListener("data", function(postDataChunk) {
                            var postData = querystring.parse(postDataChunk);

                            var start = postData.start;
                            var limit = postData.limit;
                            var extension = postData.extension;
                            if(start === undefined)
                            start = 0;
                            if(limit === undefined)
                                limit = 20;

                            execute(CallDetailRecord, httpResponse, {
                                extension: extension,
                                start: start,
                                limit: limit,
                                mysql: mysql,
                                nodeSessionId: cookies.nodeSessionId
                            });
                        });
                        break;
                        
                    default:
                        throw new Error("Page not found.");
                }
            }else{
                throw new Error("Access denied.");
            }
                    
        }catch(exc){
            now = new Date();
            console.info(now.toString() + ": " + request.url +' Error: ' + exc.message);
            httpResponse.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            httpResponse.end('Error\n' + exc.message);
        }
    
    }).listen(5859);
    console.log('Server running at http://anyway:5859/');    
        
}

function execute(Task, httpResponse, args){
    (new Task(args, function(responseObj){executeCallback(responseObj, httpResponse, args);}, this, jaSAmApp.getAsteriskManager())).run();
}

function executeCallback(responseObj, httpResponse, args){
        var httpstatus = 200;
        var responseText = "";
        
        if(responseObj instanceof Exception){
            httpstatus = 500;
            responseText = responseObj.getMessage();
        }else if(responseObj){
            responseText = responseObj.toString();
        }
        
        if(args.nodeSessionId !== undefined)
            httpResponse.setHeader("Set-Cookie", ["nodeSessionId="+args.nodeSessionId]);
        httpResponse.writeHead(httpstatus, {
            'Content-Type': 'text/plain'
        });
        httpResponse.end(responseText);
}

function deleteSessions(){
    for(var i in authenticatedSessions){
        var lastRequestTime = authenticatedSessions[i];
        var timeout = 5*60*1000;// 5 minutes
        if(lastRequestTime.getTime() < (new Date()).getTime()-timeout ){
            delete authenticatedSessions[i];
        }
    }
    
    //restart after 60 seconds
    setTimeout(deleteSessions, 60 * 1000);
}
deleteSessions();