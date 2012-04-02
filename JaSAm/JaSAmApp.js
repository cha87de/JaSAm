var Manager = require('./entities/Manager.js').Manager;
var AsteriskManager = require('./core/AsteriskManager.js').AsteriskManager;
var CallbackCollector = require('./utils/CallbackCollector.js').CallbackCollector;
var EventBuffer = require('./core/EventBuffer.js').EventBuffer;

var JaSAmApp = function(username, secret){
    
    var asteriskManager = null;    
    
    var config = {};
        
    var constructor = function(username, secret){
        var manager = new Manager(username, secret);
        asteriskManager = new AsteriskManager(manager);
    };
    
    this.setConfiguration = function(configParam){
        config = configParam;
    };

    this.start = function(callback, scope){
        var callbackCollector = new CallbackCollector(callback, scope);
        
        if(config[JaSAmApp.Configuration.baseUrl])
            asteriskManager.setBaseUrl(config[JaSAmApp.Configuration.baseUrl]);
        
        if(config[JaSAmApp.Configuration.localUser])
            asteriskManager.localUser = config[JaSAmApp.Configuration.localUser];
        
        if(config[JaSAmApp.Configuration.enableEventlistening])
            asteriskManager.eventConnector.enableListening(true);
        
        if(config[JaSAmApp.Configuration.enableKeepalive])
            asteriskManager.enableKeepalive(true);
        
        if(config[JaSAmApp.Configuration.autoLogin]){
            asteriskManager.manager.addListener(callbackCollector.createCallback(function(managerStatus){
                if(managerStatus[0] !== true){
                    callbackCollector.cancel(false);
                    return;
                }
                if(config[JaSAmApp.Configuration.autoQueryEntities]){
                    asteriskManager.entityManager.queryEntities(callbackCollector.createCallback(), this);
                }
                if(config[JaSAmApp.Configuration.enableEventBuffering]){
                    asteriskManager.eventConnector.eventBuffer = new EventBuffer();
                }
            }, this), this);
            asteriskManager.manager.login();
        }        
        
        callbackCollector.createCallback()();
    };

    this.getAsteriskManager = function(){
        return asteriskManager;
    };
       
    constructor.apply(this, [username, secret]);
}

JaSAmApp.Configuration = {
    baseUrl: 'baseUrl',
    
    autoLogin: 'autoLogin',
    enableKeepalive: 'enableKeepalive',
    enableEventlistening: 'enableEventlistening',
    enableEventBuffering: 'enableEventBuffering',
    
    localUser: 'localUser',
    
    autoQueryEntities: 'autoQueryEntities'
};

exports.JaSAmApp = JaSAmApp;