var Action = require('../messages/Action.js').Action;
var Exception = require('../messages/Exception.js').Exception;
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
            var action = asteriskManager.commander.createAction('atxfer');
            action.params = {
                channel: channel.id,
                Exten: remoteNumber,
                context: 'from-internal',
                priority: 1 
            };
            action.execute(transferCallback, this);
        }
    };

    var transferCallback = function(response){
        if(response.isSuccess()){
            callback.apply(scope, []);
        }else{
            callback.apply(scope, [new Exception("Error: " + response.head.message)]);            
        }
    };

};
Transfer.prototype = new Task();

exports.Transfer = Transfer;