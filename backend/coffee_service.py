#!/usr/bin/env python3
# Copyright 2022 The Wazo Authors (see the AUTHORS file)
# SPDX-License-Identifier: GPL-3.0-or-later

import ari
import uvicorn
import logging
import yaml
import json
from urllib.parse import parse_qs
import asyncio

from typing import List, Dict, Union
from uuid import UUID, uuid4

from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect
from pydantic import BaseModel

from wazo_auth_client import Client as Auth
from wazo_calld_client import Client as Calld
from wazo_websocketd_async_client import Client as Websocket
from wazo_websocketd_async_client.exceptions import AlreadyConnectedException
from fastapi.staticfiles import StaticFiles


logger = logging.getLogger(__name__)
#logger.setLevel(logging.DEBUG)

with open('config.yml') as file:
    configuration = yaml.load(file, yaml.Loader)

app = FastAPI()
app.mount("/static", StaticFiles(directory=".."), name="static")

origins = [
    "*",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
host = configuration['host']
username = configuration['username']
password = configuration['password']
client_id = 'coffee'
expiration = 3600
user_uuid = None
token = None

# Need to be define in the configuration in portal plugin
coffee_id = 8
coffee_exten = 8299

ari_username = 'xivo'
ari_password = 'Nasheow8Eag'
ari = ari.connect('http://localhost:5039', ari_username, ari_password)

def get_token(refresh_token, expired=False):
    global token

    if token == None or expired == True:
        print('Create new token w/ refresh token')
        token_data = auth.token.new('wazo_user', expiration=expiration, refresh_token=refresh_token, client_id=client_id)
        return token_data['token']
    return token

def get_refresh_token():
    global user_uuid, token

    token_data = auth.token.new('wazo_user', access_type='offline', client_id=client_id)
    refresh_token = token_data['refresh_token']
    token = token_data['token']
    user_uuid = token_data['metadata']['uuid']
    return token_data['refresh_token']

auth = Auth(host, username=username, password=password, verify_certificate=False)
refresh_token = get_refresh_token()
calld = Calld(host, token=get_token(refresh_token), verify_certificate=False)
ws = Websocket(host, token=get_token(refresh_token), verify_certificate=False)

class CoffeeManager:
    def __init__(self):
        self.connections = {}
        self.coffee_id = coffee_id
        self.coffee_exten = coffee_exten

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        websocket_id = id(websocket)
        self.connections[websocket_id] = websocket
        print(f"New user is connected")

    async def received_message(self, data):
        await self.send_to(data)
        return True

    def remove(self, websocket: WebSocket):
        del self.connections[id(websocket)]

    def get_participants(self):
        return list_participants(self.coffee_id)

    def add_coffee(self, coffee):
        self.coffee_id = coffee.id
        self.coffee_exten = coffee.exten
        return {"id": coffee.id, "exten": coffee.exten}

    def get_coffee(self):
        return {"id": self.coffee_id, "exten": self.coffee_exten}

    async def broadcast(self, data: str):
        for connection in self.connections:
            ws = self.connections[connection]
            await ws.send_json(data)


manager = CoffeeManager()
queue = asyncio.Queue()


class Coffee(BaseModel):
    id: str
    exten: str


class MOHVolume(BaseModel):
    volume: int


@app.get("/coffee")
def get_coffee():
    return manager.get_coffee()


@app.post("/coffee")
def add_coffee(coffee: Coffee):
    return manager.add_coffee(coffee)


@app.get("/participants")
def get_participants():
    return manager.get_participants()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_json()
    except WebSocketDisconnect:
        manager.remove(websocket)


@app.post("/moh/play")
def play_moh():
    channel = ari.channels.originate(
        endpoint='Local/moh@hackathon',
        context='hackathon',
        extension='join-bridge',
        callerId='"Music Bot" <>'
    )
    music_channel_id = channel.id
    with open('/var/lib/hackathon.txt', 'w') as f:
        f.write(channel.id)

def get_music_channel_id():
    with open('/var/lib/hackathon.txt', 'r') as f:
        return f.read()


@app.post("/moh/stop")
def stop_moh():
    music_channel_id = get_music_channel_id()
    ari.channels.hangup(channelId=music_channel_id)
    music_channel_id = None


@app.post("/moh/volume")
def set_moh_volume(volume: MOHVolume):
    music_channel_id = get_music_channel_id()
    try:
        ari.channels.setChannelVar(channelId=music_channel_id, variable='VOLUME(RX)', value=str(volume.volume), bypassStasis=True)
        ari.channels.setChannelVar(channelId=music_channel_id, variable='VOLUME(TX)', value=str(volume.volume), bypassStasis=True)
    except:
        print('ARI not connected, volume control is impossible')


@app.on_event('startup')
async def app_startup():
    asyncio.ensure_future(wazo_queue())
    asyncio.ensure_future(websocket_controller())


async def wazo_queue():
    while True:
        data = await queue.get()
        await manager.broadcast(data)

def list_participants(conference_id):
    return calld.conferences.list_participants(conference_id)

def parse_participants(participants):
    list_participants = []
    for participant in participants['items']:
        list_participants.append(participant['caller_id_name'])

    if list_participants:
        message = "\n".join(['{} {}'.format("* ", p) for p in list_participants])
        return message

    return None

async def conference_joined(handler):
    await notify(handler)

async def conference_left(handler):
    await notify(handler)

async def notify(handler):
    conference_id = handler['data']['conference_id']
    if conference_id == manager.coffee_id:
        await queue.put(handler)

async def session_expired(handler):
    session_user_uuid = handler['data']['user_uuid']
    if session_user_uuid != user_uuid:
        return

    print('session expired')
    token = get_token(refresh_token, expired=True)
    calld.set_token(token)
    auth.set_token(token)
    await ws.update_token(token)

async def websocket_controller():
    ws.on('conference_participant_joined', conference_joined)
    ws.on('conference_participant_left', conference_left)
    ws.on('auth_session_expire_soon', session_expired)

    await ws.run()

if __name__ == '__main__':
    uvicorn.run("coffee_service:app",
                host="0.0.0.0",
                port=8001,
                reload=False
                )
