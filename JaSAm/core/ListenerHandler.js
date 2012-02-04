
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
        for(var key = 0; key<listeners.length; key++){
            var listener = listeners[key];
            if(!listener.callback || !listener.scope)
                continue;
            
            var fkt = listener.callback;
            var scope = listener.scope;
            var params = arguments;
            // use setTimeout to resume for
            setTimeout(function(){fkt.apply(scope, [params]);}, 0);
        }
    };
}