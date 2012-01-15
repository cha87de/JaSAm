var manager = new AsteriskManager('webmanager', 'abc456!');
manager.login(function(success){
    if(success)
        console.info('erfolgreich!');
    else
        console.info('falsch!');

    manager.executeCommand('status', {}, function(result){
        console.info(result);
        
        manager.logout(function(){
            console.info('beendet.');
        }, null);

    }, null);

}, null);
