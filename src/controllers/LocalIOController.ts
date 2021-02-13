import ICommandSubscriber from "../services/interfaces/ICommandSubscriber";
import IMacroPlayer from "../services/interfaces/IMacroPlayer";
import IMacroRecorder from "../services/interfaces/IMacroRecorder";
import ResetableIOController from "../services/interfaces/ResetableIOController";
import MacroManager from "../services/MacroManager";
import WebServerController from "./WebServerController";

export default class LocalIOController implements ICommandSubscriber {
    private isRecording: boolean
    private ioController: ResetableIOController
    private recordingMacroName: string = ""
    private macroManager: IMacroRecorder & IMacroPlayer = MacroManager.getInstance()

    public constructor(ioController: ResetableIOController) {
        this.isRecording = false
        this.ioController = ioController
    }
    
    public received(commands: string[]){
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];

            if (command === "reset") this.reset()
            else if (command === "record") this.recordMacro()
            else if (command === "stop-record") this.stopRecordMacro()
            else if (command === "exit") this.exit()
        }
    }

    private recordMacro() {
        if (this.isRecording) return

        // do something
        this.isRecording = true
        const max: number = Number.MAX_SAFE_INTEGER
        const min: number = 1
        const randomName: string = `macro-${Math.floor(Math.random() * (max - min) + min)}`
        this.recordingMacroName = randomName
        console.log("Recording...")
        this.macroManager.record(randomName)
    }

    private stopRecordMacro() {
        if (this.isRecording){
            this.isRecording = false
            WebServerController.getInstance().sendNewMacro(this.recordingMacroName)
            console.log("Save macro as name:", this.recordingMacroName)
            this.recordingMacroName = ""
        }
    }

    private reset() {
        console.log("Reset controller completed.");
        this.ioController.reset()
    }

    private exit() {
        process.exit()
    }
}