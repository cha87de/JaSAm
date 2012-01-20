var AsteriskManager = function(username, secret){
    /**
     * Private variables
     */
    var localUser = null;
    var keepalive = false;
    var keepaliveTimer = null;

    /**
     * Public variables
     */
    this.manager = new AsteriskManagerManager(username, secret);    
    this.actionCollection = new AsteriskManagerActionCollection(this);    
    this.action = new AsteriskManagerAction(this);

    /**
     * Public Functions
     */
    this.setUser = function(userNumber){
        localUser = userNumber;
    };

    this.enableKeepalive = function(keepaliveParam){
        keepalive = keepaliveParam;
        if(keepalive){
            var fkt = keepaliveAction;
            var self = this;
            keepaliveTimer = setInterval(function(){ fkt.call(self); }, 60000); // 2s, später 60s
        }else{
            clearInterval(keepaliveTimer);
            keepaliveTimer = null;
        }
    };
    
    var keepaliveAction = function(){
        this.action.ping();
    };
    
    this.startCall = function(foreignNumber, outgoingCallerId){
        var action = 'originate';
        var param = {
            exten: foreignNumber,
            channel: 'SIP/'+localUser,
            context: 'default',
            priority: 1,
            callerid: outgoingCallerId
        };
        this.executeCommand(action, param, function(response){
            // nothing to do here
        }, this);        
    };
    
};
AsteriskManager.prototype = new AbstractAsteriskManager();

var AsteriskManagerManager = function(username, secret){
    this.username = username;
    this.secret = secret;
};

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