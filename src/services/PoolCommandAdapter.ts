import Chat from "../models/chat";
import ILiveChatSubscriber from "./interfaces/ILiveChatSubscriber";

export default class PoolCommandAdapter implements ILiveChatSubscriber {
    protected commandMapping: Map<string, number>
    protected liveChatSubscriber: ILiveChatSubscriber
    private ratio: number = 5

    public constructor(liveChatSubscriber: ILiveChatSubscriber, ratio: number) {
        this.commandMapping = new Map()
        this.liveChatSubscriber = liveChatSubscriber
        this.ratio = ratio
    }

    public receivedChat(chats: Chat[]): void {
        for (let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            this.store(chat)
        }

        let command: string = this.getTriggerCommand()

        if (command) {
            let mockChat: Chat = {
                id: `${Math.random()}`,
                author_name: "pull-adapter",
                author_photo: "",
                message: command
            }
            
            this.liveChatSubscriber.receivedChat([mockChat])
        }
    }

    private store(chat: Chat) {
        let amount: number = 1
        if (this.commandMapping.has(chat.message)) {
            amount = this.commandMapping.get(chat.message) || 1
            amount += 1
        }

        this.commandMapping.set(chat.message, amount)
    }

    private getTriggerCommand(): string {
        let isTrigger: boolean = false
        let command: string = ""
        for(let key of Array.from( this.commandMapping.keys())) {
            const value: number = this.commandMapping.get(key) || 1
            
            if (value > this.ratio) {
                isTrigger = true
                command = key
                break
            }
        }

        if (isTrigger) {
            this.commandMapping.clear()
        }

        return command
    }
}