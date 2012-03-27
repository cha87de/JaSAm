var ListenerHandler = require('../core/ListenerHandler.js').ListenerHandler;
var EntityEvent = require('../entities/EntityEvent.js').EntityEvent;
var Agent = require('../entities/Agent.js').Agent;
var Action = require('../messages/Action.js').Action;

var AgentManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.agents = {};
    
    this.handleEvent = function(responseItem){
        var agent = null;
        var id = null;
        var eventType = EntityEvent.Types.unknown;

        if(responseItem.name == 'QueueMemberRemoved'){
            id = responseItem.content.location;
            if(!this.agents[id]){
                // not possible
                return;
            }else{
                eventType = EntityEvent.Types.Update;
            }
            
            agent = this.agents[id];
            
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
                this.agents[id] = new Agent(id, asteriskManager);
                eventType = EntityEvent.Types.New;
            }else{
                eventType = EntityEvent.Types.Update;
            }

            agent = this.agents[id];

            agent.name = ifDefined(responseItem.content.membername);
            agent.status = ifDefined(responseItem.content.status);            
        }else{
            BasicManager.print('unknown agent state' , responseItem.name);
        }
        var event = new EntityEvent(eventType, agent);
        asteriskManager.entityManager.handleCollectedEvents(event);
        this.propagate(event);
    };
    
    this.queryAgents = function(callback, scope){
        var action = new Action(asteriskManager);
        action.name = 'queuestatus';
        action.execute(function(response){
            for(var agententryKey in response.body){
                if(agententryKey == "remove")
                    continue;
                if(response.body[agententryKey].name == "QueueParams")
                    continue;
                var agententry = response.body[agententryKey].content;
                var id = agententry.location;

                if(!this.agents[id]){
                    this.agents[id] = new Agent(id, asteriskManager);
                }
                var agent = this.agents[id];
                agent.name = ifDefined(agententry.name);
                agent.status = ifDefined(agententry.status);

                // add agent to queue
                var queueId = agententry.queue;
                asteriskManager.entityManager.queueManager.addAgent(queueId, agent, agententry.penalty);
                
            }
            
            callback.apply(scope, []);
        }, this);
    };

}
AgentManager.prototype = new ListenerHandler();

exports.AgentManager = AgentManager;
