var http = require('http');
var url = require('url');

var JaSAmApp = require('./JaSAmApp.js').JaSAmApp;
var OriginateTask = require('./tasks/OriginateTask.js').OriginateTask;
var DNDOnTask = require('./tasks/DNDOnTask.js').DNDOnTask;
var DNDOffTask = require('./tasks/DNDOffTask.js').DNDOffTask;


http.createServer(function (req, httpResponse) {
    try{

        var params = url.parse(req.url, true);
        
        var token = params['query']['token'];
        if(token === undefined || token != 123456)
            throw new Error("Access denied.");
    
        var extension = params['query']['extension'];
        if(extension === undefined)
            throw new Error("Param extension is missing.");
        
        if(params['pathname'] == "/originateCall"){
            
            var remoteNumber = params['query']['remoteNumber'];
            if(remoteNumber === undefined)
                throw new Error("Param remoteNumber is missing.");
            
            execute(OriginateTask, httpResponse, {extension: extension, remoteNumber: remoteNumber});
        }else if(params['pathname'] == "/doNotDisturbOn"){
            execute(DNDOnTask, httpResponse, {extension: extension});
        }else if(params['pathname'] == "/doNotDisturbOff"){
            execute(DNDOffTask, httpResponse, {extension: extension});
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

function execute(task, httpResponse, args){
    var app = new JaSAmApp("testmanager", "sehrsehrgeheim", "/asterisk/mxml", task, args, function(text, httpstatus){
        if(httpstatus === undefined)
            httpstatus = 200;
        httpResponse.writeHead(httpstatus, {
            'Content-Type': 'text/plain'
        });
        httpResponse.end(text);
        app.close();
    }, this);
}
