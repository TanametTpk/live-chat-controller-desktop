import Chat from "../models/chat";
import ILiveChatPublisher from "./interfaces/ILiveChatPublisher";
import ILiveChatSubscriber from "./interfaces/ILiveChatSubscriber";
import Discord  from 'discord.js'

export default class DiscordChatPublisher implements ILiveChatPublisher {
    private token: string;
    private client: Discord.Client
    private subscribers: ILiveChatSubscriber[] = [];

    public constructor(token: string) {
        this.token = token
        this.client = new Discord.Client();
    }

    public start = (): void => {          
        this.client.on('message', msg => {
            let chat: Chat = {
                id: msg.id,
                author_name: msg.author.username,
                author_photo: msg.author.displayAvatarURL(),
                message: msg.content
            }

            this.publish([chat])
        })

        this.client.login(this.token);
    }
    
    public stop = (): void => {
        this.client.destroy()
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