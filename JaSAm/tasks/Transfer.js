var Action = require('../messages/Action.js').Action;
var Task = require('./Task.js').Task;

var Transfer = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var remoteNumber = args['remoteNumber'];
    var localUser = args['extension'];
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;

    this.run = function(){
        var extension = asteriskManager.entityManager.extensionManager.extensions[localUser];
        var channels = extension.getPeer().getChannels();
        for(var channelKey in channels){
            if(channelKey == "remove")
                continue;
            
            var channel = channels[channelKey];
            var action = asteriskManager.commander.createAction('redirect');
            action.params = {
                channel: channel.bridgedChannelId,
                Exten: remoteNumber,
                context: 'from-internal',
                priority: 1 
            };
            action.execute(transferCallback, this);
        }
    };

    var transferCallback = function(response){
        var text;
        if(response.isSuccess()){
            text = "Call transferred " +localUser + " to extension " + remoteNumber + ".";
            callback.apply(scope, [text, 200]);
        }else{
            text = "Error: " + response.head.message;
            callback.apply(scope, [text, 500]);
        }
    };

};
Transfer.prototype = new Task();

exports.Transfer = Transfer;