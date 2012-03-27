
var Transfer = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var remoteNumber = args['remoteNumber'];
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;
    
    this.run = function (){
        var extension = asteriskManager.entityManager.extensionManager.extensions[asteriskManager.localUser];
        var channels = extension.getChannels();
        for(var channelKey in channels){
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
            text = "Call transferred " +asteriskManager.localUser + " to extension " + remoteNumber + ".";
            callback.apply(scope, [text, 200]);
        }else{
            text = "Error: " + response.head.message;
            callback.apply(scope, [text, 500]);
        }
    };

};

exports.Transfer = Transfer;