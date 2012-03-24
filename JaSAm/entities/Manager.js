var ListenerHandler = require('../core/ListenerHandler.js').ListenerHandler;

var Manager = function(username, secret){
    var asteriskManager = null;
    var loggedIn = false;
    
    this.username = username;
    this.secret = secret;
     
    this.setAsteriskManager = function(asteriskManagerParam){
        asteriskManager = asteriskManagerParam;
    }
    
    this.login = function(){
        var me = this;
        var action = asteriskManager.commander.createAction('login');
        action.params = {username: this.username, secret: this.secret};
        action.execute(function(response){
            if(response.isSuccess())
                loggedIn = true;
            else
                loggedIn = false;
            me.propagate(loggedIn);
        });
    };
    
    this.logout = function(){
        var me = this;
        var action = asteriskManager.commander.createAction('logout');
        action.execute(function(){
            loggedIn = false;            
            me.propagate(loggedIn);
        });
    };
    
};
Manager.prototype = new ListenerHandler();

exports.Manager = Manager;