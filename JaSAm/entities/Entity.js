
var Entity = function(){

    this.id = null;
    this.type = Entity.Types.unknown;
    
};
Entity.Types = {
    Agent: 'agent',
    Channel: 'channel',
    Extension: 'extension',
    Peer: 'peer',
    Queue: 'queue',
    unknown: 'unknown' 
};

exports.Entity = Entity;