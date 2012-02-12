
var Entity = function(){

    this.id = null;
    this.type = Entity.Types.unknown;
    
};
Entity.Types = {
    Channel: 'channel',
    Extension: 'extension',
    Peer: 'peer',
    Queue: 'queue',
    unknown: 'unknown' 
};