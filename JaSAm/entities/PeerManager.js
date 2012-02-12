
var PeerManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.peers = {};
    
    this.handleEvent = function(responseItem){
        // TODO
        //console.info('peermanager handleEvent', responseItem);
        
        var event = new EntityEvent();
        //asteriskManager.entityManager.handleCollectedEvents(event);        
    };
    
    this.queryPeers = function(callback, scope){
        callback.apply(scope, []);
    };    
    
}
PeerManager.prototype = new ListenerHandler();