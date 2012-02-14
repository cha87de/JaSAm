
var Commander = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    var actions = new Object();
    
    var createDefaultActions = function(){
        actions = new Object();
        
        // login
        actions.login = new Action(asteriskManager);
        actions.login.name = 'login';
        actions.login.params = {username: null, secret: null};
        
        // logout
        actions.logout = new Action(asteriskManager);
        actions.logout.name = 'logoff';
        actions.logout.params = {};
        
        // ping
        actions.ping = new Action(asteriskManager);
        actions.ping.name = 'ping';
        actions.ping.params = {};

        // listcommands
        actions.listcommands = new Action(asteriskManager);
        actions.listcommands.name = 'listcommands';
        actions.listcommands.params = {};
        
        // waitevent
        actions.waitevent = new Action(asteriskManager);
        actions.waitevent.name = 'waitevent';
        actions.waitevent.params = {};
        
        // originate
        actions.originate = new Action(asteriskManager);
        actions.originate.name = 'originate';
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
    }
    
    this.createAction = function(name){
        if(actions[name])
            return actions[name].clone();
        else
            throw new Object();
    }

    this.queryServerActions = function(){
        var action = this.createAction('listcommands');
        action.execute(function(response){
            /*var resultArray = [];
            for(var command in result[0]){
                var value = result[0][command];
                resultArray.push([command, value]);
            }
            commands = resultArray;*/
            // TODO
            console.info(response);
        });
    }
    
    
};