import IMouseIOController, { MousePosition } from "../../../services/interfaces/IMouseIOController";
import FullMatchAction from "../abstracts/FullMatchAction";

export default class MouseMoveAction extends FullMatchAction {
    private controller: IMouseIOController;

    public constructor(controller: IMouseIOController, keywords: string[]) {
        super(keywords)
        this.controller = controller
    }

    do(command: string): void {
        let currentPosition: MousePosition = this.controller.getMousePosition()
        let diffPosition: MousePosition = {x: 0, y: 0}
        let moveDistance: number = 100
        let strongFactor: number = 5

        if (command.includes("up")) diffPosition.y -= moveDistance
        else if (command.includes("down")) diffPosition.y += moveDistance
        else if (command.includes("left")) diffPosition.x -= moveDistance
        else if (command.includes("right")) diffPosition.x += moveDistance

        if (command.includes("strong")) {
            diffPosition.x *= strongFactor
            diffPosition.y *= strongFactor
        }

        currentPosition.x += diffPosition.x
        currentPosition.y += diffPosition.y
        this.controller.move(currentPosition)
    }
    
}