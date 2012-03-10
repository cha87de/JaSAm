
var Extension = function(id, asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.type = Entity.Types.Extension;

    this.id = id;
    this.context = null;
    this.status = null;
    //this.statusDescription = null;
    this.channel = null;
    this.hint = null;
    
    this.doNotDisturb = false;
    
    this.getChannels = function(){
        var result = [];
        try{
            var channels = asteriskManager.entityManager.channelManager.channels;
            for(var channelKey in channels){
                var channel = channels[channelKey];
                if(channel.getExtension() == this)
                    result.push(channel);
            }
        }catch(exc){ }
        return result;
    };

    this.getPeer = function(){
        var result = null;
        try{
            result = asteriskManager.entityManager.peerManager.peers[this.hint];
        }catch(exc){ }
        return result;
    };
    
};
Extension.prototype = new Entity();

Extension.prototype.toString = function(){
    return '' + this.status + '' + (this.doNotDisturb ? ' DND' : '');
};

Extension.State = {
    unreachable: 'unreachable',
    available: 'available',
    incall: 'incall',
    ringing: 'ringing',
    unknown: 'unknown'
    // more?
};
Extension.StateTranslations = {
    4: Extension.State.unreachable,
    0: Extension.State.available,
    1: Extension.State.incall,
    8: Extension.State.ringing
};