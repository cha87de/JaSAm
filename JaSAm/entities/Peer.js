var Entity = require('../entities/Entity.js').Entity;
    
var Peer = function(id, asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.type = Entity.Types.Peer;

    this.id = id;
    this.peertype = Peer.Types.SIP;
    this.name = null;
    this.ipadress = null;
    this.ipport = null;
    this.status = null;    
    
    this.getExtension = function(){
        try{
            var extensions = asteriskManager.entityManager.extensionManager.extensions;
            for(var extensionKey in extensions){
                var extension = extensions[extensionKey];
                if(extension.getPeer().id == this.id)
                    return extension;
            }
            return null;
        }catch(exc){ return null; }
    }
    
    this.getAgent = function(){
        try{
            return asteriskManager.entityManager.agentManager.agents[this.id];
        }catch(exc){
            return null;
        }        
    };     
    
};
Peer.prototype = new Entity();

Peer.prototype.toString = function(){
    return '' + this.ipadress + ':' + this.ipport + ', ' + this.status;
};

Peer.Types = {
    SIP: 'SIP',
    IAX: 'IAX'
};
Peer.State = {
    unreachable: 'unreachable',
    unknown: 'unknown',
    registered: 'registered',
    reachable: 'reachable'
    // more?
};

exports.Peer = Peer;