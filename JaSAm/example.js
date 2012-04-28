
var asteriskManager = null;
// MAIN FUNCTION!
function main(){
    BasicManager.debugMode = true;
    
    // register dom-eventlistener
    document.getElementById('loginForm').onsubmit = doLogin;
    document.getElementById('controlExtensionForm').onsubmit = setExtension;
    document.getElementById('controlOriginateForm').onsubmit = originateCall;
    document.getElementById('controlQueueForm').onsubmit = toggleQueue;
    document.getElementById('controlIncomingCallHangup').onclick = callHangup;
    document.getElementById('controlIncomingCallTransferForm').onsubmit = callTransfer;
    document.getElementById('controlIncomingCallMute').onclick = callMute;
    
    
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
        asteriskManager.baseUrl = '/asterisk/mxml';
        
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
        
        // update incoming-info
        var extension = asteriskManager.entityManager.extensionManager.extensions[asteriskManager.localUser];
        var callActive = false;
        var infotext = "";
        if(extension.status == Extension.State.incall){
            callActive = true;
            infotext = "In call! (" + extension.getPeer().getChannels()[0].connectedlinenum + ")";            
        }else if(extension.status == Extension.State.ringing){
            callActive = true;
            infotext = "Phone Ringing! (" + extension.getPeer().getChannels()[0].connectedlinenum + ")";
        }
        listenIncomingCallOutput(callActive, infotext);
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
            Exten: remoteNumber,
            channel: 'SIP/' + asteriskManager.localUser,
            context: 'from-internal',
            priority: 1,
            callerid:  remoteNumber
        };
        action.execute(simpleErrorCallback, this);
        
    }catch(exc){
        console.info(exc);
    }
    return false;
}

function callHangup(){
    try{
        var extension = asteriskManager.entityManager.extensionManager.extensions[asteriskManager.localUser];
        var channels = extension.getPeer().getChannels();
        for(var channelKey in channels){
            var channel = channels[channelKey];
            var action = asteriskManager.commander.createAction('hangup');
            action.params = {
                channel: channel.id
            };
            action.execute(simpleErrorCallback, this);
        }
    }catch(exc){
        console.info(exc);
    }
}

function callTransfer(){
    try{
        var remoteNumber = document.getElementById('controlIncomingCallTransferTo').value;
        
        var extension = asteriskManager.entityManager.extensionManager.extensions[asteriskManager.localUser];
        var channels = extension.getPeer().getChannels();
        for(var channelKey in channels){
            var channel = channels[channelKey];
            var action = asteriskManager.commander.createAction('atxfer');
            action.params = {
                //channel: channel.bridgedChannelId,
                channel: channel.id,
                Exten: remoteNumber,
                context: 'from-internal',
                priority: 1 
            };
            action.execute(simpleErrorCallback, this);
        }
    }catch(exc){
        console.info(exc);
    }
    return false;
}

function callMute(){
    try{
        var extension = asteriskManager.entityManager.extensionManager.extensions[asteriskManager.localUser];
        var channels = extension.getPeer().getChannels();
        for(var channelKey in channels){
            var channel = channels[channelKey];
            var action = asteriskManager.commander.createAction('MuteAudio');
            action.params = {
                channel: channel.bridgedChannelId, // channel to park
                Direction: 'all',
                State: channel.muted ? 'off' : 'on'
            };
            channel.muted = channel.muted ? false : true;
            action.execute(simpleErrorCallback, this);
        }
    }catch(exc){
        console.info(exc);
    }
}

function toggleQueue(){
    try{
        var queueId = document.getElementById('controlQueueId').value;
        var penalty = document.getElementById('controlQueuePenalty').value;
        var queue = asteriskManager.entityManager.queueManager.queues[queueId];
        var agentId = 'SIP/' + asteriskManager.localUser;
        var actionCommand;
        
        if(queue.agents[agentId]){
            if(queue.agentPenalties[agentId] != penalty)
                // update agent
                actionCommand = 'queuepenalty';
            else
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
        action.execute(simpleErrorCallback, this);
    }catch(exc){
        console.info('exception', exc);
    }
    return false;    
}

function managerListener(managerStatus){
    if(managerStatus[0] === true){
        // manager login successful
        showPanel(Panel.Output);

//        needs nodejsserver in background.
//        var waitevent = asteriskManager.commander.createAction('waitevent');
//        waitevent.differingBaseUrl = "/asteriskEvent";
//        asteriskManager.commander.defineAction(waitevent);

        // register listeners
        asteriskManager.entityManager.extensionManager.addListener(updateExtensions, this);
        asteriskManager.entityManager.peerManager.addListener(updatePeers, this);        
        asteriskManager.entityManager.channelManager.addListener(updateChannels, this);        
        asteriskManager.entityManager.queueManager.addListener(updateQueues, this);        
        asteriskManager.entityManager.agentManager.addListener(updateAgents, this);
        asteriskManager.entityManager.channelManager.addListener(listenIncomingCall, this);

        // query entities once
        asteriskManager.entityManager.queryEntities(updateAll, this);
        /*asteriskManager.entityManager.extensionManager.queryExtensions(updateExtensions, this);
        asteriskManager.entityManager.peerManager.queryPeers(updatePeers, this);
        asteriskManager.entityManager.channelManager.queryChannels(updateChannels, this);
        asteriskManager.entityManager.queueManager.queryQueues(updateQueues, this);
        asteriskManager.entityManager.agentManager.queryAgents(updateAgents, this);*/   

        asteriskManager.eventConnector.enableListening(true);        
    }else{
        // manager login unsuccessful / logout successful
        showPanel(Panel.Login);
    }
}

function updateAll(){
    updateExtensions();
    updatePeers();
    updateChannels();
    updateQueues();
    updateAgents();
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
        var agentArr = queue.getAgents();
        for(var agentKey in agentArr){
            var agent = agentArr[agentKey];
            agents += agent.id + " (" + queue.agentPenalties[agent.id] + ") ";
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
        var queuesOutput = "";
        var queues = agent.getQueues();
        for(var queueKey in queues)
            queuesOutput += queues[queueKey].id + " ";        
        
        var row = document.createElement('tr');
        var column1 = document.createElement('td');
        column1.innerHTML = id;
        
        var column2 = document.createElement('td');
        column2.innerHTML = agent + "<br/>Queues: " + queuesOutput;
        
        row.appendChild(column1);
        row.appendChild(column2);
        
        table.appendChild(row);
        updateQueues();
    }
}

function listenIncomingCall(entityEvent){
    entityEvent = entityEvent[0];
    if(entityEvent.entity && entityEvent.entity.getPeer().getExtension().id == asteriskManager.localUser){
        // local phone action!
        if(entityEvent.type == EntityEvent.Types.New || entityEvent.type == EntityEvent.Types.Update){
            var output = "";
            if(entityEvent.entity.getPeer().getExtension().status == Extension.State.ringing)
                output = "Phone Ringing!";
            else
                output = "In call!";
            output += " (" + entityEvent.entity.connectedlinenum + ")";
            listenIncomingCallOutput(true, output);
        }else if(entityEvent.type == EntityEvent.Types.Remove){
            listenIncomingCallOutput(false, "");
        }else{
            listenIncomingCallOutput(true, "unknown!");
        }
    }
}

function listenIncomingCallOutput(showIncoming, output){
    if(showIncoming){
            document.getElementById('controlIncomingNothing').style.display = 'none';
            document.getElementById('controlIncomingNewCall').style.display = 'block';                  
            document.getElementById('controlIncomingCallInfo').innerHTML = output;
    }else{
            document.getElementById('controlIncomingNothing').style.display = 'block';
            document.getElementById('controlIncomingNewCall').style.display = 'none';            
            document.getElementById('controlIncomingCallInfo').innerHTML = "";
    }
}

// utilitiy-functions follows ...

function simpleErrorCallback(response){
    if(!response.isSuccess()){
        var msg = "";
        for(var key in response.head){
            var value = response.head[key];
            msg += key + ": " + value + "\n";
        }
        alert("SimpleErrorCallback\n\n" + msg);
    }
}

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
