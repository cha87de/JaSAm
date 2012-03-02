
var Queue = function(id){
    
    this.type = Entity.Types.Queue;

    this.id = id;
    this.loggedIn = null;
    this.available = null;
    this.callers = null;
    
    this.agents = {};
    
};
Queue.prototype = new Entity();
Queue.prototype.toString = function(){
    return 'LoggedIn: ' + this.loggedIn + ', Available: ' + this.available + ', callers: ' + this.callers + '';
};