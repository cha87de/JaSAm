var url = require('url');
var querystring = require('querystring');
var Exception = require('../../JaSAm/messages/Exception.js').Exception;
var Task = require('../../JaSAm/tasks/Task.js').Task;
var Originate = require('../../JaSAm/tasks/Originate.js').Originate;
var CallDetailRecord = require('../tasks/CallDetailRecord.js').CallDetailRecord;

var ClassicWorker = function(jaSAmAppParam){
    var jaSAmApp = jaSAmAppParam;
    
    var workerUris = { }; // String URI -> function
    var validToken = 123456;
    
    this.work = function(request, response){
        try{
            
            var params = url.parse(request.url, true);
            var path = params['pathname'].replace(/\//gi, "");
            console.info("incoming http request for path " + path);
            
            var token = params['query']['token'];

            if(token != validToken){
                throw new Error("Access denied.");
            }

            if(path != undefined && workerUris[path]){
                workerUris[path](request, response, params);
            }else{
                throw new Error("Page not found.");
            }
        }catch(exc){
            console.info((new Date()) + ": " + params['pathname'] +' Error: ' + exc.message);
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            response.end('Error\n' + exc.message);
        }
    };
    
    workerUris['originateCall'] = function(request, response, params){
        var extension = params['query']['extension'];
        if(extension === undefined)
            throw new Error("Param extension is missing.");

        var remoteNumber = params['query']['remoteNumber'];
        if(remoteNumber === undefined)
            throw new Error("Param remoteNumber is missing.");

        var originatorNumber = params['query']['originatorNumber'];
        
        var taskParams = {
            extension: extension, 
            remoteNumber: remoteNumber,
            originatorNumber: originatorNumber
        };
        var taskCallback = function(responseObj){executeCallback(responseObj, response);};
        var task = new Originate(taskParams, taskCallback, this, jaSAmApp.getAsteriskManager());
        task.run();

        var doNotWait = params['query']['doNotWait'];
        if(doNotWait !== undefined)
            executeCallback("", response);
    };

    workerUris['callDetailRecord'] = function(request, response, params){
        request.setEncoding("utf8");
        // HTTP-Method POST! Get incoming data
        request.addListener("data", function(postDataChunk) {
            var postData = querystring.parse(postDataChunk);

            var start = postData.start;
            var limit = postData.limit;
            var extension = postData.extension;
            if(start === undefined)
                start = 0;
            if(limit === undefined)
                limit = 20;

            var taskParams = {
                extension: extension,
                start: start,
                limit: limit
            };
            var taskCallback = function(responseObj){
                executeCallback(responseObj, response);
            };
            var task = new CallDetailRecord(taskParams, taskCallback, this, jaSAmApp.getAsteriskManager());
            task.run();
            
        });
    };
    
    workerUris['sendMessage'] = function(request, response, params){
        var password = params['query']['password'];
        if(password === undefined || password != "123geheim")
            throw new Error("Param password is wrong.");

        var message = params['query']['message'];
        if(message === undefined)
            throw new Error("Param message is missing.");

        // Send Message through SocketServer
        for(var i = 0; i<socketServerWorker.length; i++){
            var worker = socketServerWorker[i];
            worker.sendMessage(message);
        }

        executeCallback("", response);
    };    
    
    var executeCallback = function (responseObj, httpResponse){
        var httpstatus = 200;
        var responseText = "";
        
        if(responseObj instanceof Exception){
            httpstatus = 500;
            responseText = responseObj.getMessage();
        }else if(responseObj){
            responseText = responseObj.toString();
        }

        httpResponse.writeHead(httpstatus, {
            'Content-Type': 'text/plain'
        });
        httpResponse.end(responseText);
    };
    
};
exports.ClassicWorker = ClassicWorker;