var http = require('http');
var url = require('url');
var startStopDaemon = require('start-stop-daemon');

var JaSAmApp = require('../JaSAm/JaSAmApp.js').JaSAmApp;
var Task = require('../JaSAm/tasks/Task.js').Task;
var Originate = require('../JaSAm/tasks/Originate.js').Originate;
var DNDOn = require('../JaSAm/tasks/DNDOn.js').DNDOn;
var DNDOff = require('../JaSAm/tasks/DNDOff.js').DNDOff;
var WaitEvent = require('../JaSAm/tasks/WaitEvent.js').WaitEvent;

startStopDaemon({daemonFile: "log/nodeServer.dmn", outFile: "log/nodeServer.out", errFile: "log/nodeServer.err"},function() {

    var jaSAmApp = new JaSAmApp("testmanager", "sehrsehrgeheim");
    var config = {};
    config[JaSAmApp.Configuration.baseUrl] =  "http://tel.rsu-hausverwalter.de/asterisk/mxml";
    config[JaSAmApp.Configuration.autoLogin] =  true;
    config[JaSAmApp.Configuration.autoQueryEntities] =  true;
    config[JaSAmApp.Configuration.enableEventlistening] =  true;
    config[JaSAmApp.Configuration.enableEventBuffering] =  true;
    jaSAmApp.setConfiguration(config);

    var parser = require("libxml");
    jaSAmApp.getAsteriskManager().setParser(parser);

    var NodeAjaxCall = require("./core/NodeAjaxCall.js").NodeAjaxCall;
    var ajaxCall = new NodeAjaxCall();
    jaSAmApp.getAsteriskManager().setAjaxCall(ajaxCall);
    jaSAmApp.start(startServer, this);

});

function startServer(isSuccess){
    if(!isSuccess){
        console.info("Fehler beim Starten der JaSAmApp!");
        return;
    }
    
    console.info("start server ...");
    http.createServer(function (req, httpResponse) {
        try{

            var params = url.parse(req.url, true);
        
            var token = params['query']['token'];
            if(token === undefined || token != 123456)
                throw new Error("Access denied.");
        
            var extension = params['query']['extension'];
                        
            if(params['pathname'] == "/originateCall"){
            
                var remoteNumber = params['query']['remoteNumber'];
                if(remoteNumber === undefined)
                    throw new Error("Param remoteNumber is missing.");

                if(extension === undefined)
                    throw new Error("Param extension is missing.");
            
                execute(Originate, httpResponse, {
                    extension: extension, 
                    remoteNumber: remoteNumber
                });
            }else if(params['pathname'] == "/doNotDisturbOn"){
                if(extension === undefined)
                    throw new Error("Param extension is missing.");

                execute(DNDOn, httpResponse, {
                    extension: extension
                });
            }else if(params['pathname'] == "/doNotDisturbOff"){
                if(extension === undefined)
                    throw new Error("Param extension is missing.");

                execute(DNDOff, httpResponse, {
                    extension: extension
                });
            }else if(params['pathname'] == "/waitEvent"){
                var lastResponseTime = params['query']['lastResponseTime'];
                execute(WaitEvent, httpResponse, {
                    lastResponseTime: lastResponseTime
                });
            }
        
        }catch(exc){
            console.info(req.url +' Error: ' + exc.message);
            httpResponse.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            httpResponse.end('Error\n' + exc.message);
        }
    
    }).listen(5859);
    console.log('Server running at http://anyway:5859/');    
        
}

function execute(Task, httpResponse, args){
    (new Task(args, function(text, httpstatus){
        if(httpstatus === undefined)
            httpstatus = 200;
        httpResponse.writeHead(httpstatus, {
            'Content-Type': 'text/plain'
        });
        httpResponse.end(text);
    }, this, jaSAmApp.getAsteriskManager())).run();
}
