from mattermost import MMApi

class Mattermost:

    def __init__(self, config):
        self.mm = MMApi("https://{}/api".format(config['domain']))
        self.mm.login(bearer=config['token'])
        self.channel_id = config['channel_id']
        self.props = {
            "override_username": "Coffee machine",
            "override_icon_emoji": True
        }

    def post(self, message):
        self.mm.create_post(self.channel_id, message, props=self.props)

    def notify(self, handler, participants):
        participant = handler['data']['caller_id_name'] or handler['data']['caller_id_number']
        if handler['name'] == 'conference_participant_joined':
            message = f"@here Participant {participant} has joined the Coffee conference!"
        if handler['name'] == 'conference_participant_left':
            message = f"Participant {participant} has left the Coffee conference!"

        if participants:
            self.props.update({
                "attachments": [{
                    "author_name": "Participants currently present in coffee room",
                    "text": participants,
                }]
            })

        self.post(message)
