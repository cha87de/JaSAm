
var Channel = function(id){
    
    this.type = Entity.Types.Channel;

    this.id = id;
    this.uniqueid = null;
    this.context = null;
    this.extension = null;
    this.priority = null;
    this.channelstate = null;
    this.channelstatedesc = null;
    this.calleridnum = null;
    this.calleridname = null;
    this.duration = null;
    
};
Channel.prototype = new Entity();
Channel.prototype.toString = function(){
    return 'From: ' + this.calleridnum + '(' + this.calleridname + '), to extension: ' + this.extension + ', state: ' + this.channelstatedesc;
};
