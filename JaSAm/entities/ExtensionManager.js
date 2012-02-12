
var ExtensionManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.extensions = {};
    
    this.handleEvent = function(responseItem){
        var extension = null;
        var eventType = EntityEvent.Types.unknown;
        if(responseItem.name == 'ExtensionStatus'){
            var id = responseItem.content.exten;
            if(!this.extensions[id]){
                this.extensions[id] = new Extension(id);
                eventType = EntityEvent.Types.New;
            }else{
                eventType = EntityEvent.Types.Update;
            }

            extension = this.extensions[id];
            extension.status = Extension.StateTranslations[responseItem.content.status];
            extension.hint = responseItem.content.hint;
            extension.context = responseItem.content.context;
        }else if(false){
            // ...
        }else{
            console.warn('unknown extension state' , responseItem.name);
        }
        var event = new EntityEvent(eventType, extension);
        asteriskManager.entityManager.handleCollectedEvents(event);
        this.propagate(event);
    };
    
    this.queryExtensions = function(callback, scope){
        var action = new Action(asteriskManager);
        action.name = 'sippeers';        
        action.execute(function(response){
            this.extensions = {};
            for(var peerentryKey in response.body){
                var peerentry = response.body[peerentryKey].content;
                var id = peerentry.objectname;
                var status = peerentry.status;
                if(status.indexOf("OK") >= 0)
                    status = 'available';
                status = status.toLowerCase();
                var extension = new Extension(id);
                extension.status = Extension.State[status];
                this.extensions[id] = extension;
            }
            
            callback.apply(scope, []);
        }, this);
    };    
    
}
ExtensionManager.prototype = new ListenerHandler();