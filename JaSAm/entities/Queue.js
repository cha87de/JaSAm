
var Queue = function(id, asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.type = Entity.Types.Queue;

    this.id = id;
    this.loggedIn = null;
    this.available = null;
    this.callers = null;
    
    this.agents = {};
    this.agentPenalties = {};
    
    this.getAgents = function(){
        var agents = [];
        for(var agentKey in this.agents){
            var agent = this.agents[agentKey];
            agents.push(agent);
        }
        var self = this;
        var sortAgents = function(a, b){
            var ap = self.agentPenalties[a.id]
            var bp = self.agentPenalties[b.id]
            return ap-bp;
        };
        agents.sort(sortAgents);

        return agents;
    };
    
};
Queue.prototype = new Entity();
Queue.prototype.toString = function(){
    return 'LoggedIn: ' + this.loggedIn + ', Available: ' + this.available + ', callers: ' + this.callers;
};