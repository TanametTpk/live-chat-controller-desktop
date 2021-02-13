import Chat from "../../models/chat";

export default interface ILiveChatSubscriber {
    receivedChat: (chats: Chat[]) => void
}