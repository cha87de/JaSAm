var CallbackCollector = require('../utils/CallbackCollector.js').CallbackCollector;
var Action = require('../../JaSAm/messages/Action.js').Action;

var DNDOffTask = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;
    
    var agentId = 'SIP/' + asteriskManager.localUser;
    var taskCollector;

    this.run = function (){
        // load queues and agents
        var collector = new CallbackCollector(dndActivate, this);
        asteriskManager.entityManager.queueManager.queryQueues(collector.createCallback());
        asteriskManager.entityManager.agentManager.queryAgents(collector.createCallback());
        
        taskCollector = new CallbackCollector(taskFinished, this);
    };

    var dndActivate = function(){
        loadQueues();
        propagateUserEvent();
        removeDNDStatus();
    };

    var loadQueues = function(){
        var action = new Action(asteriskManager);
        action.name = 'dbget';
        action.params = {
            family: 'queuePenalties',
            key: agentId
        };
        action.execute(loadQueuesCallback, this);
    };
    
    var loadQueuesCallback = function(response){
        if(response && response.body && response.body[0] && response.body[0].content){
            if(!response.isSuccess()){
                taskFinished(false);
                return;
            }

            var queuePenalties = {};
            var value = response.body[0].content.val;
            var queuePair = value.split(";");
            for(var i in queuePair){
                var queuePairValues = queuePair[i].split(":");
                var queueId = queuePairValues[0];
                var penalty = queuePairValues[1];
                queuePenalties[queueId] = penalty;
            }
            addToQueues(queuePenalties);
            removeQueues();
        }
    };
    
    var addToQueues = function(queuePenalties){
        for(var queueId in queuePenalties){
            var action = new Action(asteriskManager);
            action.name = "queueadd";
            action.params = {
                queue: queueId,
                'interface': agentId,
                penalty: queuePenalties[queueId]
            };
            action.execute(taskCollector.createCallback(), this);
        }
    };
    
    var removeQueues = function(){
        var action = new Action(asteriskManager);
        action.name = 'dbdel';
        action.params = {
            family: 'queuePenalties',
            key: agentId
        };
        action.execute(taskCollector.createCallback(), this);
    };
    
    var removeDNDStatus = function(){
        var action = new Action(asteriskManager);
        action.name = 'dbdel';
        action.params = {
            family: 'DND',
            key: asteriskManager.localUser
        };
        action.execute(taskCollector.createCallback(), this);
    };
    
    var propagateUserEvent = function(){
        var action = new Action(asteriskManager);
        action.name = "UserEvent";
        action.params = {
            UserEvent: 'dndOff',
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

exports.DNDOffTask = DNDOffTask;