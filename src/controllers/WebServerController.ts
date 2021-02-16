import express from 'express'
import http from 'http'
import socket, {Socket} from 'socket.io'
import MacroManager from '../services/MacroManager'
import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { readConfig } from '../utils/loadConfig'

export default class WebServerController {
    private port: number
    private app: express.Application
    private http: http.Server
    private io: socket.Server
    private isStart: boolean
    private mainWindow: BrowserWindow
    private static instance: WebServerController

    public constructor(port: number, mainWindow: BrowserWindow){
        this.port = port
        this.app = express()
        this.http = http.createServer(this.app)
        this.io = new socket.Server(this.http)
        this.isStart = false
        this.mainWindow = mainWindow
        this.setup()
    }

    public static getInstance(port: number = 3000, mainWindow?: BrowserWindow): WebServerController {
        if (!this.instance && mainWindow) this.instance = new WebServerController(port, mainWindow)
        return this.instance
    }

    private setup(): void{
        this.io.on("connection", (socket: Socket) => {
            this.sendMacros(MacroManager.getInstance().getMacroList())

            socket.on('rename-macro', (oldName: string, newName: string) => {
                MacroManager.getInstance().update(oldName, newName)
            })

            socket.on('remove-macro', (name: string) => {
                MacroManager.getInstance().delete(name)
            })

            socket.on('play-macro', (name: string) => {
                MacroManager.getInstance().play(name)
            })
        })

        ipcMain.on('macro:get', (event: IpcMainEvent) => {
            event.returnValue = MacroManager.getInstance().getMacroList()
        })

        ipcMain.on("macro:rename", (_: IpcMainEvent, oldName: string, newName: string) => {
            MacroManager.getInstance().update(oldName, newName)
        })

        ipcMain.on("macro:remove", (_: IpcMainEvent, name: string) => {
            MacroManager.getInstance().delete(name)
        })

        ipcMain.on("macro:play", (_: IpcMainEvent, name: string) => {
            MacroManager.getInstance().play(name)
        })

        ipcMain.on("macro:record", (_: IpcMainEvent, name: string) => {
            MacroManager.getInstance().record(name)
        })

        ipcMain.on("macro:ready", (_: IpcMainEvent) => {
            MacroManager.getInstance().setReady(true)
        })

        ipcMain.on('macro:quit', (_: IpcMainEvent) => {
            MacroManager.getInstance().setReady(false)
        })
    }

    public start(): void {
        this.isStart = true
        this.http.listen(this.port)
    }

    public stop(): void {
        this.http.close()
    }

    public sendNewMacro(macroName: string): void {
        if (!this.isStart) return
        this.io.emit('new-macro', macroName)
        this.mainWindow.webContents.send('macro:new', macroName)
    }

    public sendMacros(macroList: string[]): void {
        if (!this.isStart) return
        this.io.emit('macros', macroList)
        this.mainWindow.webContents.send('macro:list', macroList)
    }

    public sendRecording(): void {
        this.mainWindow.webContents.send('macro:onStartRecord')
    }

    public stopRecorded(): void {
        this.mainWindow.webContents.send('macro:onStopRecord')
    }

    public sendFinishPlaying(): void {
        this.mainWindow.webContents.send('macro:stopPlaying')
    }
}