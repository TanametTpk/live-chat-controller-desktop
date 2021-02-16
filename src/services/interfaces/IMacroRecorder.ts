
export default interface IMacroRecorder {
    record: (marcoName: string) => void
    delete: (macroName: string) => void
    update: (oldName: string, newName: string) => void
    setReady: (isReady: boolean) => void
}