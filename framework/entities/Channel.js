var Entity = require('../entities/Entity.js').Entity;

var Channel = function(id, asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.type = Entity.Types.Channel;

    this.id = id;
    this.uniqueid = null;
    this.context = null;
    this.exten = null;
    this.priority = null;
    this.state = null;
    this.calleridnum = null;
    this.calleridname = null;
    this.duration = null;
    this.bridgedChannelId = null;
    
    this.connectedlinename = null;
    this.connectedlinenum = null;
    
    this.getPeer = function(){
        try{
            //var extensionId = this.calleridnum;
            var peerId = this.id.split("-")[0];
            return asteriskManager.entityManager.peerManager.peers[peerId];
        }catch(exc){
            return null;
        }
    };
    
    this.getBridgedChannel = function(){
        try{
            return asteriskManager.entityManager.channelManager.channels[this.bridgedChannelId];
        }catch(exc){
            return null;
        }
    }
};
Channel.prototype = new Entity();
Channel.prototype.toString = function(){
    
    return 'Peer: ' + this.getPeer() + ' | ' 
        + 'Exten: ' + this.exten + ' | '     
        + 'CallerID (Name/Num): ' + this.calleridname + '/' + this.calleridnum + ' | ' 
        + 'ConnectedLine (Name/Num): ' + this.connectedlinename + '/' + this.connectedlinenum + ' | ' 
        + 'State: ' + this.state + ' | '
        + 'Bridged to channel: ' + this.bridgedChannelId;
};

Channel.State = {
    up: 'up',
    ringing: 'ringing',
    unknown: 'unknown'
    // more?
};
Channel.StateTranslations = {
    4: Channel.State.ringing,
    6: Channel.State.up,
    'ringing': Channel.State.ringing,
    'up': Channel.State.up    
};

exports.Channel = Channel;
