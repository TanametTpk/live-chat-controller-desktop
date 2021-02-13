import Chat from "../models/chat";
import ILiveChatPublisher from "./interfaces/ILiveChatPublisher";
import ILiveChatSubscriber from "./interfaces/ILiveChatSubscriber";
import YouTube from 'youtube-live-chat'

export interface YoutubeConfig {
    CHANNEL_ID: string
    API_KEY: string
}

export default class YoutubeApiLiveChatPublisher implements ILiveChatPublisher {
    private youtubeCli: any;
    private subscribers: ILiveChatSubscriber[] = []

    public constructor(configs: YoutubeConfig) {
        this.youtubeCli = new YouTube(configs.CHANNEL_ID, configs.API_KEY)
    }

    public start = (): void => {
        this.youtubeCli.on('ready', () => {
            console.log('ready!')
            this.youtubeCli.listen(1000)
        })
        
        this.youtubeCli.on('message', (data: any) => {
            let chat: Chat = {
                id: data.id,
                author_name: data.authorDetails.displayName,
                author_photo: data.authorDetails.profileImageUrl,
                message: data.snippet.displayMessage
            }
            this.publish([chat])
        })
        
        this.youtubeCli.on('error', (error: any) => {
            console.log(error)
        })
    }
    
    public stop = (): void => {
        this.youtubeCli.stop()
    }

    public register = (subscriber: ILiveChatSubscriber): void => {
        this.subscribers.push(subscriber)
    }

    private publish = (chats: Chat[]): void => {
        for (let i = 0; i < this.subscribers.length; i++) {
            const subscriber = this.subscribers[i];
            subscriber.receivedChat(chats)
        }
    }
}