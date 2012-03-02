
var Peer = function(id){
    
    this.type = Entity.Types.Peer;

    this.id = id;
    this.peertype = Peer.Types.SIP;
    this.name = null;
    this.ipadress = null;
    this.ipport = null;
    this.status = null;    
    
};
Peer.prototype = new Entity();

Peer.prototype.toString = function(){
    return 'IP: ' + this.ipadress + ':' + this.ipport + ', Status: ' + this.status + '';
};

Peer.Types = {
    SIP: 'SIP',
    IAX: 'IAX'
};
Peer.State = {
    unreachable: 'unreachable',
    unknown: 'unknown',
    registered: 'registered',
    reachable: 'reachable',
    unreachable: 'unreachable'
    // more?
};
