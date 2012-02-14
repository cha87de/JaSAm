
var QueueManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.queues = {};
    
    this.handleEvent = function(responseItem){
        var queue = null;
        var id = null;
        var eventType = EntityEvent.Types.unknown;

        if(responseItem.name == 'QueueMemberRemoved'){
            id = responseItem.content.queue;
            if(!this.queues[id]){
                // not possible
                return;
            }
            queue = this.queues[id];
            queue.loggedIn = parseInt(queue.loggedIn)-1;
            queue.available = parseInt(queue.available)-1;
        }else if(responseItem.name == 'QueueMemberAdded'){
            id = responseItem.content.queue;
            if(!this.queues[id]){
                // not possible
                return;
            }
            queue = this.queues[id];
            queue.loggedIn = parseInt(queue.loggedIn)+1;
            queue.available = parseInt(queue.available)+1;            
        }else{
            console.warn('unknown channel state' , responseItem.name);
        }
        var event = new EntityEvent(eventType, queue);
        asteriskManager.entityManager.handleCollectedEvents(event);
        this.propagate(event);   
    };
    
    this.queryQueues = function(callback, scope){
        var action = new Action(asteriskManager);
        action.name = 'queuesummary';
        action.execute(function(response){
            this.queues = {};
            for(var queueentryKey in response.body){
                var queueentry = response.body[queueentryKey].content;
                var id = queueentry.queue;
                var queue = new Queue(id);
                queue.available = queueentry.available;
                queue.loggedIn = queueentry.loggedin;
                queue.callers = queueentry.callers;
                this.queues[id] = queue;
            }
            
            callback.apply(scope, []);
        }, this);
    };
    
}
QueueManager.prototype = new ListenerHandler();