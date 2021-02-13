import Chat from "../models/chat";
import IChatCache from "./interfaces/IChatCache";

export default class ChatCache implements IChatCache {
    private chat: Chat[] = []
    private chatMap: Map<string, Chat> = new Map()
    private MAXITEMS: number = 100
    private isFirstTime: boolean

    public constructor(maxitems?: number) {
        if (maxitems) this.MAXITEMS = maxitems
        this.isFirstTime = true
    }

    public store(chats: Chat[]): Chat[] {
        let newChats: Chat[] = this.findNewChat(chats)
        this.chat = [
            ...this.chat,
            ...newChats
        ]

        for (let i = 0; i < newChats.length; i++) {
            const newChat = newChats[i];
            this.chatMap.set(newChat.id, newChat)
        }

        if (this.chat.length > this.MAXITEMS) {
            let overItem: number = this.chat.length - this.MAXITEMS
            for (let i = 0; i < overItem; i++) {
                const overChat: Chat | undefined = this.chat.shift()
                if (!overChat) break

                this.chatMap.delete(overChat.id)
            }
        }

        if (this.isFirstTime) {
            this.isFirstTime = false
            return []
        }


        return newChats
    }

    public clear(): void {
        this.chat = []
        this.chatMap.clear()
    }

    private isAlreadyReceivedChat(newChat: Chat): boolean {
        return this.chatMap.has(newChat.id)
    }

    private findNewChat(receivedChats: Chat[]): Chat[] {
        let results = []

        for (let i = receivedChats.length - 1; i >= 0; i--) {
            const chat = receivedChats[i];
            if (this.isAlreadyReceivedChat(chat)) break;

            results.push(chat)
        }

        return results.reverse()
    }

}