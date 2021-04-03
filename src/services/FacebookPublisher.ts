import Chat from "../models/chat";
import ILiveChatPublisher from "./interfaces/ILiveChatPublisher";
import ILiveChatSubscriber from "./interfaces/ILiveChatSubscriber";
import EventSource from 'eventsource';

export default class TwitchChatPublisher implements ILiveChatPublisher {
    private client: EventSource
    private subscribers: ILiveChatSubscriber[] = [];

    public constructor(access_token: string, video_id: string, comment_rate: string) {
        this.client = new EventSource(`https://streaming-graph.facebook.com/${video_id}/live_comments?access_token=${access_token}&comment_rate=${comment_rate}&fields=from{name,id},message`)
    }

    public start = (): void => {          
        this.client.onmessage = (event: MessageEvent<any>) => {
            let data = JSON.parse(event.data)
            let chat: Chat = {
                id: data.id || `${Math.random()}`,
                author_name: data.from?.name || "unknows",
                author_photo: data.from?.picture ||"",
                message: data.message
            }
            this.publish([chat])
        };
    }
    
    public stop = (): void => {
        this.client.close()
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