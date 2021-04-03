import fs from 'fs'

export interface CommandConfig {
    commands: KeywordConfig[]
    replaces: KeywordConfig[]
    useReplace: boolean
    useOnlyDefined: boolean
    usePool: boolean
    pool: PoolConfig
}

export interface PoolConfig {
    defaultRatio: number
}

export interface KeywordConfig {
    words: string[]
    toCommand: string
    ratio?: number
}

export interface YoutubeConfig {
    allow: boolean
    API_KEY: string
    CHANNEL_ID: string
    STREAM_ID: string
    INTERVAL: number
    useAPI: boolean
}

export interface WebHookConfig {
    urls: string[]
    allow: boolean
}

export interface DiscordConfig {
    token: string
    allow: boolean
}

export interface TwitchConfig {
    channel: string
    allow: boolean
}

export interface FacebookConfig {
    allow: boolean
    access_token: string
    video_id: string
    comment_rate: 'one_per_two_seconds' | 'ten_per_second' | 'one_hundred_per_second'
}

export interface Configs {
    youtube: YoutubeConfig
    discord: DiscordConfig
    twitch: TwitchConfig
    facebook: FacebookConfig
    webhooks: WebHookConfig
}

export const loadConfig = <T>(path: string): T => {
    const raw_configs: string = fs.readFileSync(path).toString()
    const configs: T = JSON.parse(raw_configs)
    return configs
}

export const readConfig = (path: string): Configs => {
    return loadConfig<Configs>(path)
}

export const loadCommandConfig = (path: string): CommandConfig => {
    return loadConfig<CommandConfig>(path)
}