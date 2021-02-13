import React, {useState, useEffect} from 'react'
import InnerPageLayout from '../layouts/InnerPageLayout'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import styled from 'styled-components'

const Settings = () => {
    const [settings, setSettings] = useState<string[]>()

    useEffect(() => {
        ipcRenderer.send('settings:get', (settings: string[]) => {
            setSettings(settings)
        })
    }, [])

    const saveSetting = () => {
        ipcRenderer.send('settings:save', (settings: string[]) => {
            setSettings(settings)
        })
    }

    return (
        <InnerPageLayout>
            settings
        </InnerPageLayout>
    )
}

export default Settings
