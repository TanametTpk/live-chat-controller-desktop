import React, {useState, useEffect} from 'react'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import styled from 'styled-components'
import InnerPageLayout from '../layouts/InnerPageLayout'

const Macro = () => {
    const [isRecord, setRecord] = useState<boolean>(false)
    const [macros, setMacros] = useState<string[]>()

    useEffect(() => {
        ipcRenderer.on('macro:list', (_: IpcRendererEvent, macros: string[]) => {
            console.log(macros);
        })

        ipcRenderer.on('macro:onStartRecord', (_: IpcRendererEvent) => {
            setRecord(true)
        })

        ipcRenderer.on('macro:onStopRecord', (_: IpcRendererEvent) => {
            setRecord(false)
        })

        ipcRenderer.send('macro:get', (macros: string[]) => {
            setMacros(macros)
        })

        return () => {
            ipcRenderer.removeAllListeners('macro:list')
            ipcRenderer.removeAllListeners('macro:onStartRecord')
            ipcRenderer.removeAllListeners('macro:onStopRecord')
        }
    }, [])

    const recordMacro = () => {
        ipcRenderer.send('macro:record', () => {
            setRecord(true)
        })
    }

    const stopRecord = () => {
        ipcRenderer.send('macro:stopRecord', () => {
            setRecord(false)
        })
    }

    return (
        <InnerPageLayout>
            macro
        </InnerPageLayout>
    )
}

export default Macro
