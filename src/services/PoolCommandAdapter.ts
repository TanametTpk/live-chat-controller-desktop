import Chat from "../models/chat";
import { KeywordConfig, PoolConfig } from "../utils/loadConfig";
import ILiveChatSubscriber from "./interfaces/ILiveChatSubscriber";

export default class PoolCommandAdapter implements ILiveChatSubscriber {
    private commandMapping: Map<string, number>
    private keywordMaping: Map<string, KeywordConfig>
    private liveChatSubscriber: ILiveChatSubscriber
    private defaultRatio: number

    public constructor(liveChatSubscriber: ILiveChatSubscriber, keywordConfig: KeywordConfig[], poolConfig: PoolConfig) {
        this.commandMapping = new Map()
        this.keywordMaping = new Map()
        this.liveChatSubscriber = liveChatSubscriber
        this.defaultRatio = poolConfig.defaultRatio
        this.setupKeywordMap(keywordConfig)
    }

    private setupKeywordMap(keywordConfig: KeywordConfig[]) {
        for (let i = 0; i < keywordConfig.length; i++) {
            const config = keywordConfig[i];
            for (let j = 0; j < config.words.length; j++) {
                const word = config.words[j];
                this.keywordMaping.set(word, config)
            }
        }
    }

    private isHaveKeyword(word: string): boolean {
        return this.keywordMaping.has(word)
    }

    private getKeywordConfig(word: string): KeywordConfig {
        return this.keywordMaping.get(word)!
    }

    private getRatio(word: string): number {
        let ratio: number = this.defaultRatio

        if (this.isHaveKeyword(word)) {
            let config: KeywordConfig = this.getKeywordConfig(word)
            ratio = config.ratio || ratio
        }
        return ratio
    }

    public receivedChat(chats: Chat[]): void {
        for (let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            this.store(chat)
        }

        let commands: string[] = this.getTriggerCommand()
        let newChats: Chat[] = []
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            let mockChat: Chat = {
                id: `${Math.random()}`,
                author_name: "pull-adapter",
                author_photo: "",
                message: command
            }
            newChats.push(mockChat)
        }
        this.liveChatSubscriber.receivedChat(newChats)
    }

    private store(chat: Chat) {
        let amount: number = 1
        if (this.commandMapping.has(chat.message)) {
            amount = this.commandMapping.get(chat.message) || 1
            amount += 1
        }

        this.commandMapping.set(chat.message, amount)
    }

    private getTriggerCommand(): string[] {
        let isTrigger: boolean = false
        let commands: string[] = []
        for(let key of Array.from( this.commandMapping.keys())) {
            const value: number = this.commandMapping.get(key) || 1
            if (value >= this.getRatio(key)) {
                isTrigger = true
                commands.push(key)
            }
        }

        if (isTrigger) {
            this.commandMapping.clear()
        }

        return commands
    }
}