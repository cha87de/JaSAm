var Task = require('./Task.js').Task;

var Tunnel= function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;

    this.run = function (){
        asteriskManager.ajaxCall.request("GET", asteriskManager.baseUrl, args.urlParams, handleEvent, this);
    };
    
    var handleEvent = function(response){
        callback.apply(scope, [response.responseText]);
    };
    
};
Tunnel.prototype = new Task();

exports.Tunnel = Tunnel;