from re import compile
from os import getenv
from discord import Client, Intents, Message, Forbidden, NotFound, HTTPException


TOKEN = getenv('DISCORD_BOT_TOKEN')
TOKEN_PATTERN = r'[A-Za-z\d]{24}\.[\w-]{6}\.[\w-]{27}|mfa\.[\w-]{84}'


pattern = compile(TOKEN_PATTERN)
intents = Intents.all()
bot = Client(intents=intents)


async def scan_message(message: Message):
    if message.author.id == bot.user.id:
        return

    if pattern.search(message.content) is None:
        return

    if not message.channel.permissions_for(message.guild.me).manage_messages:
        print('error: Token detected, but could not be deleted due to lack of permissions')

        return

    try:
        await message.delete()
        print(
            f'Token detected and {message.author.display_name} message deleted')

    except Forbidden:
        print('error: Token detected, but could not be deleted due to lack of permissions')

    except NotFound:
        print('error: Token detected, but deletion failed because no message was found')

    except HTTPException:
        print('error: Token detected, but message deletion failed')


@bot.event
async def on_message(message: Message):
    await scan_message(message)


@bot.event
async def on_message_edit(_: Message, after: Message):
    await scan_message(after)


bot.run(TOKEN)
