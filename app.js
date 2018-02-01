/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
//var bot = new builder.UniversalBot(connector);

if(process.env.MicrosoftAppId) {
    bot.set('storage', tableStorage);
}

var DialogLabels = {
    Products: 'Products',
    Friends: 'Friends'
};

//session.send('You said ' + session.message.text);
//bot.dialog('/',

var bot = new builder.UniversalBot(connector, [ 
    function (session) {
        builder.Prompts.choice(
            session,
            'Are you looking support for products or friends?',
            [DialogLabels.Products, DialogLabels.Friends],
            {
                maxRetries: 3,
                retryPrompt: 'Not a valid option'
            });
    },
    function(session, result){
        var selection = result.response.entity;
        switch(selection) {
            case DialogLabels.Products:
                return session.send("You selected Products");
            case DialogLabels.Hotels:
                return session.send("You selected Hotels");
        }
    }
]);