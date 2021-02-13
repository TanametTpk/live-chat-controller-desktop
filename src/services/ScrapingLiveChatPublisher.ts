import Chat from "../models/chat";
import ChatCache from "./ChatCache";
import IChatCache from "./interfaces/IChatCache";
import ILiveChatPublisher from "./interfaces/ILiveChatPublisher";
import ILiveChatSubscriber from "./interfaces/ILiveChatSubscriber";
import puppeteer from "puppeteer";

export interface ScrapingConfig {
    STREAM_ID: string
    INTERVAL: number
}

export default class ScrapingLiveChatPublisher implements ILiveChatPublisher {
    private streamId: string;
    private interval: number;
    private subscribers: ILiveChatSubscriber[] = [];
    private isStopScraping: boolean;
    private cache: IChatCache;

    public constructor(configs: ScrapingConfig) {
        this.streamId = configs.STREAM_ID
        this.interval = configs.INTERVAL
        this.isStopScraping = false
        this.cache = new ChatCache()
    }

    public start = (): void => {
        this.scripingLiveChat()
    }
    
    public stop = (): void => {
        this.isStopScraping = true
    }

    public register = (subscriber: ILiveChatSubscriber): void => {
        this.subscribers.push(subscriber)
    }

    private publish = (chats: Chat[]): void => {
        for (let i = 0; i < this.subscribers.length; i++) {
            const subscriber = this.subscribers[i];
            subscriber.receivedChat(chats)
        }
    }

    private scripingLiveChat = async() => {
        const browser = await puppeteer.launch({
            headless: false,
            devtools: true,
            args: [
                '--ignore-certificate-errors',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        })
        const page = await browser.newPage()
    
        await page.goto(`https://www.youtube.com/live_chat?v=${this.streamId}&is_popout=1`)
        
        await page.setViewport({ width: 1400, height: 937 })
        
        await page.waitForSelector('#container > #top #input > #input')
    
        while (!this.isStopScraping) {
            let chats: string = await page.evaluate( () => {
                const elements: NodeListOf<Element> = document.querySelectorAll('yt-live-chat-text-message-renderer.yt-live-chat-item-list-renderer')
                const result = []
    
                const chat2Object = (live_chat: Element) => {
                    const element = live_chat
                    let id = element.id
                    let author_name = element.querySelector('#author-name')?.textContent
                    let author_photo = element.querySelector('#author-photo')?.querySelector('img')?.src
                    let message = element.querySelector('#message')?.textContent
                    return {
                        id,
                        author_name,
                        author_photo,
                        message
                    }
                } 
        
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    if (!element) continue
        
                    let chat = chat2Object(element)
                    result.push(chat)
                }
        
                return JSON.stringify(result)
            })
    
            let liveChat: Chat[] = JSON.parse(chats)
            let filterNewChat: Chat[] = this.cache.store(liveChat)
            this.publish(filterNewChat)
            await page.waitForTimeout(this.interval)
        }
    
        await browser.close()
    }
}