var Task = require('./Task.js').Task;

var Tunnel= function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;
    var ajaxCall = args.ajaxCall;

    this.run = function (){
        ajaxCall.request("GET", asteriskManager.baseUrl, args.urlParams, handleEvent, this);
    };
    
    var handleEvent = function(response){
        callback.apply(scope, [response[0].xmlData]);
    };
    
};
Tunnel.prototype = new Task();

exports.Tunnel = Tunnel;