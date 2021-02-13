import ioHook from 'iohook';
import ICommandPublisher from './interfaces/ICommandPublisher';
import ICommandSubscriber from "./interfaces/ICommandSubscriber";

interface Keydown {
    keycode: number
    rawcode: number
    type: string
    altKey: boolean
    shiftKey: boolean
    ctrlKey: boolean
    metaKey: boolean
}

export enum Key {
    f4=62,
    f5=63,
    f6=64,
    esc=1
}

export default class LocalIOPublisher implements ICommandPublisher {
    private subscribers: ICommandSubscriber[] = [];

    public start(): void {
        ioHook.start()
        ioHook.on('keydown', (event: Keydown) => {
            for (let i = 0; i < this.subscribers.length; i++) {
                const subscriber = this.subscribers[i];
                let command: string = ""

                if (event.keycode === Key.f5) command = "reset"
                else if (event.keycode === Key.f6) command = "record"
                else if (event.keycode === Key.esc) command = "stop-record"
                else if (event.keycode === Key.f4) command = "exit"
                else command = `${event.keycode}`
                subscriber.received([`${command}`])
            }
        })
    }

    stop(): void {
        ioHook.stop()
    }

    register(subscriber: ICommandSubscriber): void {
        this.subscribers.push(subscriber)
    }
}