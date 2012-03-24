var ListenerHandler = require('../core/ListenerHandler.js').ListenerHandler;

var EventConnector = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    var waitEventAction = asteriskManager.commander.createAction('waitevent');
    var enableListening = false;
    var me = this;

    this.enableListening = function(enableListeningParam){
        enableListening = enableListeningParam;
        if(enableListening){
            start();           
        }else{
            cancel();
        }
    };
    
    var start = function(){
        if(!enableListening)
            return;
        
        waitEventAction.params = {timeout: 5};
        waitEventAction.execute(function(response){
            start(); // restart listening!
            me.propagate(response);
        });        
    };
    
    var cancel = function(){
        // TODO cancel current call
    };

};
EventConnector.prototype = new ListenerHandler();

exports.EventConnector = EventConnector;