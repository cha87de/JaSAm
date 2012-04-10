var CallbackCollector = require('../utils/CallbackCollector.js').CallbackCollector;
var Action = require('../messages/Action.js').Action;
var Exception = require('../messages/Exception.js').Exception;
var Task = require('./Task.js').Task;

var ChangePenalty = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;
    
    var agentId = 'SIP/' + args['extension'];
    var queueId = args['queue'];
    var increase = args['increase'];
    
    this.run = function (){
        var queue = asteriskManager.entityManager.queueManager.queues[queueId];
        var sortedAgents = queue.getAgents();
        
        var agentIndex = null;
        for(var index in sortedAgents){
            if(index == "remove")
                continue;
            if(sortedAgents[index].id == agentId){
                agentIndex = index*1;
                break;
            }
        }
        if(agentIndex === null && increase)
            //agent not in queue => add to queue with highest penalty
            return addAgent();
        else if(agentIndex === null && !increase)
            //agent not in queue => dont add, do nothing
            return;
        
        var swapAgent = null;
        if(increase){
            if(!sortedAgents[agentIndex-1])
                //allready on highest level => do nothing
                return;
            swapAgent = sortedAgents[agentIndex-1];
        }else{
            if(!sortedAgents[agentIndex+1])
                //agent is last => remove from queue
                return removeAgent();
            swapAgent = sortedAgents[agentIndex+1];
        }
        return swapAgents(swapAgent);
    };

    var addAgent = function(){
        var agentPenalty = 1;
        var queue = asteriskManager.entityManager.queueManager.queues[queueId];
        var sortedAgents = queue.getAgents();
        if(sortedAgents.length > 0){
            var highestAgentId = sortedAgents[sortedAgents.length-1].id;
            agentPenalty = queue.agentPenalties[highestAgentId]*1 + 1;
        }
        
        var action = new Action(asteriskManager);
        action.name = 'queueadd';
        action.params = {
            queue: queueId,
            'interface': agentId,
            penalty: agentPenalty
        };
        action.execute(transferCallback, this);
    };
    
    var removeAgent = function(){
        var action = new Action(asteriskManager);
        action.name = 'queueremove';
        action.params = {
            queue: queueId,
            'interface': agentId
        };
        action.execute(transferCallback, this);
    };
    
    var swapAgents = function(swapAgent){
        var callbackCollector = new CallbackCollector(transferCallback, this);
        var queue = asteriskManager.entityManager.queueManager.queues[queueId];
        var agentPenalties = queue.agentPenalties;
        var agentPenalty = agentPenalties[agentId];
        var swapAgentPenalty = agentPenalties[swapAgent.id];

        var action = new Action(asteriskManager);
        action.name = 'queuepenalty';
        action.params = {
            queue: queueId,
            'interface': agentId,
            penalty: swapAgentPenalty
        };
        action.execute(callbackCollector.createCallback, this);
        
        var action2 = new Action(asteriskManager);
        action2.name = 'queuepenalty';
        action2.params = {
            queue: queueId,
            'interface': swapAgent.id,
            penalty: agentPenalty
        };
        action2.execute(callbackCollector.createCallback, this);
    };
    
    var transferCallback = function(response){
        if(response.isSuccess()){
            callback.apply(scope, []);
        }else{
            var exc = new Exception("Fehler beim Ändern der Schleifen-Position von Agent " + agentId + " in Schleife " + queueId);
            callback.apply(scope, [exc]);
        }
    };    
   
};
ChangePenalty.prototype = new Task();

exports.ChangePenalty = ChangePenalty;