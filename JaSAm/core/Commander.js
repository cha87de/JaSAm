
var AsteriskManagerAction = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    /**
     * Logs given Manager into Asterisk Server
     */
    this.login = function(callbackFunction, scope){
        var action = 'login';
        var param = {
            username: asteriskManager.manager.username,
            secret: asteriskManager.manager.secret
        };
        asteriskManager.executeCommand(action, param, function(response){
            var result = false;
            if(response[0].response && response[0].response == 'Success')
                result = true;
            
            if(result)
                asteriskManager.actionCollection.queryCommandInfos();

            if(callbackFunction && scope)
                callbackFunction.apply(scope, [result]);
        }, this);
    };

    this.logout = function(callbackFunction, scope){
        var action = 'logoff';
        var param = {};
        asteriskManager.executeCommand(action, param, function(response){
            if(callbackFunction && scope)
                callbackFunction.apply(scope, []);
        }, this);
    };

    this.ping = function(callbackFunction, scope){
        var action = 'ping';
        var param = {};
        asteriskManager.executeCommand(action, param, function(){
            if(callbackFunction && scope)
                callbackFunction.apply(scope, []);
        }, this);        
    };    
    
};