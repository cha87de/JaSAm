
var asteriskManager = null;
function main(){
    document.getElementById('loginForm').onsubmit = doLogin;
}

function doLogin(){
    var username = document.getElementById('loginUsername').value;
    var secret = document.getElementById('loginSecret').value;

    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('outputPanel').style.display = 'none';

    // Define Manager to login
    var manager = new Manager(username, secret);
    manager.addListener(managerListener, manager);
    
    // Define Asterisk-Server
    asteriskManager = new AsteriskManager(manager);
    asteriskManager.setBaseUrl('/asterisk/mxml'); // IMPORTANT: path must be relative on the same domainname for browser's policy reasons    
    
    manager.login();
    
    return false;
}

function managerListener(managerStatus){
    if(managerStatus[0] === true){
        document.getElementById('loginPanel').style.display = 'none';
        document.getElementById('outputPanel').style.display = 'block';
        
        asteriskManager.entityManager.extensionManager.addListener(updateExtensions, this);
        asteriskManager.eventConnector.enableListening(true);        
        
        asteriskManager.entityManager.extensionManager.queryExtensions(updateExtensions, this);        
    }else{
        document.getElementById('loginPanel').style.display = 'block';
        document.getElementById('outputPanel').style.display = 'none';        
    }
}

function updateExtensions(){
    document.getElementById('statusPanel').innerHTML = 'Last Update: ' + new Date();
    var extensions = asteriskManager.entityManager.extensionManager.extensions;
    var table = document.getElementById('extensions');
    
    // Empty Table
    while(table.childNodes.length >= 3)
        table.removeChild(table.lastChild);
    
    for(var id in extensions){
        var extension = extensions[id];
        
        var row = document.createElement('tr');
        var column1 = document.createElement('td');
        column1.innerHTML = id;
        var column2 = document.createElement('td');
        column2.innerHTML = extension.status;
        
        row.appendChild(column1);
        row.appendChild(column2);
        
        table.appendChild(row);
    }
}

// LETS START! :-D
// load files, when done start main function
JaSAmLoader.load(main, '.');
