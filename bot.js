 /**************************************************
 ***************************************************
 * Discord Bot
 * 
 * Instantiates and authorizes the bot. Also
 * contains bot specific functions like responding
 * to messages and the server introductions.
 * 
 *************************************************** 
 ***************************************************/

// Discord Bot requirements
const Discord = require('discord.js');
const auth = require("./auth.json");

// Instantiate the bot
const bot = new Discord.Client();

// Bot login
bot.login(auth.token);

// Message to console upon bot being ready
bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

// Bot responds to message
bot.on('message', msg => {
  if (msg.content === 'ping') {
    const embed = new Discord.RichEmbed()
    // Set the title of the field
    .setTitle('A slick little embed')
    // Set the color of the embed
    .setColor(0xFF0000)
    // Set the main content of the embed
    .setDescription('Hello, this is a slick embed!')
    .setURL('https://www.youtube.com/watch?v=fluhS8Nwo7c')
    .setThumbnail('https://img.youtube.com/vi/fluhS8Nwo7c/maxresdefault.jpg');
    msg.channel.send(embed);
  }
});


 /**************************************************
 ***************************************************
 * HTTP Server
 * 
 * Used to subscribe and fetch youtube push
 * notifcations and relay them to the ONC Discord
 * server.
 * 
 *************************************************** 
 ***************************************************/

// Http server
const http = require('http');

// Variable to hold previous link (detect duplicate posts)
var prevLinks = [];

// Object to hold Youtube subscriptions
var youtubeChannels = [
  ['mod-commands', 'Richard Constantine'],
  ['tech-news', 'Linus Tech Tips'],
  ['game-news', 'Spawn Wave', 'Inside Gaming', 'Nintendo', 'Xbox', 'PlayStation']
]

http.createServer(function (req, res) {
  
  // Print Request info
  console.log(req.method);
  console.log(req.headers);
  console.log(req.url);

  // Extract Request Body
  let body = '';
  req.on('data', chunk => {
      body += chunk.toString();
  });

  // After request has completed
  req.on('end', () => {
    
    console.log(body);

    // GET - Pubsubhubbub Verification
    if (req.method == 'GET'){

      respondToChallenge(req, res);

    }

    // POST - Parse update, extract Youtube link, and post to Discord channel
    if (req.method == 'POST'){

      // Acquire Youtube link 
      let link = getLink(body);

      // Check previous link (in case duplicate is sent)
      if (!prevLinks.includes(link) && link != '') {

        // Store previous link in case of duplicate requests
        prevLinks.push(link);

        // Find Disocrd channel
        discordChannel = findChannel(getName(body));
        channel = bot.channels.find(ch => ch.name === discordChannel);

        // Send to disord channel if exists
        if (channel) {
          channel.send(link);
        }
      }
    }
  });
}).listen(8080);

 /**************************************************
 ***************************************************
 * respondToChallenge
 * 
 * 
 *
 * 
 *************************************************** 
 ***************************************************/

function respondToChallenge(req, res) {

      // Indices within query string
      var challengeStart = req.url.indexOf('&') + 1;
      var challengeStop = req.url.indexOf('&', challengeStart);
      var codeStart = req.url.indexOf('=', challengeStart) + 1;
      
      // Acquire challenge
      var challenge = req.url.substring(challengeStart, challengeStop);
      var challengeCode = req.url.substring(codeStart, challengeStop);
    
      // Write 200 OK and challenge (if subscribing)
      res.writeHead(200);
      res.end(challengeCode);

      console.log(challenge);
      console.log(challengeCode);
      return;
}

 /**************************************************
 ***************************************************
 * getName
 * 
 * 
 *
 * 
 *************************************************** 
 ***************************************************/

function getName(body) {

    // Greedily parse Atom Syndication Format - look for a word that locates Youtube channel
    // name (in this case - the word 'name') and acquire it's index
    var nameIdentiferIndex = body.indexOf('name');
    
    // Cannot find name - return empty string
    if (nameIdentiferIndex == -1) 
      return '';
        
    // Find the Youtube channel name within the line:
    // <name>Channel Name Here</name>
    var linkIndexStart = nameIdentiferIndex + 5;
    var linkIndexStop = body.indexOf('<', linkIndexStart);
    var name = body.substring(linkIndexStart, linkIndexStop);
    
    // Return link
    console.log(name);
    return name;
}

 /**************************************************
 ***************************************************
 * getLink 
 * 
 * 
 *
 * 
 *************************************************** 
 ***************************************************/

function getLink(body) {

    // Greedily parse Atom Syndication Format - look for a word that locates Youtube link
    // (in this case - the word 'alternate') and acquire it's index
    var linkIdentiferIndex = body.indexOf('alternate');
    
    // Cannot find link - return empty string
    if (linkIdentiferIndex == -1) 
      return '';
        
    // Find the Youtube link within the line:
    // <link rel="alternate" href="https://www.youtube.com/watch?v=XXXXXXXX"/>
    var linkIndexStart = body.indexOf('href', linkIdentiferIndex) + 6;
    var linkIndexStop = body.indexOf('>', linkIndexStart) - 2;
    var link = body.substring(linkIndexStart, linkIndexStop);
    
    // Return link
    console.log(link);
    return link;
}

 /**************************************************
 ***************************************************
 * findChannel
 * 
 * 
 * Finds a discord channel (in the ONC server)
 * associated with the Youtube video posted
 * 
 *************************************************** 
 ***************************************************/


function findChannel(name){

  for(i = 0; i < youtubeChannels.length; i++){
    for(j = 1; j < youtubeChannels[i].length; j++){
      
      if(name == youtubeChannels[i][j]) {
        console.log('Sending to Discord @ channel ' + youtubeChannels[i][0]);
        return youtubeChannels[i][0];
      }
    }
  }

  return '';

}

function printDiscordChannels() {

    for(i = 0; i < youtubeChannels.length; i++){
        console.log(youtubeChannels[i][0]);
      }
}

function printYoutubeSubs() {

  
  for(i = 0; i < youtubeChannels.length; i++){
    for(j = 1; j < youtubeChannels[i].length; j++){
      console.log(youtubeChannels[i][j]);
    }
  }
}

function printChannelAndSubs() {

  
  for(i = 0; i < youtubeChannels.length; i++){
    for(j = 0; j < youtubeChannels[i].length; j++){
      console.log(youtubeChannels[i][j]);
    }
  }
}