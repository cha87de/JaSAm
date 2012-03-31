var Action = require('../messages/Action.js').Action;
var Task = require('./Task.js').Task;

var Originate = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var remoteNumber = args['remoteNumber'];
    var localUser = args['extension'];
    var callback = callbackParam;
    var scope = scopeParam;
    var asteriskManager = asteriskManagerParam;
    
    this.run = function (){
        var action = asteriskManager.commander.createAction('originate');
        action.params = {
            Exten: remoteNumber,
            channel: 'SIP/' + localUser,
            context: 'from-internal',
            priority: 1,
            callerid:  remoteNumber
        };
        action.execute(originateCallback, this);
    };
    
    var originateCallback = function(response){
        var text;
        if(response.isSuccess()){
            text = "Call from " +localUser + " to extension " + remoteNumber + " established.";
            callback.apply(scope, [text, 200]);
        }else{
            text = "Error: " + response.head.message;
            callback.apply(scope, [text, 500]);
        }
    };

};
Originate.prototype = new Task();

exports.Originate = Originate;