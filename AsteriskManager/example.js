
// simple login on asterisk
var manager = new AsteriskManager('webmanager', 'abc456!');
manager.setBaseUrl('/asterisk/mxml');

manager.action.login(function(success){

    if(success){
        console.info('login successful');
    }else{
        console.info('login failed');
        return;
    }

    // Execute Action 'Status'
    manager.executeCommand('status', {}, function(result){
        console.info('status: ', result);
        
        // logout
        manager.action.logout(function(){
            console.info('logout done');
        }, this);

    }, this);

}, window);
