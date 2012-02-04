/*
 * This is the Index-Script of PhoneManager
 * author: Christopher B. Hauser
 */

Ext.onReady(function() {
    Ext.QuickTips.init();
    
    JaSAmLoader.load(function(){
        var loginWindow = new LoginWindow();
        loginWindow.show();
    }, '../JaSAm/');
});
