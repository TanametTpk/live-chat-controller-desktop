import IKeyboardIOController from "./interfaces/IKeyboardIOController";
import IMouseIOController, { MouseClickKey, MousePosition } from "./interfaces/IMouseIOController";
import robot from 'robotjs';
import ResetableIOController from "./interfaces/ResetableIOController";

export default class RobotJSIOController implements IMouseIOController, IKeyboardIOController, ResetableIOController {
    private keydowns: Map<string, boolean> = new Map()
    private mousedowns: Map<MouseClickKey, boolean> = new Map()

    keyboardHold(key: string): void {
        this.keydowns.set(key, true)
        robot.keyToggle(key, "down");
    }

    keyboardRelease(key: string): void {
        this.keydowns.delete(key)
        robot.keyToggle(key, "up");
    }

    mouseHold(key: MouseClickKey): void {
        this.mousedowns.set(key, true)
        robot.mouseToggle("down", key);
    }

    mouseRelease(key: MouseClickKey): void {
        this.mousedowns.delete(key)
        robot.mouseToggle("up", key);
    }
    
    getMousePosition(): MousePosition {
        return robot.getMousePos()
    }

    click(key: MouseClickKey): void {
        robot.mouseClick(key)
    }

    scroll(toPosition: MousePosition): void {
        let {x, y} = toPosition
        robot.scrollMouse(x, y)
    }

    move(toPosition: MousePosition): void {
        let {x, y} = toPosition
        robot.moveMouseSmooth(x, y)
    }

    press(key: string): void {
        robot.keyTap(key);
    }

    reset(): void{
        this.keydowns.forEach((_, key: string) => {
            this.keyboardRelease(key)
        })

        this.mousedowns.forEach((_, key: MouseClickKey) => {
            this.mouseRelease(key)
        })
    }
}