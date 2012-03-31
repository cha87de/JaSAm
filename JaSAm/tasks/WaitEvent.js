var CallbackCollector = require('../utils/CallbackCollector.js').CallbackCollector;
var Action = require('../messages/Action.js').Action;
var Task = require('./Task.js').Task;

var WaitEvent = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;

    this.run = function (){
        asteriskManager.eventConnector.addListener(handleEvent, this);
    };
    
    var handleEvent = function(response){
        asteriskManager.eventConnector.removeListener(handleEvent);
        callback.apply(scope, [response[0].xmlData, 200]);
    };
    
};
WaitEvent.prototype = new Task();

exports.WaitEvent = WaitEvent;