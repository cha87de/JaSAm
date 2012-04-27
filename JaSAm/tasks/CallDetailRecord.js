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
                ' `dst` != "s" AND ( ' +
                    ' `src` = "'+extension + '" OR' +
                    ' `dst` = "'+extension + '" OR' +
                    ' `channel` = "'+agentId + '%" OR' +
                    ' `dstchannel` = "'+agentId + '%"' + 
                ' ) ';
        client.query(
            'SELECT SQL_CALC_FOUND_ROWS * FROM `cdr` '+
            whereStatement + 
            ' ORDER BY `calldate` DESC' +
            ' LIMIT ' + start + ', ' + limit,
            function selectCb(err, results, fields) {
                var result = null;
                if (err) {
                    result = {
                        "success": false,
                        "errorInfo": err
                    };
                    callback.apply(scope, [JSON.stringify(result)]);
                } else {
                    client.query(
                        "SELECT FOUND_ROWS()",
                        function selectCb(err, total, fields) {
                            if (err) {
                                result = {
                                    "success": false,
                                    "errorInfo": err
                                };
                            } else {
                                result = {
                                    "success": true,
                                    "data": results,
                                    "total": total[0]['FOUND_ROWS()']
                                };
                            }
                            callback.apply(scope, [JSON.stringify(result)]);
                        }
                    );
                }
                client.end();
            }
        );
    };
    
};
CallDetailRecord.prototype = new Task();

exports.CallDetailRecord = CallDetailRecord;