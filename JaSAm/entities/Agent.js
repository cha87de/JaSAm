
var Agent = function(id){
    
    this.type = Entity.Types.Agent;
    
    this.id = id;
    this.name = null;
    this.status = null;

    this.queues = {};
    
    this.hasQueues = function(){
        for(var q in this.queues){
            return true;
        }
        return false;
    }
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