from os import getenv
from discord import Client, Intents, NotFound, Forbidden, HTTPException, Member, Guild
from logging import getLogger


logger = getLogger(__name__)


DISCORD_BOT_TOKEN = getenv('DISCORD_BOT_TOKEN')
BAN_IDS_PATH = 'ban_ids.txt'


def get_ban_ids():
    ban_ids = set()

    with open(BAN_IDS_PATH, encoding='utf_8') as f:
        for line in f:
            ban_ids.add(int(line))

    return ban_ids


async def process_ban(member: Member):
    ban_ids = get_ban_ids()
    guild: Guild = member.guild
    me: Member | None = guild.me

    if me is None:
        logger.error(
            f'Failed to retrieve bot member: {guild.name} ({guild.id})')

        return

    if not me.guild_permissions.ban_members:
        logger.error(
            f'Bot does not have ban authority: {guild.name} ({guild.id})')

        return

    if not member.id in ban_ids:
        return

    try:
        await member.ban(reason='Because it was included in the ban list')
        logger.info(
            f'Ban was a success: {member.name} from {guild.name} ({guild.id})')

    except NotFound:
        logger.error(
            f'The requested user was not found: {guild.name} ({guild.id})')

    except Forbidden:
        logger.error(
            f'You do not have the proper permissions to ban: {guild.name} ({guild.id})')

    except HTTPException:
        logger.error(
            f'Banning failed: {guild.name} ({guild.id})')

intents = Intents.all()
bot = Client(intents=intents)


@bot.event
async def on_ready():
    for guild in bot.guilds:
        for member in guild.members:
            await process_ban(member)


@bot.event
async def on_member_join(member):
    await process_ban(member)


bot.run(DISCORD_BOT_TOKEN)
