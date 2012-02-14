
var EntityManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.extensionManager = new ExtensionManager(asteriskManager);
    this.channelManager = new ChannelManager(asteriskManager);
    this.peerManager = new PeerManager(asteriskManager);
    this.queueManager = new QueueManager(asteriskManager);

    // Mapping rules:
    var ignoreEvents = ['NewCallerid', 'UserEvent', 'VarSet', 'RTPReceiverStat', 'RTPSenderStat', 'RTPSenderStat', 'RTPReceiverStat', 'RTPSenderStat', 'RTCPSent', 'RTCPReceived'];
    var channelEvents = ['Newstate', 'Hangup', 'Newchannel', 'Dial'];
    var extensionEvents = ['Newexten', 'ExtensionStatus'];
    var peerEvents = ['PeerStatus'];
    var queueEvents = ['QueueMemberRemoved', 'QueueMemberAdded'];
    // What about: NewCallerid? UserEvent? NewAccountCode? Join? Leave? QueueCallerAbandon?

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

}
EntityManager.prototype = new ListenerHandler();

var ifDefined = function(value){
        return value ? value : null;
};