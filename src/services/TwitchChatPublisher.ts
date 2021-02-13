import Chat from "../models/chat";
import ILiveChatPublisher from "./interfaces/ILiveChatPublisher";
import ILiveChatSubscriber from "./interfaces/ILiveChatSubscriber";
import tmi from 'tmi.js'

export default class TwitchChatPublisher implements ILiveChatPublisher {
    private client: tmi.Client
    private subscribers: ILiveChatSubscriber[] = [];

    public constructor(channel_name: string) {
        this.client = new tmi.Client({
            connection: { reconnect: true },
            channels: [ channel_name ]
        })
    }

    public start = (): void => {          
        this.client.connect();

        this.client.on('message', (channel, tags, message, self) => {
            let chat: Chat = {
                id: tags.id || `${Math.random()}`,
                author_name: tags.username || "unknows",
                author_photo: "",
                message
            }
            this.publish([chat])
        });
    }
    
    public stop = (): void => {
        this.client.disconnect()
    }

    public register = (subscriber: ILiveChatSubscriber): void => {
        this.subscribers.push(subscriber)
    }

    private publish(chats: Chat[]): void{
        for (let i = 0; i < this.subscribers.length; i++) {
            const subscriber = this.subscribers[i];
            subscriber.receivedChat(chats)
        }
    }
}