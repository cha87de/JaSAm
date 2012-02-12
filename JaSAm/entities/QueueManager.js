
var QueueManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.queues = {};
    
    this.handleEvent = function(responseItem){
        // TODO
        //console.info('queueManager handleEvent', responseItem);
        
        var event = new EntityEvent();
        //asteriskManager.entityManager.handleCollectedEvents(event);        
    };
    
    this.queryQueues = function(callback, scope){
        callback.apply(scope, []);
    };
    
}
QueueManager.prototype = new ListenerHandler();