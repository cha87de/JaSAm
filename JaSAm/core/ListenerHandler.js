
var ListenerHandler = function(){
    var listeners = new Array();
    
    this.addListener = function(callback, scope){
        listeners.push({callback: callback, scope: scope});
    };
    
    this.removeListener = function(callback){
        for(var listener in listeners){
            if(listener.callback == callback)
                listeners.remove(listener);
        }
    };

    this.propagate = function(){
        var fkts = new Object();
        var scopes = new Object();
        var params = arguments;
        var i = 0;
        for(var key = 0; key<listeners.length; key++){
            var listener = listeners[key];
            if(!listener.callback || !listener.scope)
                continue;
            
            fkts[key] = listener.callback;
            scopes[key] = listener.scope;
            // use setTimeout to resume for
            setTimeout(function(){ fkts[i].apply(scopes[i], [params]); i++;}, 0);
        }
    };
}

exports.ListenerHandler = ListenerHandler;