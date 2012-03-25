var CallbackCollector = require('../utils/CallbackCollector.js').CallbackCollector;
var Action = require('../../JaSAm/messages/Action.js').Action;

var DNDOnTask = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;
    
    var agentId = 'SIP/' + asteriskManager.localUser;
    var taskCollector;

    this.run = function (){
        // load queues and agents
        var collector = new CallbackCollector(dndActivate, this);
        asteriskManager.entityManager.queueManager.queryQueues(collector.createCallback(), this);
        asteriskManager.entityManager.agentManager.queryAgents(collector.createCallback(), this);
        
        taskCollector = new CallbackCollector(taskFinished, this);
    };

    var dndActivate = function(){
        storeQueues();
        removeFromQueues();
        propagateUserEvent();
        storeDNDStatus();
    };

    var storeQueues = function(){
        var queues = asteriskManager.entityManager.queueManager.queues;

        var activeQueues = "";
        for(var i in queues){
            var queue = queues[i];
            if(queue.agents[agentId])
                activeQueues += queue.id + ":" + queue.agentPenalties[agentId] + ";";
        }
        
        if(activeQueues  != ""){
            var action = new Action(asteriskManager);
            action.name = 'dbput';
            action.params = {
                family: 'queuePenalties',
                key: agentId,
                val: activeQueues
            };
            action.execute(taskCollector.createCallback(), this);
        }
    };
    
    var removeFromQueues = function(){
        var queues = asteriskManager.entityManager.queueManager.queues;
        for(var i in queues){
            var queue = queues[i];
            if(queue.agentPenalties[agentId] !== undefined){
                var action = new Action(asteriskManager);
                action.name = "queueremove";
                action.params = {
                    queue: queue.id,
                    'interface': agentId
                };
                action.execute(taskCollector.createCallback(), this);
            }
        };
    };
    
    var storeDNDStatus = function(){
        var action = new Action(asteriskManager);
        action.name = 'dbput';
        action.params = {
            family: 'DND',
            key: asteriskManager.localUser,
            val: 'YES'
        };
        action.execute(taskCollector.createCallback(), this);
    };
    
    var propagateUserEvent = function(){
        var action = new Action(asteriskManager);
        action.name = "UserEvent";
        action.params = {
            UserEvent: 'dndOn',
            Header1: asteriskManager.localUser
        };
        action.execute(taskCollector.createCallback(), this);  
    };
    
    var taskFinished = function(isSuccess){
        var text;
        if(isSuccess){
            text = "";
            callback.apply(scope, [text, 200]);
        }else{
            text = "";
            callback.apply(scope, [text, 500]);            
        }
    };
    
};

exports.DNDOnTask = DNDOnTask;