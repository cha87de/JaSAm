var Entity = require('../entities/Entity.js').Entity;

var Agent = function(id, asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.type = Entity.Types.Agent;
    
    this.id = id;
    this.name = null;
    this.status = null;

    this.hasQueues = function(){
        return this.getQueues().length > 1;
    };
    
    this.getQueues = function(){
        var result = [];
        try{
            var queues = asteriskManager.entityManager.queueManager.queues;
            for(var queueKey in queues){
                var queue = queues[queueKey];
                if(queue.agents[this.id])
                    result.push(queue);
            }
        }catch(exc){ }
        return result;        
    };
    
    this.getPeer = function(){
        try{
            return asteriskManager.entityManager.peerManager.peers[this.id];
        }catch(exc){
            return null;
        }        
    };
    
};
Agent.prototype = new Entity();

Agent.State = {
    AGENT_LOGGEDOFF: 'AGENT_LOGGEDOFF',
    unknown: 'unknown'
    // more?
};

Agent.prototype.toString = function(){
    return 'Name: ' + this.name + ', Status: ' + this.status;
};

exports.Agent = Agent;
