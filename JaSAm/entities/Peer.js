
var Peer = function(){
    
    this.type = Entity.Types.Channel;

    // this.id = null    
    this.peertype = Peer.Types.SIP;
    this.name = null;
    this.ipadress = null;
    this.ipport = null;
    this.status = null;    
    
};
Peer.prototype = new Entity();

Peer.Types = {
    SIP: 'sip',
    IAX: 'iax'
}