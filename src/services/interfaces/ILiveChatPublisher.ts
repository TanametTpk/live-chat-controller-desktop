import ILiveChatSubscriber from "./ILiveChatSubscriber";

export default interface ILiveChatPublisher {
    start(): void
    stop():void
    register(subscriber: ILiveChatSubscriber): void
}