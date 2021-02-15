import { CommandConfig, Configs } from "./loadConfig";
import fs from 'fs'

export interface Settings {
    sources: Configs
    commands: CommandConfig
}

export const writeConfig = (sourcePath: string, commandPath: string, settings: Settings) => {
    fs.writeFileSync(sourcePath, JSON.stringify(settings.sources, null, '\t'))
    fs.writeFileSync(commandPath, JSON.stringify(settings.commands, null, '\t'))
}