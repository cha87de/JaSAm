
var asteriskManager = null;
function main(){
    // Define Manager to login
    var manager = new Manager('testmanager', 'sehrsehrgeheim');
    manager.addListener(managerListener, manager);
    
    // Define Asterisk-Server
    asteriskManager = new AsteriskManager(manager);
    asteriskManager.setBaseUrl('/asterisk/mxml'); // IMPORTANT: path must be relative on the same domainname for browser's policy reasons
    
    // Register EventListener for Raw-Events
    //asteriskManager.eventConnector.addListener(rawEventListener, this);
    
    // Register EventListener for EntityEvents (NOTE: only works with enableListening(true))
    asteriskManager.entityManager.addListener(entityEventListener, this);    

    // login manager!
    manager.login();
}

function managerListener(managerStatus){
    if(managerStatus[0] === true){
        console.info('manager logged in');
        // now you can do some work ... some examples follows

        // enable keepalive (IMPORTANT: not necessary when using enableListening(true))
        //asteriskManager.enableKeepalive(true);
        
        // enable eventhandling on raw-events for 30 seconds
        asteriskManager.eventConnector.enableListening(true);
        setTimeout(function(){
            // shutdown
            asteriskManager.eventConnector.enableListening(false); 
            asteriskManager.manager.logout(); 
            console.info('stopped!');
        }, 30000);
        
        // query all available entities from server
        asteriskManager.entityManager.queryEntities(function(){
            // list all entities
            console.info('channels: ', asteriskManager.entityManager.channelManager.channels,
                'extensions: ', asteriskManager.entityManager.extensionManager.extensions,
                'peers: ', asteriskManager.entityManager.peerManager.peers,
                'queues: ', asteriskManager.entityManager.queueManager.queues);
        },this);
        
        // ... even more stuff here ...
        
    }else{
        console.info('manager NOT logged in!');
    }
}

function rawEventListener(response){
    response = response[0];
    console.info('raw event fired:', response);
}

function entityEventListener(entityEvent){
    entityEvent = entityEvent[0];
    console.debug('entityEvent:', entityEvent.type, entityEvent.entity);
}

// LETS START! :-D
// load files, when done start main function
JaSAmLoader.load(main, '.');
