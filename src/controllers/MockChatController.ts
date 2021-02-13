import Chat from "../models/chat";
import IKeyboardIOController from "../services/interfaces/IKeyboardIOController";
import ILiveChatSubscriber from "../services/interfaces/ILiveChatSubscriber";
import IMouseIOController from "../services/interfaces/IMouseIOController";

export default class MockChatController implements ILiveChatSubscriber {
    public receivedChat = (chats: Chat[]) => {
        for (let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            console.log(chat);
        }
    }
}