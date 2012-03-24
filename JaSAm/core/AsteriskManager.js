var BasicManager = require('../core/BasicManager.js').BasicManager;
var Commander = require('../core/Commander.js').Commander;
var EventConnector = require('../core/EventConnector.js').EventConnector;
var EntityManager = require('../entities/EntityManager.js').EntityManager;

var AsteriskManager = function(manager){
    manager.setAsteriskManager(this);
        
    /**
     * Private variables
     */
    var keepalive = false;
    var keepaliveTimer = null;

    /**
     * Public variables
     */
    this.localUser = null;
    this.manager = manager; 
    this.commander = new Commander(this);    
    this.eventConnector = new EventConnector(this);
    this.entityManager = new EntityManager(this);
    
    
    this.enableKeepalive = function(keepaliveParam){
        keepalive = keepaliveParam;
        if(keepalive){
            var fkt = keepaliveAction;
            var self = this;
            keepaliveTimer = setInterval(function(){fkt.call(self);}, 2000); // 2s, später 60s
        }else{
            clearInterval(keepaliveTimer);
            keepaliveTimer = null;
        }
    };
    
    var keepaliveAction = function(){
        try{
            this.commander.createAction('ping').execute();
        }catch(o){
            console.info('exception ping ', o);
        }
    };

};
AsteriskManager.prototype = new BasicManager();

exports.AsteriskManager = AsteriskManager;