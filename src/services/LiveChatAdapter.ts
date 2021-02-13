import Chat from "../models/chat"
import AbstractLiveChatAdapter from "./abstracts/AbstractLiveChatAdapter";

export default class LiveChatAdapter extends AbstractLiveChatAdapter {
    public receivedChat(chats: Chat[]) {
        for (let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            if (this.isHaveWordInConfig(chat.message)) {
                chats[i].message = this.getNewKeyword(chats[i].message)
            }
        }

        this.liveChatSubscriber.receivedChat(chats)
    }
}