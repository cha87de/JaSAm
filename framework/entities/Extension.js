var Entity = require('../entities/Entity.js').Entity;

var Extension = function(id, asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.type = Entity.Types.Extension;

    this.id = id;
    this.context = null;
    this.status = null;
    this.channel = null;
    this.hint = null;
    
    this.doNotDisturb = false;
    
    this.getPeer = function(){
        var result = null;
        try{
            result = asteriskManager.entityManager.peerManager.peers[this.hint];
        }catch(exc){ }
        return result;
    };
    
    /*
     * Having multiple SIP-phones for one single main-did, append digits for each additional SIP-login 
     * Example: BasicExtension 27. Logins are 27, 270, 271, 272, ...
     * (Dial-Option in 27 must be set on SIP/27&SIP/270&...)
     */
    this.getBasicExtension = function(){
        var tmpId = this.id;
        var currentLength = tmpId.length;
        while(currentLength > 0){
            // remove last digit
            currentLength--;
            tmpId = tmpId.substr(0, currentLength);
            
            // if extension exists, return it!
            var tmpExtension = asteriskManager.entityManager.extensionManager.extensions[tmpId];
            if(tmpExtension){
                return tmpExtension;
            }
        }
        // No Basic-Extension found? This is one! ;-)
        return this;
    };
    
};
Extension.prototype = new Entity();

Extension.prototype.toString = function(){
    return '' + this.status;
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

exports.Extension = Extension;
