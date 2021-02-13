import ICommandSubscriber from "./ICommandSubscriber";

export default interface ICommandPublisher {
    start(): void
    stop():void
    register(subscriber: ICommandSubscriber): void
}