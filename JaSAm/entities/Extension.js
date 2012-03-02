
var Extension = function(id){
    
    this.type = Entity.Types.Extension;

    this.id = id;
    this.context = null;
    this.status = null;
    this.statusDescription = null;
    this.channel = null;
    this.hint = null;
    
};
Extension.prototype = new Entity();

Extension.prototype.toString = function(){
    return 'Status: ' + this.status + '';
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