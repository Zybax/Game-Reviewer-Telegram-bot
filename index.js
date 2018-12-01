const fetch = require('node-fetch');
const GAMESPOTKEY = "94afbb2fb7689de96ed34a9bead33701b7cffb32";
// Include Custom MiddleWare to handle arguments
const commandArgsMiddleware = require('./commandArgs');
// Include Telegraf module
const Telegraf = require('telegraf');

//Mark down formatting
const extra = require('telegraf/extra');
const markup = extra.markdown();

// Create a bot using TOKEN provided as environment variable
const bot = new Telegraf(process.env.TOKEN);

// enable our middleware
bot.use(commandArgsMiddleware());

// Import replies file
const replies = require('./replies')

// Extract reply_to_message.message_id field from Telegraf context
// If not present, return null
// const getReplyToMessageId = context => (
//   context.message.reply_to_message ? context.message.reply_to_message.message_id : null
// )

// This method will send the reply, based on the answer type
// (text / gif / sticker). See replies.js for objects structure.
// const sendReply = (context, reply) => {
//   // reply method will be the Telegraf method for sending the reply
//   let replyMethod = {
//     text: context.reply,
//     gif: context.replyWithDocument,
//     sticker: context.replyWithSticker
//   } [reply.type]

//   replyMethod(reply.value, {
//     // this will make the bot reply to the original message instead of just sending it
//     reply_to_message_id: getReplyToMessageId(context)
//   })
// }

// /list command - will send all the triggers defined in replies.js.
// bot.command('list', context => {
//     context.reply(
//         'Available triggers:\n\n' +
//         Object.keys(replies).join('\n')
//     )
// })

bot.command('help', context => {
  context.reply("type /commands to see a list of all available commands");
})
bot.command('commands', context => {
  context.reply(`
  */help*\nThe old trusty help command
  \n
  \n*/review*\nargs: gamename\nex: /review Hollow Knight
  \nThis command will give you a review of any game you want! well... most of them
  \nNote: For now... game names like Batman: Arkham City requires the ":" in the gamename argument in order for the command to work, this will be fixed in future versions`, markup);
})

bot.command('review', context => {
  console.log(context.state.command.args + " args");
  if (context.state.command.args === '' || context.state.command.args === undefined) {
    context.reply("You didn't specify a game to review");
  }
  else {
    fetch(`http://www.gamespot.com/api/reviews/?api_key=${GAMESPOTKEY}&format=json&filter=title:${context.state.command.args}`)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        if (json.number_of_total_results <= 0) {
          context.reply("Sorry i don't know the game " + context.state.command.args, markup )
            .catch(function (reason) {
              console.log(reason);
            });
        } else {
          console.log(json.results);
          const title = json.results[0].title;
          context.reply(`*${title}* \n${json.results[0].deck} \n\n *${json.results[0].score}*
          \nRead the full article on: ${json.results[0].site_detail_url}`, markup)
            .catch(function (reason) {
              console.log(reason);
            });
        }
      })
      .catch(function (reason) {
        console.log(reason);
      });
  }
})

// TODO

//bot.command('info', context => {})

// Listen on every text message, if message.text is one of the trigger,
// send the reply
// bot.on('text', context => {
//   let cmd = context.message.text.toLowerCase()
//   if (cmd in replies)
//     sendReply(context, replies[cmd])
// })
// console.log(replies);
bot.startPolling();