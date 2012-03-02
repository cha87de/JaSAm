
var AgentManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.agents = {};
    
    this.handleEvent = function(responseItem){
        var agent = null;
        var id = null;
        var queueId = null
        var queue = null;
        var eventType = EntityEvent.Types.unknown;

        if(responseItem.name == 'QueueMemberRemoved'){
            id = responseItem.content.location;
            if(!this.agents[id]){
                // not possible
                return;
            }else{
                eventType = EntityEvent.Types.Update;
            }
            
            queueId = responseItem.content.queue;
            queue = asteriskManager.entityManager.queueManager.queues[queueId];
            agent = this.agents[id];
            
            delete agent.queues[queueId];
            agent.name = ifDefined(responseItem.content.membername);
            agent.status = ifDefined(responseItem.content.status);       
            
            // remove agent if there are no queues attached
            if(!agent.hasQueues()){
                delete this.agents[agent.id];
                eventType = EntityEvent.Types.Remove;
            }
        }else if(responseItem.name == 'QueueMemberAdded'){
            id = responseItem.content.location;
            if(!this.agents[id]){
                this.agents[id] = new Agent(id);
                eventType = EntityEvent.Types.New;
            }else{
                eventType = EntityEvent.Types.Update;
            }

            queueId = responseItem.content.queue;
            queue = asteriskManager.entityManager.queueManager.queues[queueId];
            agent = this.agents[id];

            agent.queues[queueId] = queue;
            agent.name = ifDefined(responseItem.content.membername);
            agent.status = ifDefined(responseItem.content.status);            
        }else{
            console.warn('unknown agent state' , responseItem.name);
        }
        var event = new EntityEvent(eventType, agent);
        asteriskManager.entityManager.handleCollectedEvents(event);
        this.propagate(event);
    };
    
    this.queryAgents = function(callback, scope){
        var action = new Action(asteriskManager);
        action.name = 'queuestatus';
        action.execute(function(response){
            //this.agents = {};
            for(var agententryKey in response.body){
                if(response.body[agententryKey].name == "QueueParams")
                    continue;
                var agententry = response.body[agententryKey].content;
                var id = agententry.location;
                console.info(agententry);
                if(!this.agents[id]){
                    this.agents[id] = new Agent(id);
                }
                var agent = this.agents[id];
                agent.name = ifDefined(agententry.name);
                agent.status = ifDefined(agententry.status);

                var queueId = agententry.queue;
                if(!asteriskManager.entityManager.queueManager.queues[queueId])
                    asteriskManager.entityManager.queueManager.queues[queueId] = new Queue(queueId);
                var queue = asteriskManager.entityManager.queueManager.queues[queueId];
                
                // add queue to agent
                agent.queues[queueId] = queue;
                // add agent to queue
                queue.agents[id] = agent;
                
                this.agents[id] = agent;
            }
            
            callback.apply(scope, []);
        }, this);
    };

}
AgentManager.prototype = new ListenerHandler();