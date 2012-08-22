var ListenerHandler = require('../core/ListenerHandler.js').ListenerHandler;
var Queue = require('../entities/Queue.js').Queue;
var EntityEvent = require('../entities/EntityEvent.js').EntityEvent;
var Action = require('../messages/Action.js').Action;
    
var QueueManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.queues = {};
    
    this.handleEvent = function(responseItem){
        var queue = null;
        var id = null;
        var agentId = null
        var eventType = EntityEvent.Types.Update;

        if(responseItem.name == 'QueueMemberRemoved'){
            id = responseItem.content.queue;
            if(!this.queues[id]){
                // not possible
                return;
            }
            queue = this.queues[id];
            queue.loggedIn = parseInt(queue.loggedIn)-1;
            queue.available = parseInt(queue.available)-1;
            
            agentId = responseItem.content.location;
       
            // update agent
            asteriskManager.entityManager.agentManager.handleEvent(responseItem);
            delete queue.agents[agentId];
            delete queue.agentPenalties[agentId];
        }else if(responseItem.name == 'QueueMemberAdded'){
            id = responseItem.content.queue;
            if(!this.queues[id]){
                // not possible
                return;
            }
            queue = this.queues[id];
            queue.loggedIn = parseInt(queue.loggedIn)+1;
            queue.available = parseInt(queue.available)+1;        

            agentId = responseItem.content.location;

            // update agent
            asteriskManager.entityManager.agentManager.handleEvent(responseItem);
            queue.agents[agentId] = asteriskManager.entityManager.agentManager.agents[agentId];
            queue.agentPenalties[agentId] = responseItem.content.penalty;
        }else if(responseItem.name == 'QueueMemberPenalty'){
            id = responseItem.content.queue;
            if(!this.queues[id]){
                // not possible
                return;
            }
            queue = this.queues[id];
            agentId = responseItem.content.location;
            queue.agentPenalties[agentId] = responseItem.content.penalty;            
        }else if(responseItem.name == 'QueueMemberPaused'){
            id = responseItem.content.queue;
            if(!this.queues[id]){
                // not possible
                return;
            }
            queue = this.queues[id];
            
            agentId = responseItem.content.location;
            
            if(!queue.agents[agentId]){
                queue.agents[agentId] = new Agent(agentId, asteriskManager);
                eventType = EntityEvent.Types.New;
            }else{
                eventType = EntityEvent.Types.Update;
            }
            queue.agents[agentId].paused = ifDefined(responseItem.content.paused);
        }else{
            BasicManager.print('unknown queue state' , responseItem.name);
        }
        var event = new EntityEvent(eventType, queue);
        asteriskManager.entityManager.handleCollectedEvents(event);
        this.propagate(event);
    };
    
    this.queryQueues = function(callback, scope){
        var action = new Action(asteriskManager);
        action.name = 'queuesummary';
        action.execute(function(response){
            //this.queues = {};
            if(response.isSuccess()){
                for(var queueentryKey in response.body){
                    if(queueentryKey == "remove")
                        continue;
                    var queueentry = response.body[queueentryKey].content;
                    var id = queueentry.queue;
                    if(!this.queues[id]){
                        this.queues[id] = new Queue(id);
                    }
                    var queue = this.queues[id];                
                    queue.available = queueentry.available;
                    queue.loggedIn = queueentry.loggedin;
                    queue.callers = queueentry.callers;

                    this.queues[id] = queue;
                }
            }else{
                console.warn(response);
                console.warn(response.xmlData);
            }
            
            callback.apply(scope, []);
        }, this);
    };
    
    this.addAgent = function(queueId, agent, penalty){
        if(!this.queues[queueId])
            this.queues[queueId] = new Queue(queueId);
        var queue = this.queues[queueId];
        queue.agents[agent.id] = agent;
        queue.agentPenalties[agent.id] = ifDefined(penalty);
    };
    
}
QueueManager.prototype = new ListenerHandler();

exports.QueueManager = QueueManager;
