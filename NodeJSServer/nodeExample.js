/*
 * nodejs example
 * toggles queue 40 for extension 47
 * 
 * dependencies
 * libxml, xmlhttprequest
 * installation with: npm install 
 */

var Manager = require('./entities/Manager.js').Manager;
var AsteriskManager = require('./core/AsteriskManager.js').AsteriskManager;
var Action = require('./messages/Action.js').Action;

var asteriskManager = null;
// MAIN FUNCTION!
function main(){

    var manager = new Manager("testmanager", "sehrsehrgeheim");
    
    manager.addListener(managerListener, manager);

    asteriskManager = new AsteriskManager(manager);
    asteriskManager.setBaseUrl('/asterisk/mxml');
    var parser = require("libxml");
    asteriskManager.setParser(parser);
    var NodeAjaxCall = require("./core/NodeAjaxCall.js").NodeAjaxCall;
    var ajaxCall = new NodeAjaxCall();
    asteriskManager.setAjaxCall(ajaxCall);
        
    manager.login();

}


function managerListener(managerStatus){
    if(managerStatus[0] === true){
        console.info("loggedin");
        
        asteriskManager.entityManager.agentManager.queryAgents(function(){
            asteriskManager.entityManager.queueManager.queryQueues(function(){
                asteriskManager.localUser = 47;
                toggleQueue(40, 0);
            }, this, 12345);
        }, this);

    }else{
        // manager login unsuccessful / logout successful
        console.info("nicht erfolgreich");
    }
}


function toggleQueue(queueId, penalty){
    try{
        var queue = asteriskManager.entityManager.queueManager.queues[queueId];
        var agentId = 'SIP/' + asteriskManager.localUser;
        var actionCommand;
        
        if(queue.agents[agentId]){
            if(queue.agentPenalties[agentId] != penalty)
                // update agent
                actionCommand = 'queuepenalty';
            else
                // remove agent
                actionCommand = 'queueremove';
        }else{
            // add agent
            actionCommand = 'queueadd';
        }

        var action = new Action(asteriskManager);
        action.name = actionCommand;
        action.params = {
            queue: queueId,
            'interface': agentId,
            penalty: penalty
        };
        action.execute(function(response){console.info(response);}, this);
    }catch(exc){
        console.info('exception ' + exc.message, exc);
    }
    return false;    
}

main();