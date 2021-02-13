export default interface IAction {
    do(command: string): void
    isMatch(command: string): boolean
}