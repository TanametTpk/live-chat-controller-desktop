import React, {useState, useEffect} from 'react'
import InnerPageLayout from '../layouts/InnerPageLayout'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import styled from 'styled-components'
import { Settings } from '../utils/ConfigWriter'
import isequal from 'lodash.isequal'
import cloneDeep from 'lodash.clonedeep'
import SourcesForm from '../components/SourcesForm'
import CommandTable from '../components/CommandTable'
import useModal from '../hooks/useModal'
import { Configs } from '../utils/loadConfig'
import Modal from 'antd/lib/modal'
import CommandForm from '../components/CommandForm'

const HeaderContainer = styled.div`
    display: flex;
    min-width: 95vw;
    justify-content: space-between;
    padding: 12px;
`

const SettingPage = () => {
    const [isCommandTabSelected, setCommandTab]             = useState<boolean>(false)
    const [settings, setSettings]                           = useState<Settings>()
    const [originalSettings, setOriginalSetting]            = useState<Settings>()
    const [isNewModalOpen, newModalOpen, newModalClose]     = useModal()

    useEffect(() => {
        getSetting()

        ipcRenderer.on('settings:received', (_: IpcRendererEvent, settings: Settings) => {
            setSettings(settings)
            setOriginalSetting(cloneDeep(settings))
        })

        return () => {
            ipcRenderer.removeAllListeners('settings:received')
        }
    }, [])

    const getSetting = () => {
        let settings = ipcRenderer.sendSync('settings:get')
        setSettings(settings)
        setOriginalSetting(cloneDeep(settings))
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
        return !isequal(settings, originalSettings)
    }

    const setSources = (sources: Configs): void => {
        if (!settings) return
        console.log(sources);
        
        setSettings({
            ...settings,
            sources
        })
    }

    const addNewCommand = () => {
        // add to settings
        clearCommandForm()
    }

    const clearCommandForm = () => {

        newModalClose()
    }

    return (
        <InnerPageLayout>
            {
                settings && 
                <>
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
                        <div>
                            {
                                isCommandTabSelected &&
                                <button
                                    type="button"
                                    className="mainBtn"
                                    onClick={() => newModalOpen()}
                                >
                                    <span role="img" aria-label="books">
                                    📝
                                    </span>
                                    Add Command
                                </button>
                            }
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
                        </div>
                    </HeaderContainer>
                    <div style={{height: '60vh', width: '95vw'}}>
                        {
                            isCommandTabSelected ?
                            <CommandTable
                            commands={settings.commands}
                            />
                            :
                            <SourcesForm
                                setSources={setSources}
                                sources={settings.sources}
                            />
                        }
                    </div>
                </>
            }
            <Modal title="Create New Command" visible={isNewModalOpen as boolean} onOk={addNewCommand} onCancel={clearCommandForm}>
                <CommandForm />
            </Modal>
        </InnerPageLayout>
    )
}

export default SettingPage
