import IMouseIOController, { MouseClickKey } from "../../../services/interfaces/IMouseIOController";
import FullMatchAction from "../abstracts/FullMatchAction";

export default class MouseClickAction extends FullMatchAction {
    private controller: IMouseIOController;

    public constructor(controller: IMouseIOController, keywords: string[]) {
        super(keywords)
        this.controller = controller
    }

    do(command: string): void {
        let key: MouseClickKey

        if (command.includes("right")) key = MouseClickKey.right
        else if (command.includes("middle")) key = MouseClickKey.middle
        else key = MouseClickKey.left

        if (command.includes("hold")) {
            this.controller.mouseHold(key)
        }else if (command.includes("release")) {
            this.controller.mouseRelease(key)
        }else {
            this.controller.click(key)
        }
    }
    
}