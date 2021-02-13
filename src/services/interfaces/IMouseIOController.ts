export interface MousePosition {
    x: number,
    y: number
}

export enum MouseClickKey {
    left="left",
    right="right",
    middle="middle"
}

export default interface IMouseIOController {
    click(key: MouseClickKey): void
    mouseHold(key: MouseClickKey): void
    mouseRelease(key: MouseClickKey): void
    scroll(toPosition: MousePosition): void
    move(toPosition: MousePosition): void
    getMousePosition(): MousePosition
}