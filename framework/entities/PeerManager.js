var ListenerHandler = require('../core/ListenerHandler.js').ListenerHandler;
var Peer = require('../entities/Peer.js').Peer;
var EntityEvent = require('../entities/EntityEvent.js').EntityEvent;
var Action = require('../messages/Action.js').Action;

var PeerManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.peers = {};
    
    this.handleEvent = function(responseItem){
        var peer = null;
        var eventType = EntityEvent.Types.unknown;
        if(responseItem.name == 'PeerStatus'){
            var id = responseItem.content.peer;
            if(!this.peers[id]){
                this.peers[id] = new Peer(id, asteriskManager);
                eventType = EntityEvent.Types.New;
            }else{
                eventType = EntityEvent.Types.Update;
            }
            var status = responseItem.content.peerstatus;
            status = status.toLowerCase();
            
            peer = this.peers[id];
            peer.status = Peer.State[status];
            
            // potentially not set:
            peer.ipadress = responseItem.content.address ? responseItem.content.address : null;
            peer.ipport = responseItem.content.port ? responseItem.content.port : null;

        }else{
            BasicManager.print('unknown peer state' , responseItem.name);
        }
        var event = new EntityEvent(eventType, peer);
        asteriskManager.entityManager.handleCollectedEvents(event);
        this.propagate(event);
    };
    
    this.queryPeers = function(callback, scope){
        var action = new Action(asteriskManager);
        action.name = 'sippeers';
        action.execute(function(response){
            for(var peerentryKey in response.body){
                if(peerentryKey == "remove")
                    continue;
                var peerentry = response.body[peerentryKey].content;
                
                var id = peerentry.channeltype + '/' + peerentry.objectname;
                var status = peerentry.status;
                if(status.indexOf("OK") >= 0)
                    status = 'registered';
                status = status.toLowerCase();
                
                if(!this.peers[id]){
                    this.peers[id] = new Peer(id, asteriskManager);
                }
                var peer = this.peers[id];                
                
                peer.status = Peer.State[status];
                peer.ipadress = peerentry.ipaddress;
                peer.ipport = peerentry.ipport;
                peer.name = peerentry.objectname;
            }
            
            callback.apply(scope, []);
        }, this);
    };  
    
}
PeerManager.prototype = new ListenerHandler();

exports.PeerManager = PeerManager;
