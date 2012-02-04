
var asteriskManager = null;
function main(){
    // Define Manager to login
    var manager = new Manager('testmanager', 'sehrsehrgeheim');
    manager.addListener(managerListener, manager);
    
    // Define Asterisk-Server
    asteriskManager = new AsteriskManager(manager);
    asteriskManager.setBaseUrl('/asterisk/mxml');
    
    // Register EventListener
    asteriskManager.eventConnector.addListener(eventListener, this);

    // login manager!
    manager.login();
}

function managerListener(managerStatus){
    if(managerStatus){
        console.info('manager logged in');
        
        // now you can do some work ...

        // enable keepalive
        //asteriskManager.enableKeepalive(true);
        
        // enable eventhandling on raw-events
        //asteriskManager.eventConnector.enableListening(true);
        //setTimeout(function(){asteriskManager.eventConnector.enableListening(false);}, 16000);
        
        asteriskManager.entityManager.queryExtensions(function(){
            console.info(asteriskManager.entityManager.peers);
            console.info(asteriskManager.entityManager.extensions);
        }, this);
        
        // ...
    }else{
        console.info('manager NOT logged in!');
    }
}

function eventListener(response){
    console.info('event fired:', response);
}

// LETS START! :-D
// load files, when done start main function
JaSAmLoader.load(main, '.');
