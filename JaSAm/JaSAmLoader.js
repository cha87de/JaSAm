
var JaSAmLoader = function(){

};

/**
 * loadFile-Function is based on sencha extJS Ext.Loader
 */
JaSAmLoader.loadFile = function (filename, callback){
    var script  = document.createElement('script');
    script.type = "text/javascript";
    script.src  = JaSAmLoader.basePath + '/' + filename + '?' + JaSAmLoader.rev;
   
    //IE has a different way of handling <script> loads, so we need to check for it here
    if (script.readyState) {
        script.onreadystatechange = function() {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {
        script.onload = callback;
    }        
    
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(script);    
}

JaSAmLoader.basePath = '.';
JaSAmLoader.rev = 5;
JaSAmLoader.files = [
    "core/AjaxCall.js",
    "core/BasicManager.js",   
    "core/AsteriskManager.js",   
    "core/Commander.js",   
    "core/ListenerHandler.js",   
    "core/EventBuffer.js",   
    "core/EventConnector.js",   

    "entities/Manager.js",   
    "entities/Entity.js",
    "entities/EntityEvent.js",
    "entities/Agent.js",
    "entities/AgentManager.js",
    "entities/Channel.js",   
    "entities/ChannelManager.js",
    "entities/Extension.js",
    "entities/ExtensionManager.js",
    "entities/Peer.js",   
    "entities/PeerManager.js",
    "entities/Queue.js",   
    "entities/QueueManager.js",
    "entities/EntityManager.js",       

    "messages/Action.js",   
    "messages/Response.js",   
    "messages/ResponseItem.js",
    "messages/Exception.js",
    
    "utils/CallbackCollector.js",
    
    "tasks/Task.js",
    "tasks/Originate.js",
    "tasks/Transfer.js",
    "tasks/DNDOn.js",
    "tasks/DNDOff.js",
    "tasks/TogglePauseAgent.js"
];
JaSAmLoader.filesLoaded = 0;

JaSAmLoader.userCallback = null;
JaSAmLoader.load = function(callback, basePath){
    JaSAmLoader.userCallback = callback;
    JaSAmLoader.basePath = basePath;
    // start loading first file
    JaSAmLoader.loadFile(JaSAmLoader.files[0], JaSAmLoader.loadingcallback);
};

JaSAmLoader.loadingcallback = function(){
    JaSAmLoader.filesLoaded++;
    
    if(JaSAmLoader.filesLoaded == JaSAmLoader.files.length) // done! execute userCallback
        JaSAmLoader.userCallback();
    else // load next file
        JaSAmLoader.loadFile(JaSAmLoader.files[JaSAmLoader.filesLoaded], JaSAmLoader.loadingcallback);
}

// nodejs implements this, browserjs does not need it.
function require(){
    return this;
}
exports = {};