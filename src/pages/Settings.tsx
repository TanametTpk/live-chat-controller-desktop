import React, {useState, useEffect} from 'react'
import InnerPageLayout from '../layouts/InnerPageLayout'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import styled from 'styled-components'
import { Settings } from '../utils/ConfigWriter'
import isequal from 'lodash.isequal'
import SourcesForm from '../components/SourcesForm'
import CommandTable from '../components/CommandTable'

const HeaderContainer = styled.div`
    display: flex;
    min-width: 95vw;
    justify-content: space-between;
    padding: 12px;
`

const SettingPage = () => {
    const [isCommandTabSelected, setCommandTab]     = useState<boolean>(false)
    const [settings, setSettings]                   = useState<Settings>()
    const [originalSettings, setOriginalSetting]    = useState<Settings>()

    useEffect(() => {
        getSetting()

        ipcRenderer.on('settings:received', (_: IpcRendererEvent, settings: Settings) => {
            console.log("received", settings);
            setSettings(settings)
            setOriginalSetting(settings)
        })
    }, [])

    const getSetting = () => {
        let settings = ipcRenderer.sendSync('settings:get')
        console.log(settings);
        
        setSettings(settings)
        setOriginalSetting(settings)
    }

    const saveSetting = () => {
        if (!settings) return
        ipcRenderer.send('settings:save', settings)
        reloadSetting()
    }

    const reloadSetting = () => {
        ipcRenderer.send('system:reload')
    }

    const isSettingChanged = (): boolean => {
        return isequal(settings, originalSettings)
    }

    return (
        <InnerPageLayout>
            <HeaderContainer>
                <div>
                    <button
                        type="button"
                        className={isCommandTabSelected ? "mainBtn" : "disableBtn"}
                        onClick={() => setCommandTab(false)}
                    >
                        <span role="img" aria-label="books">
                        </span>
                        Sources
                    </button>
                    <button
                        type="button"
                        className={isCommandTabSelected ? "disableBtn" : "mainBtn"}
                        onClick={() => setCommandTab(true)}
                    >
                        <span role="img" aria-label="books">
                        </span>
                        Commands
                    </button>
                </div>
                <button
                    type="button"
                    className={isSettingChanged() ? "mainBtn" : "disableBtn"}
                    onClick={() => saveSetting()}
                >
                    <span role="img" aria-label="books">
                    💾
                    </span>
                    Save
                </button>
            </HeaderContainer>
            <div style={{height: '60vh', width: '100%', backgroundColor: 'red'}}>
                {
                    isCommandTabSelected ?
                    <CommandTable
                    
                    />
                    :
                    <SourcesForm
                    
                    />
                }
            </div>
        </InnerPageLayout>
    )
}

export default SettingPage
