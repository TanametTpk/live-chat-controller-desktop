import Chat from "../models/chat"
import AbstractLiveChatAdapter from "./abstracts/AbstractLiveChatAdapter";

export default class LiveChatReplaceAdapter extends AbstractLiveChatAdapter {
    receivedChat(chats: Chat[]) {
        let replacedChats: Chat[] = []

        for (let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            const words: string[] = chat.message.split(" ")
            let result: string = chat.message

            for (let j = 0; j < words.length; j++) {
                const word = words[j];

                if (this.isHaveWordInConfig(word)) {
                    let newWord: string = this.getNewKeyword(word)
                    result = result.replace(new RegExp(word, "g"), newWord)
                }
            }

            let newChat: Chat = {
                ...chats[i],
                message: result,
            }

            replacedChats.push(newChat)
        }

        this.liveChatSubscriber.receivedChat(chats)
    }
}