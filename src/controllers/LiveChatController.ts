import Chat from "../models/chat";
import IKeyboardIOController from "../services/interfaces/IKeyboardIOController";
import ILiveChatSubscriber from "../services/interfaces/ILiveChatSubscriber";
import IMacroPlayer from "../services/interfaces/IMacroPlayer";
import IMouseIOController from "../services/interfaces/IMouseIOController";
import KeywordBuilder from "../utils/KeywordBuilder";
import IAction from "./Actions/interfaces/IAction";
import KeyboardPressAction from "./Actions/KeyboardActions/KeyboardPressAction";
import MacroAction from "./Actions/MacroActions/MacroAction";
import MouseClickAction from "./Actions/MouseActions/MouseClickAction";
import MouseMoveAction from "./Actions/MouseActions/MouseMoveAction";
import MouseScrollAction from "./Actions/MouseActions/MouseScrollAction";

export default class LiveChatController implements ILiveChatSubscriber {
    private mouseController: IMouseIOController
    private keyboardController: IKeyboardIOController
    private macroController: IMacroPlayer
    private actions: IAction[] = []

    public constructor(
        mouseController: IMouseIOController,
        keyboardController: IKeyboardIOController,
        macroController: IMacroPlayer
    ) {
        this.mouseController = mouseController
        this.keyboardController = keyboardController
        this.macroController = macroController
        this.setupActions()
    }

    private setupActions() {
        this.actions = [
            new MouseMoveAction(this.mouseController, new KeywordBuilder()
            .addKeyword("mouse", true)
            .addKeyword("move", true)
            .addKeywords(["up", "down", "left", "right"], true)
            .addKeyword("strong")
            .build()),

            new MouseClickAction(this.mouseController, new KeywordBuilder()
            .addKeyword("click", true)
            .addKeywords(["left", "right", "middle"])
            .addKeywords(["hold", "release"])
            .build()),

            new MouseScrollAction(this.mouseController, new KeywordBuilder()
            .addKeyword("scroll", true)
            .addKeywords(["up", "down", "left", "right"], true)
            .addKeyword("strong")
            .build()),

            new KeyboardPressAction(this.keyboardController, new KeywordBuilder()
            .addKeyword("press", true)
            .addKeywords([
                'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
                "backspace",
                "delete",
                "enter",
                "tab",
                "escape",
                "up",
                "down",
                "right",
                "left",
                "command",
                "alt",
                "control",
                "shift",
                "space",
                "numpad_0",
                "numpad_1",
                "numpad_2",
                "numpad_3",
                "numpad_4",
                "numpad_5",
                "numpad_6",
                "numpad_7",
                "numpad_8",
                "numpad_9", 
            ], true)
            .addKeywords(["hold", "release"])
            .build()),

            new MacroAction(this.macroController)
        ]
    }

    public receivedChat = (chats: Chat[]) => {
        console.log(chats);
        for (let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            this.doAction(chat.message)
        }
    }

    private doAction = (command: string) => {
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];
            
            if (action.isMatch(command)) {
                action.do(command)
                break
            }
        }
    }
}