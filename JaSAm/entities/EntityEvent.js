
var EntityEvent = function(type, entity){

    this.type = type;
    this.entity = entity;
    
};
EntityEvent.Types = {
    'New': 'new',
    Update: 'update',
    Remove: 'remove',
    unknown: 'unknown' 
};