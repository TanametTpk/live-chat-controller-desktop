import IAction from "../interfaces/IAction";

export default abstract class FullMatchAction implements IAction {
    protected keywords: string[]

    public constructor(keywords: string[]) {
        this.keywords = keywords
    }

    abstract do(command: string): void

    public isMatch(command: string): boolean {
        for (let i = 0; i < this.keywords.length; i++) {
            const keyword = this.keywords[i];
            if (keyword === command) {
                return true
            }
        }

        return false
    }

}