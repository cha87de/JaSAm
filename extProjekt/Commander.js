/*
 * File: Commander.js
 * Date: Wed Jan 11 2012 18:02:57 GMT+0100 (CET)
 * 
 * This file was generated by Ext Designer version 1.1.2.
 * http://www.sencha.com/products/designer/
 *
 * This file will be generated the first time you export.
 *
 * You should implement event handling and custom methods in this
 * class.
 */

Commander = Ext.extend(CommanderUi, {
    asteriskManager: null,
    
    initComponent: function() {
        Commander.superclass.initComponent.call(this);
        
        // Registriere Listener auf UI-Komponenten
        this.actionCombo.on('select', this.selectAction, this);
        this.buttonExecute.on('click', this.execute, this);
        this.buttonPropertyAdd.on('click', this.propertyAdd, this);
        this.buttonPropertyRemove.on('click', this.propertyRemove, this);
    },
    
    setAsteriskManager: function(asteriskManager){
        this.asteriskManager = asteriskManager;
        this.startup();
    },    
    
    startup: function(){
        // Lade mögliche Aktionen in ComboBox
        var commands = this.asteriskManager.actionCollection.getCommands();
        this.actionCombo.getStore().loadData(commands);
    },
    
    selectAction: function(combo, record, index){
        // Lade Beschreibung der Aktion
        var description = record.get('description');
        this.actionDescription.setValue(description);
        // Lade mögliche Properties in PropertyGrid
        var properties = this.asteriskManager.actionCollection.getCommandProperties(record.get('action'), function(properties){
            this.paramsGrid.getStore().loadData(properties);
        }, this);
        
    },
    
    execute: function(){
        // Hole Action
        var action = this.actionCombo.getValue();
        
        // Hole Parameter
        var params = this.extractRecordData(this.paramsGrid.getStore().getRange());
        
        // Starte Command!
        this.resultArea.update("Starte Abfrage ...");
        this.asteriskManager.executeCommand(action, params, this.printResult, this);
    },

    extractRecordData: function(records){
        var result = new Object();
        for(var i = 0; i < records.length; i++){
            var prop = records[i].data.property;
            var val = records[i].data.defaultvalue;
            result[prop] = val;
        }
        return result;
    }, 

    printResult: function(results){
        var htmlOutput = "";
        for(var itemKey in results){
            if(!results[itemKey] || itemKey == "remove")
                continue;
            
            var item = results[itemKey];
            var itemStr = itemKey + ": <br/>" +
                "<table width=\"100%\">";
            for(var propKey in item){
                var prop = item[propKey];
                itemStr += "<tr><td width=\"30%\"><b>"+propKey+":</b></td>"
                            + "<td width=\"70%\">" + prop + "</td></tr>";
            }
            itemStr += "</table>";
            htmlOutput += "<div style=\"margin: 5px; padding: 5px; border: solid 1px silver;\">" + itemStr + "</div>"
        }        
        this.resultArea.update(htmlOutput);
    },   

    propertyAdd: function(){
        var recordType = this.paramsGrid.getStore().recordType;
        var record = new recordType({
            property: '',
            defaultvalue: ''
        });
        this.paramsGrid.stopEditing();
        this.paramsGrid.store.insert(0, record);
        this.paramsGrid.startEditing(0, 1);        
    },
    
    propertyRemove: function(){
        var sm = this.paramsGrid.getSelectionModel();
        var selected = sm.getSelectedCell();
        if(!selected)
            return;
        var record = this.paramsGrid.getStore().getAt(selected[0]);
        if (!record)
            return;
        this.paramsGrid.store.remove(record);
    }
    
});