
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
    
    this.connectedlinename = null;
    this.connectedlinenum = null;
    
    this.getExtension = function(){
        try{
            return asteriskManager.entityManager.extensionManager.extensions[this.calleridnum];
        }catch(exc){
            return null;
        }
    };
};
Channel.prototype = new Entity();
Channel.prototype.toString = function(){
    return 'Extension: ' + this.calleridnum + '(' + this.calleridname + '), to: ' + 
        this.exten + ' / ' + this.connectedlinenum + '(' + this.connectedlinename + ')' +
        ' (' + this.state + ')';
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