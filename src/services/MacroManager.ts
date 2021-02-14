import IMacroPlayer from "./interfaces/IMacroPlayer";
import IMacroRecorder from "./interfaces/IMacroRecorder";
import util from 'util'
import WebServerController from "../controllers/WebServerController";
import path from 'path';
import { app } from 'electron';
const exec = util.promisify(require('child_process').exec);

const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, '../assets')
    : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const pythonPath: string = getAssetPath('./env/Scripts/python')
const scriptPath: string = getAssetPath('./scripts/macroRecorder/commandline.py')

async function listCommands(): Promise<string[] | undefined> {
    const { stdout, stderr } = await exec(`${pythonPath} ${scriptPath} -n dummy -c list`);
    if (stderr) return

    return JSON.parse(stdout.replace(/'/g, "\"")) as string[]
}

async function recordMacro(name: string) {
    const { stderr } = await exec(`${pythonPath} ${scriptPath} -n "${name}" -c record`);
    if (stderr) console.log('record macro error:', stderr);
}

async function playMacro(name: string) {
    const { stderr } = await exec(`${pythonPath} ${scriptPath} -n "${name}" -c play`);
    if (stderr) console.log('play macro error:', stderr);
}

async function removeMacro(name: string) {
    const { stderr } = await exec(`${pythonPath} ${scriptPath} -n "${name}" -c remove`);
    if (stderr) console.log('remove macro error:', stderr);
}

async function renameMacro(oldname: string, newName: string) {
    const { stderr } = await exec(`${pythonPath} ${scriptPath} -n "${oldname}" -c update -t "${newName}"`);
    if (stderr) console.log('remove macro error:', stderr);
}

export default class MacroManager implements IMacroRecorder, IMacroPlayer {
    private avaliableMacros: string[]
    private static instance?: IMacroRecorder & IMacroPlayer
    private isRecord: boolean
    private playingMacro: Map<string, boolean>

    public constructor() {
        this.avaliableMacros = []
        this.isRecord = false
        this.playingMacro = new Map()
        this.loadMacro()
    }

    public static getInstance(): IMacroRecorder & IMacroPlayer {
        if (!this.instance) this.instance = new MacroManager()
        return this.instance
    }

    private async loadMacro() {
        const macros: string[] | undefined = await listCommands()
        if (!macros) {
            this.avaliableMacros = []
            return
        }

        this.avaliableMacros = macros
        WebServerController.getInstance().sendMacros(this.avaliableMacros)
    }

    public play(marcoName: string){
        this.playingMacro.set(marcoName, true)
        playMacro(marcoName).then(() => {
            this.playingMacro.delete(marcoName)
            WebServerController.getInstance().sendFinishPlaying()
        })
    }

    public isPlaying(macroName: string): boolean {
        return this.playingMacro.has(macroName)
    }

    public isAnyMacroPlaying(): boolean {
        return this.playingMacro.size > 0
    }

    public getMacroList(): string[] {
        return this.avaliableMacros
    }
    
    public async record(marcoName: string){
        if (this.isRecord) return
        WebServerController.getInstance().sendRecording()
        await recordMacro(marcoName)
        this.loadMacro()
        WebServerController.getInstance().stopRecorded()
    }

    public async update(oldName: string, newName: string) {
        await renameMacro(oldName, newName)
        this.loadMacro()
    }

    public async delete(macroName: string){
        await removeMacro(macroName)
        this.loadMacro()
    }
}