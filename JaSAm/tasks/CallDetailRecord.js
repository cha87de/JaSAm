var Task = require('./Task.js').Task;

var CallDetailRecord = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var callback = callbackParam;
    var scope = scopeParam;
    
    var agentId = 'SIP/' + args['extension'];
    var extension = args['extension'];
    var start = args['start'];
    var limit = args['limit'];
    var mysql = args['mysql'];
    
    this.run = function (){
        var client = mysql.createClient({
            user: 'nodejs',
            password: 'secret'
        });
        client.query('USE asteriskcdrdb');
        var whereStatement = "";
        if(extension !== undefined)
            whereStatement = ' WHERE '+
                ' `src` = "'+extension + '" OR' +
                ' `dst` = "'+extension + '" OR' +
                ' `channel` = "'+agentId + '%" OR' +
                ' `dstchannel` = "'+agentId + '%"';
        client.query(
            'SELECT * FROM `cdr` '+
            whereStatement + 
            ' LIMIT ' + start + ', ' + limit,
            function selectCb(err, results, fields) {
                if (err) {
                    callback.apply(scope, [err]);
                }else{
                    callback.apply(scope, [JSON.stringify(results)]);
                }
                client.end();
            }
        );
    };
    
};
CallDetailRecord.prototype = new Task();

exports.CallDetailRecord = CallDetailRecord;