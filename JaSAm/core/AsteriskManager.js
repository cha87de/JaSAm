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
