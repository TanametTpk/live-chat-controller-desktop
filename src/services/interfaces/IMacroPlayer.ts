export default interface IMacroPlayer {
    play: (marcoName: string) => void
    getMacroList: () => string[]
    isPlaying: (macroName: string) => boolean
    isAnyMacroPlaying: () => boolean
}