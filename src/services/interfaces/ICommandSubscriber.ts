export default interface ICommandSubscriber {
    received: (commands: string[]) => void
}