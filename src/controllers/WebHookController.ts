import Chat from "../models/chat";
import ILiveChatSubscriber from "../services/interfaces/ILiveChatSubscriber";
import axios from 'axios';

export default class WebHookController implements ILiveChatSubscriber {
    private apiUrl: string[]

    public constructor(api: string[]) {
        this.apiUrl = api
    }

    public receivedChat = (chats: Chat[]) => {
        this.apiUrl.map((api) => axios.post(api, chats))
    }
}