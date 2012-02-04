
var EntityManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.extensions = new Array();
    this.channels = new Array();
    this.peers = new Array();
    this.queues = new Array();
    
    this.queryExtensions = function(callback, scope){
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
    }
}