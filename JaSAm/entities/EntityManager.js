var ListenerHandler = require('../core/ListenerHandler.js').ListenerHandler;
var ExtensionManager = require('../entities/ExtensionManager.js').ExtensionManager;
var ChannelManager = require('../entities/ChannelManager.js').ChannelManager;
var PeerManager = require('../entities/PeerManager.js').PeerManager;
var QueueManager = require('../entities/QueueManager.js').QueueManager;
var AgentManager = require('../entities/AgentManager.js').AgentManager;

var EntityManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.extensionManager = new ExtensionManager(asteriskManager);
    this.channelManager = new ChannelManager(asteriskManager);
    this.peerManager = new PeerManager(asteriskManager);
    this.queueManager = new QueueManager(asteriskManager);
    this.agentManager = new AgentManager(asteriskManager);

    // Mapping rules:
    var ignoreEvents = ['Newexten', 'VarSet', 'RTPReceiverStat', 'RTPSenderStat', 'RTPSenderStat', 'RTPReceiverStat', 'RTPSenderStat', 'RTCPSent', 'RTCPReceived', 'Registry'];
    var channelEvents = ['Newstate', 'Hangup', 'Newchannel', 'Dial', 'NewCallerid', 'Bridge', 'Unlink'];
    var extensionEvents = ['ExtensionStatus',  'UserEvent'];
    var peerEvents = ['PeerStatus'];
    var queueEvents = ['QueueMemberRemoved', 'QueueMemberAdded', 'QueueMemberPenalty'];
    var agentEvents = [];
    // What about: NewCallerid? UserEvent? NewAccountCode? Join? Leave? QueueCallerAbandon?

    this.eventListener = function(response){
        response = response[0];
        // Try to map entries
        for(var key in response.body){
            var responseItem = response.body[key];
            var eventName = responseItem.name;
            var unknown = true;
            if(arraySearch(ignoreEvents, eventName) >= 0){
                // do nothing
                unknown = false;
                BasicManager.print('ignore event:', eventName, responseItem);
            }else if(arraySearch(channelEvents, eventName) >= 0){
                // Channel-Event
                unknown = false;
                this.channelManager.handleEvent(responseItem);
            }else if(arraySearch(extensionEvents, eventName) >= 0){
                // Extension-Event
                unknown = false;
                this.extensionManager.handleEvent(responseItem);
            }else if(arraySearch(peerEvents, eventName) >= 0){                
                // Peer-Event
                unknown = false;
                this.peerManager.handleEvent(responseItem);
            }else if(arraySearch(queueEvents, eventName) >= 0){                
                // Queue-Event
                unknown = false;
                this.queueManager.handleEvent(responseItem);
            }else if(arraySearch(agentEvents, eventName) >= 0){                
                // Agent-Event
                unknown = false;
                this.agentManager.handleEvent(responseItem);                
            }

            if(unknown){
                // Event unknown!
                BasicManager.print('Event unknown:', eventName, responseItem);
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
        var queryCounterCalls = 5;
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
        // query Peers
        this.peerManager.queryPeers(callCallback, this); 
        // query Queues      
        this.queueManager.queryQueues(callCallback, this);
        // query Agents
        this.agentManager.queryAgents(callCallback, this);        
    };
    
    this.handleCollectedEvents = function(entityEvent){
        this.propagate(entityEvent);
    };

}
EntityManager.prototype = new ListenerHandler();

ifDefined = function(value){
        return value ? value : null;
};

setIfDefined = function(variable, value){
    if(value)
        variable = value;
    return variable;
};

exports.EntityManager = EntityManager;
