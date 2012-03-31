var Action = require('../messages/Action.js').Action;

var Commander = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    var actions = new Object();
    
    var createDefaultActions = function(){
        actions = new Object();
        
        // login
        actions.login = new Action(asteriskManager);
        actions.login.name = 'login';
        actions.login.description = '';
        actions.login.params = {username: null, secret: null};
        
        // logout
        actions.logout = new Action(asteriskManager);
        actions.logout.name = 'logoff';
        actions.logout.description = '';
        actions.logout.params = {};
        
        // ping
        actions.ping = new Action(asteriskManager);
        actions.ping.name = 'ping';
        actions.ping.description = '';
        actions.ping.params = {};

        // listcommands
        actions.listcommands = new Action(asteriskManager);
        actions.listcommands.name = 'listcommands';
        actions.listcommands.description = '';
        actions.listcommands.params = 
            
        // command
        actions.command = new Action(asteriskManager);
        actions.command.name = 'command';
        actions.command.description = '';
        actions.command.params = {
            command: 'manager show command xyz'
        };            
        
        // waitevent
        actions.waitevent = new Action(asteriskManager);
        actions.waitevent.name = 'waitevent';
        actions.waitevent.description = '';
        actions.waitevent.params = {};
        
        // originate
        actions.originate = new Action(asteriskManager);
        actions.originate.name = 'originate';
        actions.originate.description = '';
        actions.originate.params = {
            exten: null, //foreignNumber
            channel: 'SIP/'+0, // localUser
            context: 'default',
            priority: 1,
            callerid: null // outgoingCallerId
        };        
    };
    createDefaultActions();
    
    this.getActions = function(){
        return actions;
    };
    
    this.defineAction = function(action){
        actions[action.name] = action;
    };
    
    this.createAction = function(name){
        if(actions[name]){
            return actions[name].clone();
        }else{
            actions[name] = new Action(asteriskManager);
            actions[name].name = name;
            actions[name].description = '';
            actions[name].params = {};
            return actions[name].clone();
        }
    };

    this.queryServerActions = function(callback, scope){
        var self = this;
        var action = this.createAction('listcommands');
        action.execute(function(response){
            var commands = response.head;
            for(var actionName in commands){
                if(!actions[actionName])
                    actions[actionName] = new Action(asteriskManager);
                actions[actionName].name = actionName;
                actions[actionName].description = commands[actionName];
                actions[actionName].params = {};
           }
            callback.apply(scope, [self.getActions()]);
        });
    };
   
    
};

exports.Commander = Commander;
