import Chat from '../models/chat';
import { BrowserWindow } from 'electron';
import ILiveChatSubscriber from '../services/interfaces/ILiveChatSubscriber';

export default class NotificationLiveChatController implements ILiveChatSubscriber {
    private mainWindow: BrowserWindow

    public constructor(mainWindow: BrowserWindow){
        this.mainWindow = mainWindow
    }

    public receivedChat = (chats: Chat[]) => {
        this.mainWindow.webContents.send('receivedChats', chats)
    }
}