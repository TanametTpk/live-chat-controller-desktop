import Chat from "../models/chat"
import AbstractLiveChatAdapter from "./abstracts/AbstractLiveChatAdapter";

export default class LiveChatCustomCommandAdapter extends AbstractLiveChatAdapter {
    receivedChat(chats: Chat[]) {
        let matchedChats: Chat[] = []
        for (let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            if (this.isHaveWordInConfig(chat.message)) {
                chats[i].message = this.getNewKeyword(chats[i].message)
                matchedChats.push(chats[i])
            }
        }

        this.liveChatSubscriber.receivedChat(matchedChats)
    }
}