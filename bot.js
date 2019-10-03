// Discord Bot
const Discord = require('discord.js');
const auth = require("./auth.json");
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    const embed = new Discord.RichEmbed()
    // Set the title of the field
    .setTitle('A slick little embed')
    // Set the color of the embed
    .setColor(0xFF0000)
    // Set the main content of the embed
    .setDescription('Hello, this is a slick embed!')
    .setURL('https://www.youtube.com/watch?v=fluhS8Nwo7c')
    .setThumbnail('https://img.youtube.com/vi/fluhS8Nwo7c/maxresdefault.jpg')
    
    ;

    msg.channel.send('https://www.youtube.com/watch?v=fluhS8Nwo7c');
  }
});

client.login(auth.token);


// Http server
const http = require('http');
const url = require('url');
const { parse } = require('querystring');

http.createServer(function (req, res) {
  
  // Print Request info
  console.log(req.method);
  console.log(req.headers);
  console.log(req.url);

  // Challenge Indices (used to Subscribe via Pubsubhubbub.appspot.com)
  var challengeStart = req.url.indexOf('&') + 1;
  var challengeStop = req.url.indexOf('&', challengeStart);
  var codeStart = req.url.indexOf('=', challengeStart) + 1;
  
  var challenge = req.url.substring(challengeStart, challengeStop);
  var challengeCode = req.url.substring(codeStart, challengeStop);
  
  console.log(challenge);
  console.log(challengeCode);

  // Extract Request body
  let body = '';
  req.on('data', chunk => {
      body += chunk.toString();
  });

  // After body is complete
  req.on('end', () => {
    
    console.log(body);

    // Write 200 OK and challenge (if subscribing)
    res.writeHead(200);
    res.end(challengeCode);

    // Extract Youtube Link
    var linkIndexStart = body.indexOf('href', body.indexOf('alternate')) + 6;
    var linkIndexStop = body.indexOf('>', linkIndexStart) - 2;
  
    var link = body.substring(linkIndexStart, linkIndexStop);
  
    console.log(link);

    // Find channel
    const channel = client.channels.find(ch => ch.name === 'mod-commands');

    if (!channel) return;

    // Send link
    channel.send(link);

  });
}).listen(8080);
