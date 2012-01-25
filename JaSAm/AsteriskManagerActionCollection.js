
var AsteriskManagerActionCollection = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    var actionListCommands = 'listcommands';
    var actionCommand = 'command';
    var actionCommandParam = 'manager show command';
    
    var commands = [];
    
    var basicProperties = {
        command: [
            ['command', '', '']
        ],
        listcommands: [],
        login: [
            ['username', '', ''],
            ['secret', '', ''],
        ],
        logoff: []
    };
    var properties = basicProperties;
    
    this.getCommands = function(){
        return commands;
    };

    this.getCommandProperties = function(action, callbackFunction, scope){
        if(properties[action])
            callbackFunction.apply(scope, [properties[action]]);
        else{
            asteriskManager.executeCommand(actionCommand, {command:  actionCommandParam + ' ' + action}, function(result){
                var resultArray = [];
                for(var property in result[0]){
                    if(property == "action" || property == "description" || property == "privilege" || property == "privilege-2" || property == "response" || property == "synopsis" || property == "variables")
                        continue;
                    var description = result[0][property];
                    resultArray.push([property, '', description]);
                }
                properties[action] = resultArray;
                callbackFunction.apply(scope, [properties[action]]);
            }, this);
        }
    };
    
    this.queryCommandInfos = function(){
        asteriskManager.executeCommand(actionListCommands, {}, function(result){
            var resultArray = [];
            for(var command in result[0]){
                var value = result[0][command];
                resultArray.push([command, value]);
            }
            commands = resultArray;
        }, this);
    }; 
};