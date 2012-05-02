var Exception = require('../../JaSAm/messages/Exception.js').Exception;
var Task = require('../../JaSAm/tasks/Task.js').Task;
var AsteriskEvent = require('../../JaSAm/tasks/AsteriskEvent.js').AsteriskEvent;
var Tunnel = require('../../JaSAm/tasks/Tunnel.js').Tunnel;

var SocketWorker = function(jaSAmAppParam, connectionParam){
    var jaSAmApp = jaSAmAppParam;
    var connection = connectionParam;

    var authenticated = false;
    var validLogin = {username: 'testmanager', secret: 'sehrsehrgeheim'};
    
    this.work = function(message){
        try{
            if (message.type !== 'utf8') {
                return;
            }

            var requestObj = JSON.parse(message.utf8Data);
            var responseObj = {requestId: requestObj.requestId, response: ''};
        }catch(exc){
            // fatal error, ignore request
        }
        
            // Catch following Actions: login, logout, waitevent. Else: tunnel to asteriskServer
        try{
            if(requestObj.params.action == "login"){
                // check username and secret

                var username = requestObj.params.username;
                var secret = requestObj.params.secret;

                if(username == validLogin.username && secret == validLogin.secret){
                    authenticated = true;
                    responseObj.response = "<ajax-response><response type='object' id='unknown'><generic response='Success' /></response></ajax-response>";
                    send(responseObj);
                }else{
                    throw new Error("Access denied. Wrong username or secret.");
                }
            }else{

                if(authenticated != true){
                    // not authenticated, not acceptable!
                    throw new Error("Access denied.");
                }

                if(requestObj.params.action == "logout"){
                    authenticated = false;
                    responseObj.response = "<ajax-response><response type='object' id='unknown'><generic response='Success' /></response></ajax-response>";
                    send(responseObj);
                }else if(requestObj.params.action == "waitevent"){
                    // use special waitevent implementation
                    var taskParamsEvent = {
                        lastResponseTime: requestObj.params['lastResponseTime']
                    };
                    var taskCallbackEvent = function(taskResponse){
                        executeCallback(taskResponse, responseObj);
                    };                
                    var asteriskEvent = new AsteriskEvent(taskParamsEvent, taskCallbackEvent, this, jaSAmApp.getAsteriskManager());
                    asteriskEvent.run();
                }else{
                    // tunnel request, forward to asteriskServer
                    var taskParamsTunnel = {
                        urlParams: requestObj.params
                    }                    
                    var taskCallbackTunnel = function(taskResponse){
                        executeCallback(taskResponse, responseObj);
                    };
                    var tunnel = new Tunnel(taskParamsTunnel, taskCallbackTunnel, this, jaSAmApp.getAsteriskManager());
                    tunnel.run();                
                }
            }
        }catch(exc){
            console.info((new Date()) + ': Error: ' + exc.message);
            responseObj.response = 'Error\n' + exc.message;
            send(responseObj);
        }
    };
    
    var executeCallback = function (taskResponse, wsResponse){
        var responseText = "";
        if(taskResponse instanceof Exception){
            responseText = taskResponse.getMessage();
        }else if(taskResponse){
            responseText = taskResponse.toString();
        }
        wsResponse.response = responseText;
        send(wsResponse);
    };    
    
    var send = function(response){
        connection.sendUTF(JSON.stringify(response));
    };
};

exports.SocketWorker = SocketWorker;