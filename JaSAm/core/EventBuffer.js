
var EventBuffer = function(){

    var store = {};
    
    this.add = function(timestamp, xmlData){
        store[timestamp] = xmlData;
    };
    
    this.next = function(lasttime){
        var now = (new Date()).getTime();
        for(var timestamp in store){
            if(timestamp > lasttime){
                //return next store entry
                return store[timestamp];
            }else if(timestamp < now-2000){
                //delete old store entries
                delete store[timestamp];
            }
        }
        return null;
    };
    
};

exports.EventBuffer = EventBuffer;