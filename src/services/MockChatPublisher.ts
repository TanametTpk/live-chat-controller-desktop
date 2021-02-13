import Chat from "../models/chat";
import ILiveChatPublisher from "./interfaces/ILiveChatPublisher";
import ILiveChatSubscriber from "./interfaces/ILiveChatSubscriber";

export default class MockChatPublisher implements ILiveChatPublisher {
    private subscribers: ILiveChatSubscriber[] = [];
    private chats: Chat[]

    public constructor(messages: string[]) {
        let newChat: Chat[] = []
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            newChat.push({
                id: "1",
                "author_name": "tester",
                "author_photo": "url.photo.test",
                "message": message
            })
        }
        this.chats = newChat
    }

    public start = (): void => {
        this.publish(this.chats)
    }
    
    public stop = (): void => {}

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