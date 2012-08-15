var ListenerHandler = require('../core/ListenerHandler.js').ListenerHandler;
var EntityEvent = require('../entities/EntityEvent.js').EntityEvent;
var Channel = require('../entities/Channel.js').Channel;
var Action = require('../messages/Action.js').Action;

var ChannelManager = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    this.channels = {};
    
    this.handleEvent = function(responseItem){

        var channel = null;
        var id = null;
        var eventType = EntityEvent.Types.unknown;

        if(responseItem.name == 'Newchannel' || responseItem.name == 'Newstate' || responseItem.name == 'Dial' || responseItem.name == 'NewCallerid'){
            id = responseItem.content.channel;
            if(!this.channels[id]){
                this.channels[id] = new Channel(id, asteriskManager);
                eventType = EntityEvent.Types.New;
            }else{
                eventType = EntityEvent.Types.Update;
            }

            channel = this.channels[id];
            channel.calleridname = setIfDefined(channel.calleridname, responseItem.content.calleridname);
            channel.calleridnum = setIfDefined(channel.calleridnum, responseItem.content.calleridnum);
            channel.uniqueid = setIfDefined(channel.uniqueid, responseItem.content.uniqueid);
            channel.context = setIfDefined(channel.context, responseItem.content.context);
            channel.exten = setIfDefined(channel.exten, responseItem.content.exten);
            channel.priority  = setIfDefined(channel.priority, responseItem.content.priority);
            channel.duration = setIfDefined(channel.duration, responseItem.content.seconds);
            channel.connectedlinename = setIfDefined(channel.connectedlinename, responseItem.content.connectedlinename);
            channel.connectedlinenum = setIfDefined(channel.connectedlinenum, responseItem.content.connectedlinenum);

            if(responseItem.content.channelstate){
                channel.state = Channel.StateTranslations[responseItem.content.channelstate];
            }

        }else if(responseItem.name == 'Hangup'){
            id = responseItem.content.channel;
            if(!this.channels[id]){
                // hangup call that doesn't exist? 
            }else{
                eventType = EntityEvent.Types.Remove;
            }
            channel = this.channels[id];
            delete this.channels[id];    
        }else if(responseItem.name == 'Bridge' || responseItem.name == 'Unlink'){
            id = responseItem.content.channel1;
            if(!this.channels[id]){
                // not possible
                return;
            }else{
                eventType = EntityEvent.Types.Update;
            }
            channel = this.channels[id];
            var channel2 = this.channels[responseItem.content.channel2];
            if(channel2 !== undefined && responseItem.name == 'Bridge'){
                channel.bridgedChannelId = responseItem.content.channel2;
                channel2.bridgedChannelId = id;
            }else if(channel2 !== undefined){
                channel.bridgedChannelId = null;
                channel2.bridgedChannelId = null;
            }
        }else{
            BasicManager.print('unknown channel state' , responseItem.name);
        }
        var event = new EntityEvent(eventType, channel);
        asteriskManager.entityManager.handleCollectedEvents(event);
        this.propagate(event);
    };
    
    this.queryChannels = function(callback, scope){
        var action = new Action(asteriskManager);
        action.name = 'status';
        action.execute(function(response){
            for(var channelentryKey in response.body){
                if(channelentryKey == "remove")
                    continue;
                var channelentry = response.body[channelentryKey].content;
                var id = channelentry.channel;

                if(!this.channels[id]){
                    this.channels[id] = new Channel(id, asteriskManager);
                }
                var channel = this.channels[id];

                channel.calleridname = ifDefined(channelentry.calleridname);
                channel.calleridnum = ifDefined(channelentry.calleridnum);
                channel.uniqueid = ifDefined(channelentry.uniqueid);
                channel.context = ifDefined(channelentry.context);
                channel.exten = ifDefined(channelentry.exten);
                channel.priority  = ifDefined(channelentry.priority);
                channel.duration = ifDefined(channelentry.seconds);
                channel.connectedlinename = ifDefined(channelentry.connectedlinename);
                channel.connectedlinenum = ifDefined(channelentry.connectedlinenum);
                channel.bridgedChannelId = ifDefined(channelentry.bridgedchannel);
                if(channelentry.channelstate){
                    channel.state = Channel.StateTranslations[channelentry.channelstate];
                }else if(channelentry.state){
                    channel.state = Channel.StateTranslations[channelentry.state.toLowerCase()];
                }else{
                    channel.state = Channel.State.unknown;
                }

                /*if(channel.getExtension()){
                    if(channel.state == Channel.State.ringing)
                        channel.getExtension().status = Extension.State.ringing;
                    else if(channel.state == Channel.State.up)
                        channel.getExtension().status = Extension.State.incall
                }*/
            }
            
            callback.apply(scope, []);
        }, this);
    };
    
}
ChannelManager.prototype = new ListenerHandler();

exports.ChannelManager = ChannelManager;
