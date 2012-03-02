
var asteriskManager = null;
// MAIN FUNCTION!
function main(){
    // register dom-eventlistener
    document.getElementById('loginForm').onsubmit = doLogin;
    document.getElementById('controlExtensionForm').onsubmit = setExtension;
    document.getElementById('controlOriginateForm').onsubmit = originateCall;
    document.getElementById('controlQueueForm').onsubmit = toggleQueue;
    
    // show login-form
    showPanel(Panel.Login);
    
    // for testing: auto-login
    doLogin();    
}

// event-listener-functions follows ...

function doLogin(){
    try{
        var username = document.getElementById('loginUsername').value;
        var secret = document.getElementById('loginSecret').value;

        showPanel(Panel.Wait);

        // Define Manager to login
        var manager = new Manager(username, secret);
        manager.addListener(managerListener, manager);

        // Define Asterisk-Server
        asteriskManager = new AsteriskManager(manager);
        asteriskManager.setBaseUrl('/asterisk/mxml');

        manager.login();
    }catch(exc){
        console.info(exc);
    }    
    return false;
}

function setExtension(){
    try{
        var localUser = document.getElementById('controlExtensionNumber').value;
        asteriskManager.localUser = localUser;
        updateExtensions();
        
        //document.getElementById('controlExtensionNumber').disabled = true;
        document.getElementById('controlOriginate').style.display = 'block';
        document.getElementById('controlQueue').style.display = 'block';
        document.getElementById('controlIncoming').style.display = 'block';
    }catch(exc){
        console.info(exc);
    }
    return false;
}

function originateCall(){
    try{
        var remoteNumber = document.getElementById('controlOriginateChannel').value;
        
        var action = asteriskManager.commander.createAction('originate');
        action.params = {
            exten: remoteNumber,
            channel: 'SIP/' + asteriskManager.localUser,
            context: 'default',
            priority: 1//,
            //callerid:  // outgoingCallerId
        };
        action.execute(function(response){}, this);
        
    }catch(exc){
        console.info(exc);
    }
    return false;
}

function toggleQueue(){
    try{
        var queueId = document.getElementById('controlQueueId').value;
        var penalty = document.getElementById('controlQueuePenalty').value;
        var queue = asteriskManager.entityManager.queueManager.queues[queueId];
        var agentId = 'SIP/' + asteriskManager.localUser;
        var actionCommand;
        
        if(queue.agents[agentId]){
            // remove agent
            actionCommand = 'queueremove';
        }else{
            // add agent
            actionCommand = 'queueadd';
        }

        var action = new Action(asteriskManager);
        action.name = actionCommand;
        action.params = {
            queue: queueId,
            'interface': agentId,
            penalty: penalty
        };
        action.execute(function(response){}, this);
    }catch(exc){
        console.info('exception', exc);
    }
    return false;    
}

function managerListener(managerStatus){
    if(managerStatus[0] === true){
        showPanel(Panel.Output);
        
        asteriskManager.entityManager.extensionManager.addListener(updateExtensions, this);
        asteriskManager.entityManager.peerManager.addListener(updatePeers, this);        
        asteriskManager.entityManager.channelManager.addListener(updateChannels, this);        
        asteriskManager.entityManager.queueManager.addListener(updateQueues, this);        
        asteriskManager.entityManager.agentManager.addListener(updateAgents, this);
        
        asteriskManager.entityManager.extensionManager.queryExtensions(updateExtensions, this);
        asteriskManager.entityManager.peerManager.queryPeers(updatePeers, this);
        asteriskManager.entityManager.channelManager.queryChannels(updateChannels, this);
        asteriskManager.entityManager.queueManager.queryQueues(updateQueues, this);
        asteriskManager.entityManager.agentManager.queryAgents(updateAgents, this);

        asteriskManager.entityManager.channelManager.addListener(listenIncomingCall, this);

        asteriskManager.eventConnector.enableListening(true);        
    }else{
        showPanel(Panel.Login);
    }
}

function updateExtensions(){
    document.getElementById('extensionsStatus').innerHTML = 'Last Update: ' + getCurrentTime();
    var extensions = asteriskManager.entityManager.extensionManager.extensions;
    var table = document.getElementById('extensions');
    
    // Empty Table
    while(table.childNodes.length >= 3)
        table.removeChild(table.lastChild);
    
    for(var id in extensions){
        var extension = extensions[id];
        var info = extension;
        if(extension.status == Extension.State.available)
            info = "<span style=\"color:green;\">" + extension + "</span>";
        else if(extension.status == Extension.State.incall || extension.status == Extension.State.ringing)
            info = "<span style=\"color:yellow;\">" + extension + "</span>";
        else if(extension.status == Extension.State.unreachable)
            info = "<span style=\"color:black;\">" + extension + "</span>";
        else
            info = "<span style=\"color:silver;\">" + extension + "</span>";

        // build row with two columns
        var row = document.createElement('tr');
        var column1 = document.createElement('td');
        if(id == asteriskManager.localUser)
            column1.innerHTML = "<strong>" + id + "</strong>";
        else
            column1.innerHTML = id;
        var column2 = document.createElement('td');
        if(id == asteriskManager.localUser)
            column2.innerHTML = "<strong>" + info + "</strong>";
        else
            column2.innerHTML = info;
        
        row.appendChild(column1);
        row.appendChild(column2);
        
        table.appendChild(row);
    }
}

function updatePeers(){
    document.getElementById('peersStatus').innerHTML = 'Last Update: ' + getCurrentTime();
    var peers = asteriskManager.entityManager.peerManager.peers;
    var table = document.getElementById('peers');
    
    // Empty Table
    while(table.childNodes.length >= 3)
        table.removeChild(table.lastChild);
    
    for(var id in peers){
        var peer = peers[id];

        var row = document.createElement('tr');
        var column1 = document.createElement('td');
        column1.innerHTML = id;
        
        var column2 = document.createElement('td');
        column2.innerHTML = peer;
                
        row.appendChild(column1);
        row.appendChild(column2);
        
        table.appendChild(row);
    }
}

function updateChannels(){
    document.getElementById('channelsStatus').innerHTML = 'Last Update: ' + getCurrentTime();
    var channels = asteriskManager.entityManager.channelManager.channels;
    var table = document.getElementById('channels');
    
    // Empty Table
    while(table.childNodes.length >= 3)
        table.removeChild(table.lastChild);
    
    for(var id in channels){
        var channel = channels[id];

        var row = document.createElement('tr');
        var column1 = document.createElement('td');
        column1.innerHTML = id;
        
        var column2 = document.createElement('td');
        column2.innerHTML = channel;
        
        row.appendChild(column1);
        row.appendChild(column2);
        
        table.appendChild(row);
    }
}

function updateQueues(){
    document.getElementById('queuesStatus').innerHTML = 'Last Update: ' + getCurrentTime();
    var queues = asteriskManager.entityManager.queueManager.queues;
    var table = document.getElementById('queues');
    
    // Empty Table
    while(table.childNodes.length >= 3)
        table.removeChild(table.lastChild);
    
    for(var id in queues){
        var queue = queues[id];
        var agents = "";
        for(var agentKey in queue.agents){
            agents += queue.agents[agentKey].id + " ";
        }
        
        var row = document.createElement('tr');
        var column1 = document.createElement('td');
        column1.innerHTML = id;
        
        var column2 = document.createElement('td');
        column2.innerHTML = queue + "<br/>Agents: " + agents;
        
        row.appendChild(column1);
        row.appendChild(column2);
        
        table.appendChild(row);
    }
}

function updateAgents(){
    document.getElementById('agentsStatus').innerHTML = 'Last Update: ' + getCurrentTime();
    var agents = asteriskManager.entityManager.agentManager.agents;
    var table = document.getElementById('agents');
    
    // Empty Table
    while(table.childNodes.length >= 3)
        table.removeChild(table.lastChild);
    
    for(var id in agents){
        var agent = agents[id];
        var queues = "";
        for(var queueKey in agent.queues)
            queues += agent.queues[queueKey].id + " ";        
        
        var row = document.createElement('tr');
        var column1 = document.createElement('td');
        column1.innerHTML = id;
        
        var column2 = document.createElement('td');
        column2.innerHTML = agent + "<br/>Queues: " + queues;
        
        row.appendChild(column1);
        row.appendChild(column2);
        
        table.appendChild(row);
        updateQueues();
    }
}

function listenIncomingCall(entityEvent){
    entityEvent = entityEvent[0];
    if(entityEvent.entity && entityEvent.entity.calleridnum == asteriskManager.localUser){
        // local phone ringing or in call!
        if(entityEvent.type == EntityEvent.Types.New || entityEvent.type == EntityEvent.Types.Update){
            document.getElementById('controlIncomingNothing').style.display = 'none';
            document.getElementById('controlIncomingNewCall').style.display = 'block';      
            
            if(entityEvent.entity.channelstate == 5)
                document.getElementById('controlIncomingCallInfo').innerHTML = "Phone Ringing!";
            else
                document.getElementById('controlIncomingCallInfo').innerHTML = "In call!";
        }else if(entityEvent.type == EntityEvent.Types.Remove){
            document.getElementById('controlIncomingNothing').style.display = 'block';
            document.getElementById('controlIncomingNewCall').style.display = 'none';            
            document.getElementById('controlIncomingCallInfo').innerHTML = "";
        }else{
            document.getElementById('controlIncomingNothing').style.display = 'none';
            document.getElementById('controlIncomingNewCall').style.display = 'block';            
            document.getElementById('controlIncomingCallInfo').innerHTML = "unknown!";
        }
    }
}

// utilitiy-functions follows ...

function showPanel(id){
    document.getElementById('waitPanel').style.display = (id == 1 ? 'block' : 'none');            
    document.getElementById('loginPanel').style.display = (id == 2 ? 'block' : 'none');
    document.getElementById('outputPanel').style.display = (id == 3 ? 'block' : 'none');        
}
var Panel = {Wait: 1, Login: 2, Output: 3};

function getCurrentTime(){
    var now = new Date();
    return now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();    
}

// LETS START! :-D
// load files, when done start main function
JaSAmLoader.load(main, '.');
