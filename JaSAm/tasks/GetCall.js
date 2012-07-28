var Action = require('../messages/Action.js').Action;
var Exception = require('../messages/Exception.js').Exception;
var Task = require('./Task.js').Task;

var GetCall = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var ringingExtension = args['ringingExtension'];
    var localUser = args['extension'];
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;
    
    this.run = function (){
        var extension = asteriskManager.entityManager.extensionManager.extensions[localUser];
        var channels = asteriskManager.entityManager.channelManager.channels;
        for(var channelKey in channels){
            var channel = channels[channelKey];
            if(channelKey == "remove" || channelKey == "indexOf")
                continue;
            // channel muss von übergebener extension sein
            if(channel.connectedlinenum != ringingExtension)
                continue;
            
            var action = asteriskManager.commander.createAction('redirect');
            action.params = {
                channel: channel.id, // channel to park
                Exten: extension.id,
                context: 'from-internal',
                priority: 1 
            };
            action.execute(getCallCallback, this);
            return;
        }
    };
    
    var getCallCallback = function(response){
        if(response.isSuccess()){
            callback.apply(scope, []);
        }else{
            callback.apply(scope, [new Exception("Error: " + response.head.message)]);            
        }        
    };

};
GetCall.prototype = new Task();

exports.GetCall = GetCall;