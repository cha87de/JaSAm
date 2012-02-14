
var ChannelManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.channels = {};
    
    this.handleEvent = function(responseItem){
        var channel = null;
        var id = null;
        var eventType = EntityEvent.Types.unknown;

        if(responseItem.name == 'Newchannel' || responseItem.name == 'Newstate' || responseItem.name == 'Dial'){
            id = responseItem.content.channel;
            if(!this.channels[id]){
                this.channels[id] = new Channel(id);
                eventType = EntityEvent.Types.New;
            }else{
                eventType = EntityEvent.Types.Update;
            }

            channel = this.channels[id];
            channel.calleridname = ifDefined(responseItem.content.calleridname);
            channel.calleridnum = ifDefined(responseItem.content.calleridnum);
            channel.channelstate = ifDefined(responseItem.content.channelstate);
            channel.channelstatedesc = ifDefined(responseItem.content.channelstatedesc);
            channel.uniqueid = ifDefined(responseItem.content.uniqueid);
            channel.context = ifDefined(responseItem.content.context);
            channel.extension = ifDefined(responseItem.content.extension);
            channel.priority  = ifDefined(responseItem.content.priority);
            channel.duration = ifDefined(responseItem.content.seconds);
            
        }else if(responseItem.name == 'Hangup'){
            id = responseItem.content.channel;
            if(!this.channels[id]){
                // hangup call that doesn't exist? 
            }else{
                eventType = EntityEvent.Types.Remove;
            }
            channel = this.channels[id];
            delete this.channels[id];            
        }else{
            console.warn('unknown channel state' , responseItem.name);
        }
        var event = new EntityEvent(eventType, channel);
        asteriskManager.entityManager.handleCollectedEvents(event);
        this.propagate(event);
    };
    
    this.queryChannels = function(callback, scope){
        var action = new Action(asteriskManager);
        action.name = 'status';
        action.execute(function(response){
            this.channels = {};
            for(var channelentryKey in response.body){
                var channelentry = response.body[channelentryKey].content;
                var id = channelentry.channel;
                var channel = new Channel(id);
                channel.calleridname = ifDefined(channelentry.calleridname);
                channel.calleridnum = ifDefined(channelentry.calleridnum);
                channel.channelstate = ifDefined(channelentry.channelstate);
                channel.channelstatedesc = ifDefined(channelentry.channelstatedesc);
                channel.uniqueid = ifDefined(channelentry.uniqueid);
                channel.context = ifDefined(channelentry.context);
                channel.extension = ifDefined(channelentry.extension);
                channel.priority  = ifDefined(channelentry.priority);
                channel.duration = ifDefined(channelentry.seconds);
                
                this.channels[id] = channel;
            }
            
            callback.apply(scope, []);
        }, this);
    };
    
}
ChannelManager.prototype = new ListenerHandler();