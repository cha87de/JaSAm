var url = require('url');
var querystring = require('querystring');
var Exception = require('../../../framework/messages/Exception.js').Exception;
var Task = require('../../../framework/tasks/Task.js').Task;
var Originate = require('../../../framework/tasks/Originate.js').Originate;
var CallDetailRecord = require('../tasks/CallDetailRecord.js').CallDetailRecord;
var Action = require('../../../framework/messages/Action.js').Action;

var ClassicWorker = function(jaSAmAppParam, validToken, mysqlLogin){
    var jaSAmApp = jaSAmAppParam;
    
    var workerUris = { }; // String URI -> function
    
    this.work = function(request, response){
        try{
            var params = url.parse(request.url, true);
            var path = params['pathname'].replace(/\//gi, "");
            
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

    // extracts call history of freepbx mysql database
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
                limit: limit,
                mysqlLogin: mysqlLogin
            };
            var taskCallback = function(responseObj){
                executeCallback(responseObj, response);
            };
            var task = new CallDetailRecord(taskParams, taskCallback, this, jaSAmApp.getAsteriskManager());
            task.run();
            
        });
    };
    
    workerUris['sendMessage'] = function(request, response, params){
        var message = params['query']['message'];
        if(message === undefined)
            throw new Error("Param message is missing.");

        var action = new Action(jaSAmApp.getAsteriskManager());
        action.name = "UserEvent";
        action.params = {
            UserEvent: 'message',
            Header1: message
        };
        
        action.execute(function(){
            executeCallback("", response);
        }, this);
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