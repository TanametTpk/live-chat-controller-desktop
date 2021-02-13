import express, {Request, Response} from 'express'
import http from 'http'
import socket, {Socket} from 'socket.io'
import path from 'path'
import MacroManager from '../services/MacroManager'

export default class WebServerController {
    private port: number
    private app: express.Application
    private http: http.Server
    private io: socket.Server
    private isStart: boolean
    private static instance: WebServerController

    public constructor(port: number){
        this.port = port
        this.app = express()
        this.http = http.createServer(this.app)
        this.io = new socket.Server(this.http)
        this.isStart = false
        this.setup()
    }

    public static getInstance(port: number = 3000): WebServerController {
        if (!this.instance) this.instance = new WebServerController(port)
        return this.instance
    }

    private setup(): void{
        this.app.get('/', (req: Request, res: Response) => {
            res.sendFile(path.resolve(__dirname, '../../templates/index.html'))
        })

        this.io.on("connection", (socket: Socket) => {
            console.log("connented");
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
    }

    public start(): void {
        this.isStart = true
        this.http.listen(this.port, () => {
            console.log(`website is running on: http://localhost:${this.port}`)
        })
    }

    public stop(): void {
        this.http.close()
    }

    public sendNewMacro(macroName: string): void {
        if (!this.isStart) return
        this.io.emit('new-macro', macroName)
    }

    public sendMacros(macroList: string[]): void {
        if (!this.isStart) return
        this.io.emit('macros', macroList)
    }
}