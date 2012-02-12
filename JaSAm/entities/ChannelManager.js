
var ChannelManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.channels = {};
    
    this.handleEvent = function(responseItem){
        // TODO
        //console.info('channelManager handleEvent', responseItem);
        
        var event = new EntityEvent();
        //asteriskManager.entityManager.handleCollectedEvents(event);
    };
    
    this.queryChannels = function(callback, scope){
        callback.apply(scope, []);
    };
    
}
ChannelManager.prototype = new ListenerHandler();