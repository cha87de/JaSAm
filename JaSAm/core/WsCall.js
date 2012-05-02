/**
 * 
 */

var WsCall = function(){
    
    var connection = null;
    var connectionUri = null;
    
    var callbackQueue = {};
    
    /**
     * 
     */
    this.createConnection = function(callback, scope){
        if(connection != null)
            return;
        
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        connection = new WebSocket(connectionUri);
        connection.onmessage = onmessage;
        connection.onopen = function(){
            callback.apply(scope, []);
        };
        connection.onerror = onerror;
    };
    
    /**
     * Handle incoming message
     */
    var onmessage = function(message){
        var responseObj = JSON.parse(message.data);
        var requestId = responseObj.requestId;
        
        var response = {responseText: responseObj.response};
        
        var callback = callbackQueue[requestId].callback;
        var scope = callbackQueue[requestId].scope;
        console.info(response);
        callback.apply(scope, [response]);
        
        delete callbackQueue[requestId];
    };
    
    var onerror = function(error){
        // TODO
        console.info('WsCall on error', error);
    };    
    
    /**
     * 
     */    
    this.serialize = function(obj) {
        return JSON.stringify(obj);
    };    
    
    /**
    * 
    * @param method <string> ...
    * @param uri <string> ...
    * @param params <object> ...
    * @param callback <function> ...
    * @param scope <object> ...
    * @return <void>
    */        
    this.request = function(method, uri, params, callback, scope){
        var requestId = Math.floor((Math.random()*9000000)+1000000);
        callbackQueue[requestId] = {scope: scope, callback: callback};        
        
        var data = this.serialize({requestId: requestId, params: params});

        if(connection == null){
            connectionUri = uri;
            this.createConnection(function(){
                connection.send(data);
            }, this);
        }else{
            connection.send(data);
        }
    };
    
};
WsCall.prototype = new AjaxCall();

exports.WsCall = WsCall;