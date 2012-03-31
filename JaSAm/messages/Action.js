
var Action = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.name = null;
    this.params = null;
    this.description = null;
    this.differingBaseUrl = null; // overwrites asteriskManagers baseUrl
    
    var response = null;
    var callback = null;
    var callbackScope = this;
    
    this.execute = function(){
        if(arguments.length > 0)
            callback = arguments[0];
        if(arguments.length > 1)
            callbackScope = arguments[1];
        asteriskManager.execute(this);
    };

    this.getResponse = function(){
        return response;
    };
    
    this.setResponse = function(responseParam){
        response = responseParam;
        
        if(callback != null)
            callback.apply(callbackScope, [response]);
    }
    
    this.clone = function(){
        var action = new Action(asteriskManager);
        action.name = this.name;
        action.description = this.description;
        action.params = this.params;
        
        // more things to copy?
        
        return action;
    }
    
};

exports.Action = Action;
