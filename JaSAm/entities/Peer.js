
var Peer = function(){
    
    this.type = Entity.Types.Peer;

    // this.id = null    
    this.peertype = Peer.Types.SIP;
    this.name = null;
    this.ipadress = null;
    this.ipport = null;
    this.status = null;    
    
};
Peer.prototype = new Entity();

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
