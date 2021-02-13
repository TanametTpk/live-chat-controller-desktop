import IKeyboardIOController from "../../../services/interfaces/IKeyboardIOController";
import FullMatchAction from "../abstracts/FullMatchAction";

export default class KeyboardPressAction extends FullMatchAction {
    private controller: IKeyboardIOController;

    public constructor(controller: IKeyboardIOController, keywords: string[]) {
        super(keywords)
        this.controller = controller
    }

    do(command: string): void {
        let key: string
        let splitedCommand: string[] = command.split(" ")

        if (splitedCommand.length < 2) return
        key = splitedCommand[1]

        if (command.includes("hold")) {
            this.controller.keyboardHold(key)
        }else if (command.includes("release")) {
            this.controller.keyboardRelease(key)
        }else {
            this.controller.press(key)
        }
    }
    
}