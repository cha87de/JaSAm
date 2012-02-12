
var EntityManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.extensionManager = new ExtensionManager(asteriskManager);
    this.channelManager = new ChannelManager(asteriskManager);
    this.peerManager = new PeerManager(asteriskManager);
    this.queueManager = new QueueManager(asteriskManager);

    // Mapping rules:
    var ignoreEvents = ['VarSet', 'RTPReceiverStat', 'RTPSenderStat', 'RTPSenderStat', 'RTPReceiverStat', 'RTPSenderStat', 'RTCPSent'];
    var channelEvents = ['Newstate', 'Hangup', 'Newchannel', 'Dial'];
    var extensionEvents = ['Newexten', 'ExtensionStatus'];
    var peerEvents = ['PeerStatus'];
    var queueEvents = [];
    // What about: NewCallerid

    this.eventListener = function(response){
        response = response[0];
        // Try to map entries
        for(var key in response.body){
            var responseItem = response.body[key];
            var eventName = responseItem.name;
            
            if(arraySearch(ignoreEvents, eventName) >= 0){
                // do nothing
            }else if(arraySearch(channelEvents, eventName) >= 0){
                // Channel-Event
                this.channelManager.handleEvent(responseItem);
            }else if(arraySearch(extensionEvents, eventName) >= 0){
                // Extension-Event
                this.extensionManager.handleEvent(responseItem);
            }else if(arraySearch(peerEvents, eventName) >= 0){                
                // Peer-Event
                this.peerManager.handleEvent(responseItem);
            }else if(arraySearch(queueEvents, eventName) >= 0){                
                // Queue-Event
                this.queueManager.handleEvent(responseItem);
            }else{
                // Event unknown!
                console.warn('Event unknown:', eventName);
            }                
        }
    };
    // register listener on eventConnector
    asteriskManager.eventConnector.addListener(this.eventListener, this);

    var arraySearch = function(array, search){
        for(var i = 0; i < array.length; i++) {
            if(array[i] == search) {
                return i;
            }
        }        
        return -1;
    };

    this.queryEntities = function(callback, scope){
        var queryCounter = 0;
        var queryCounterCalls = 4;
        var callCallback = function(){
            queryCounter++;
            if(queryCounter == queryCounterCalls){
                callback.apply(scope, []);
            }
        }
    
        // query Channels
        this.channelManager.queryChannels(callCallback, this);
        // query Extensions
        this.extensionManager.queryExtensions(callCallback, this);
        // query Peer
        this.peerManager.queryPeers(callCallback, this); 
        // query Queue       
        this.queueManager.queryQueues(callCallback, this);
    };
    
    this.handleCollectedEvents = function(entityEvent){
        this.propagate(entityEvent);
    };
    
    /*this.queryExtensions = function(callback, scope){
        var action = new Action(asteriskManager);
        action.name = 'sippeers';
        
        action.execute(function(response){
            this.queryExtensionsCallback(response, callback, scope);
        }, this);
    };
    
    this.queryExtensionsCallback = function(response, callback, scope){
        this.extensions = new Array();
        this.peers = new Array();        
        for(var peerentryKey in response.body){
            var peerentry = response.body[peerentryKey].content;
            var extension = new Extension();
            extension.extenid = peerentry.objectname;
            extension.status = peerentry.status;
            this.extensions.push(extension);
            
            if(peerentry.status != 'UNKNOWN'){
                // create peer
                var peer = new Peer();
                peer.type = peerentry.channeltype;
                peer.name = peerentry.objectname;
                peer.ipadress = peerentry.ipaddress;
                peer.ipport = peerentry.ipport;
                peer.status = peerentry.status; 
                this.peers.push(peer); 
           }
        }
        callback.apply(scope, []);
    };    
    */    
}
EntityManager.prototype = new ListenerHandler();