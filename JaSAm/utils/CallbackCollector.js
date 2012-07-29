var Response = require('../../JaSAm/messages/Response.js').Response;

var CallbackCollector = function(callbackParam, scopeParam){
    var callbacks = {};
    var count = 0;
    var isSuccess = true;
    
    this.createCallback = function(callback, scope){
        var fakeCallback = function(){
            if(callback)
                callback.apply(scope, arguments);
            reduceCallback(fakeCallback, arguments);
        };
        callbacks[count] = fakeCallback;
        count++;
        return fakeCallback;
    };
    
    var reduceCallback = function(callback, args){
        count--;
        delete callbacks[callback];
        if(args.length > 0 && args[0] instanceof Response)
            isSuccess = isSuccess && args[0].isSuccess();

        if(count == 0)
            callbackParam.apply(scopeParam, [isSuccess]);
    };
    
    this.cancel = function(isSuccess){
        count = -1;
        callbackParam.apply(scopeParam, [isSuccess]);
    }
    
};

exports.CallbackCollector = CallbackCollector;