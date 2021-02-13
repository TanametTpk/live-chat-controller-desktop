export default interface IKeyboardIOController {
    press(key: string): void
    keyboardHold(key: string): void
    keyboardRelease(key: string): void
}