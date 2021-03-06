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
        if(agent === undefined){
            var exc = new Exception("Agent (" + agentId + ") ist in keiner Schleife!");
            callback.apply(scope, [exc]);
        }else{
            paused = agent.paused==1 ? 0:1;
            var action = asteriskManager.commander.createAction('queuepause');
            action.params = {
                'interface': agentId,
                paused: paused
            };
            action.execute(togglePauseCallback, this);                
        }
    };
    
    var togglePauseCallback = function(response){
        if(response.isSuccess()){
            callback.apply(scope, []);
        }else{
            var status = paused ? "Aktivieren" : "Deaktivieren"; 
            var exc = new Exception("Fehler beim " + status + " des Pause-Zustands von Agent " + agentId);
            callback.apply(scope, [exc]);
        }
    };    
   
};
TogglePauseAgent.prototype = new Task();

exports.TogglePauseAgent = TogglePauseAgent;