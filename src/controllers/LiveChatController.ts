import Chat from '../models/chat';
import IKeyboardIOController from '../services/interfaces/IKeyboardIOController';
import ILiveChatSubscriber from '../services/interfaces/ILiveChatSubscriber';
import IMacroPlayer from '../services/interfaces/IMacroPlayer';
import IMouseIOController from '../services/interfaces/IMouseIOController';
import IAction from './Actions/interfaces/IAction';
import KeyboardPressAction from './Actions/KeyboardActions/KeyboardPressAction';
import MacroAction from './Actions/MacroActions/MacroAction';
import MouseClickAction from './Actions/MouseActions/MouseClickAction';
import MouseMoveAction from './Actions/MouseActions/MouseMoveAction';
import MouseScrollAction from './Actions/MouseActions/MouseScrollAction';
import * as ActionKeywords from '../keywords';

export default class LiveChatController implements ILiveChatSubscriber {
  private mouseController: IMouseIOController;
  private keyboardController: IKeyboardIOController;
  private macroController: IMacroPlayer;
  private actions: IAction[] = [];

  public constructor(
    mouseController: IMouseIOController,
    keyboardController: IKeyboardIOController,
    macroController: IMacroPlayer
  ) {
    this.mouseController = mouseController;
    this.keyboardController = keyboardController;
    this.macroController = macroController;
    this.setupActions();
  }

  private setupActions() {
    this.actions = [
      new MouseMoveAction(
        this.mouseController,
        ActionKeywords.mouseMoveKeywords
      ),

      new MouseClickAction(
        this.mouseController,
        ActionKeywords.mouseClickKeywords
      ),

      new MouseScrollAction(
        this.mouseController,
        ActionKeywords.mouseScrollKeywords
      ),

      new KeyboardPressAction(
        this.keyboardController,
        ActionKeywords.keyboardKeywords
      ),

      new MacroAction(this.macroController),
    ];
  }

  public receivedChat = (chats: Chat[]) => {
    for (let i = 0; i < chats.length; i++) {
      const chat = chats[i];
      this.doAction(chat.message);
    }
  };

  private doAction = (command: string) => {
    for (let i = 0; i < this.actions.length; i++) {
      const action = this.actions[i];

      if (action.isMatch(command)) {
        action.do(command);
        break;
      }
    }
  };
}
