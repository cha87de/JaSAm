var Manager = require('../JaSAm/entities/Manager.js').Manager;
var AsteriskManager = require('../JaSAm/core/AsteriskManager.js').AsteriskManager;
var Action = require('../JaSAm/messages/Action.js').Action;

var JaSAmApp = function(username, secret, baseUrl, TaskParam, argsParam, callbackParam, scopeParam){
    
    var asteriskManager = null;    
    
    var callback = callbackParam;
    var scope = scopeParam;

    var args = argsParam;
    var Task = TaskParam;
        
    var constructor = function(username, secret, baseUrl){

        var manager = new Manager(username, secret);
        manager.addListener(startExecute, this);

        asteriskManager = new AsteriskManager(manager);
        asteriskManager.setBaseUrl(baseUrl);
        

        var parser = require("libxml");
        asteriskManager.setParser(parser);

        var NodeAjaxCall = require("./core/NodeAjaxCall.js").NodeAjaxCall;
        var ajaxCall = new NodeAjaxCall();
        asteriskManager.setAjaxCall(ajaxCall);

        manager.login();
    };
    
    this.close = function(){
        asteriskManager.manager.removeListener(startExecute);
        asteriskManager.manager.logout();
    };
    
    var startExecute = function(managerStatus){
        if(managerStatus[0] !== true){
            callback.apply(scope, ["Permission denied.", 500]);
            return;
        }
        
        asteriskManager.localUser = args['extension'];
        
        var task = new Task(args, callbackParam, scopeParam, asteriskManager);
        task.run();
    };
   
    constructor.apply(this, [username, secret, baseUrl]);
}

exports.JaSAmApp = JaSAmApp;