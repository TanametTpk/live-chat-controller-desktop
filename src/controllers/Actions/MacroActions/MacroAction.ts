import IMacroPlayer from "../../../services/interfaces/IMacroPlayer";
import FullMatchAction from "../abstracts/FullMatchAction";

export default class MacroAction extends FullMatchAction {
    private controller: IMacroPlayer;

    public constructor(controller: IMacroPlayer) {
        super([])
        this.controller = controller
    }

    do(command: string): void {
        if (this.controller.isPlaying(command)) return
        this.controller.play(command)
    }

    public isMatch(command: string): boolean {
        const keywords: string[] = this.controller.getMacroList()
        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i];
            if (keyword === command) {
                return true
            }
        }

        return false
    }
}