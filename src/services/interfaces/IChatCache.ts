import Chat from "../../models/chat";

export default interface IChatCache {
    store(chats: Chat[]): Chat[]
    clear(): void
}