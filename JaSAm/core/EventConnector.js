var ListenerHandler = require('../core/ListenerHandler.js').ListenerHandler;

var EventConnector = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    var waitEventAction = asteriskManager.commander.createAction('waitevent');
    var enableListening = false;
    var me = this;
    this.eventBuffer = null;

    this.enableListening = function(enableListeningParam){
        enableListening = enableListeningParam;
        if(enableListening){
            start();           
        }else{
            cancel();
        }
    };

    var start = function(lastResponseTime){
        if(!enableListening)
            return;
        
        waitEventAction = asteriskManager.commander.createAction('waitevent');
        waitEventAction.params = {
            timeout: 60,
            lastResponseTime: lastResponseTime
        };
        waitEventAction.execute(function(response){
            //lese aus response time aus und übergebe start, als lastTime
            start(response.timestamp); // restart listening!

            if(this.eventBuffer != null){
                var now = (new Date()).getTime();
                response.xmlData = response.xmlData.replace("<ajax-response>", "<ajax-response name=\""+now+"\">");
                this.eventButter.add(now, response.xmlData);
            }
            
            me.propagate(response);
        });        
    };
    
    var cancel = function(){
        // TODO cancel current call
    };
    
};
EventConnector.prototype = new ListenerHandler();

exports.EventConnector = EventConnector;