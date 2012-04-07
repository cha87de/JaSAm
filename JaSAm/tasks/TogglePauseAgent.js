var CallbackCollector = require('../utils/CallbackCollector.js').CallbackCollector;
var Action = require('../messages/Action.js').Action;
var Exception = require('../messages/Exception.js').Exception;
var Task = require('./Task.js').Task;

var TogglePauseAgent = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;
    
    var agentId = 'SIP/' + args['extension'];
    var paused = null;
    
    this.run = function (){
        var agent = asteriskManager.entityManager.agentManager.agents[agentId];
        paused = !agent.paused;
        var action = asteriskManager.commander.createAction('queuepause');
        action.params = {
            'interface': agentId,
            paused: paused
        };
        action.execute(transferCallback, this);
    };
    
    var transferCallback = function(response){
        if(response.isSuccess()){
            callback.apply(scope, []);
        }else{
            var status = paused ? "aktivieren" : "deaktivieren"; 
            var exc = new Exception("Fehler beim " + status + " des Pause-Zustands von Agent " + agentId);
            callback.apply(scope, [exc]);
        }
    };    
   
};
TogglePauseAgent.prototype = new Task();

exports.TogglePauseAgent = TogglePauseAgent;