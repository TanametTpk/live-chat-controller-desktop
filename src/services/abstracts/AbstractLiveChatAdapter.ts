import Chat from "../../models/chat";
import { KeywordConfig } from "../../utils/loadConfig";
import ILiveChatSubscriber from "../interfaces/ILiveChatSubscriber";

export default abstract class AbstractLiveChatAdapter implements ILiveChatSubscriber {
    protected keywordMapping: Map<string, string>
    protected liveChatSubscriber: ILiveChatSubscriber

    public constructor(liveChatSubscriber: ILiveChatSubscriber, configs: KeywordConfig[]) {
        this.keywordMapping = new Map()
        this.liveChatSubscriber = liveChatSubscriber
        this.mapConfig(configs)
    }

    abstract receivedChat(chats: Chat[]): void;

    private mapConfig(configs: KeywordConfig[]) {
        for (let i = 0; i < configs.length; i++) {
            const config = configs[i];
            
            for (let j = 0; j < config.words.length; j++) {
                const word = config.words[j];
                this.keywordMapping.set(word, config.toCommand)
            }
        }
    }

    protected isHaveWordInConfig(word: string) {
        return this.keywordMapping.has(word)
    }

    protected getNewKeyword(word: string): string {
        return this.keywordMapping.get(word)!
    }
}