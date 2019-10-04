// Discord Bot
const Discord = require('discord.js');
const auth = require("./auth.json");
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// client.on('message', msg => {
//   if (msg.content === 'ping') {
//     const embed = new Discord.RichEmbed()
//     // Set the title of the field
//     .setTitle('A slick little embed')
//     // Set the color of the embed
//     .setColor(0xFF0000)
//     // Set the main content of the embed
//     .setDescription('Hello, this is a slick embed!')
//     .setURL('https://www.youtube.com/watch?v=fluhS8Nwo7c')
//     .setThumbnail('https://img.youtube.com/vi/fluhS8Nwo7c/maxresdefault.jpg');

//     msg.channel.send('https://www.youtube.com/watch?v=fluhS8Nwo7c');
//   }
// });

client.login(auth.token);


// Http server
const http = require('http');
const url = require('url');
const { parse } = require('querystring');

// Previous ink (in case of duplicate)
var prevLink;

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

    // Pubsubhubbub Verification
    if (req.method == 'GET'){

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
    }

    // Parse update, extract Youtube link, and post to Discord channel
    if (req.method == 'POST'){

      // Greedily parse Atom Syndication Format - look for a word that locates Youtube link
      // (in this case - the word 'alternate') and acquire it's index
      var linkIdentiferIndex = body.indexOf('alternate');
      
      if (linkIdentiferIndex == -1) return;
          
      // Find the Youtube link within the line:
      // <link rel="alternate" href="https://www.youtube.com/watch?v=XXXXXXXX"/>
      var linkIndexStart = body.indexOf('href', linkIdentiferIndex) + 6;
      var linkIndexStop = body.indexOf('>', linkIndexStart) - 2;
      var link = body.substring(linkIndexStart, linkIndexStop);
      
      console.log(link);

      // Check previous link (in case duplicate is sent)
      if (link != prevLink) {

        prevLink = link;

        // Find channel
        const channel = client.channels.find(ch => ch.name === 'mod-commands');

        if (!channel) return;

        // Send link to discord
        channel.send(link);
      }
    }
  });
}).listen(8080);
