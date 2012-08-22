
var EventBuffer = function(){

    var store = {};
    
    this.add = function(timestamp, xmlData){
        store[timestamp] = xmlData;
    };
    
    this.next = function(lasttime){
        var now = (new Date()).getTime();
        var next = null;
        for(var timestamp in store){
            if(timestamp > lasttime && next == null){
                //return next store entry
                next = store[timestamp];
            }else if(timestamp < now-2000){
                //delete old store entries
                delete store[timestamp];
            }
        }
        return next;
    };
    
};

exports.EventBuffer = EventBuffer;