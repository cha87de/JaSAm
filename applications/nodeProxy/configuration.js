var configuration = {
    socketServer:{
        token: '1234',
        port: '5859'
    },
    
    classicHttpServer:{
        token: '1234',
        port: '5860',

        // used in tasks/CallDetailRecord
        mysqlLogin: {
            user: 'nodejs',
            password: 'secret'
        }
    },
    
    // login information for asterisk server
    baseUrl: 'http://tel.rsu-hausverwalter.de:8088/asterisk/mxml',
    username: 'testmanager',
    password: 'sehrsehrgeheim'
};
exports = configuration;