import React, {useState, useEffect} from 'react'
import InnerPageLayout from '../layouts/InnerPageLayout'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import styled from 'styled-components'

const Settings = () => {
    const [settings, setSettings] = useState<string[]>()

    useEffect(() => {
        getSetting()
    }, [])

    const getSetting = () => {
        let settings = ipcRenderer.sendSync('settings:get')
        setSettings(settings)
    }

    const saveSetting = () => {
        ipcRenderer.send('settings:save', settings)
    }

    const reloadSetting = () => {
        ipcRenderer.send('system:reload')
    }

    return (
        <InnerPageLayout>
            settings
        </InnerPageLayout>
    )
}

export default Settings
