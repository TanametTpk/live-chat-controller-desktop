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
import { CommandConfig, Configs, KeywordConfig } from '../utils/loadConfig'
import CommandForm from '../components/CommandForm'
import { Checkbox, InputNumber, Tooltip } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

const HeaderContainer = styled.div`
    display: flex;
    min-width: 95vw;
    justify-content: space-between;
    padding: 12px;
    align-items: flex-end;
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
        
        setSettings({
            ...settings,
            sources
        })
    }

    const setCommand = (commands: CommandConfig): void => {
        if (!settings) return

        setSettings({
            ...settings,
            commands
        })
    }

    const onGetCommand = (config: KeywordConfig) => {
        if (!settings) return
        let commandConfig = settings.commands
        let targets = commandConfig.useReplace ? commandConfig.replaces : commandConfig.commands
        targets = [config, ...targets]

        if (commandConfig.useReplace) commandConfig.replaces = targets
        else commandConfig.commands = targets

        setSettings({
            ...settings,
            commands: commandConfig
        })
    }

    const onDeleteCommand = (index: number) => {
        if (!settings) return
        let commandConfig = settings.commands

        let targets = commandConfig.useReplace ? commandConfig.replaces : commandConfig.commands
        targets = targets.filter((_, target: number) => {
            return target !== index
        })

        if (commandConfig.useReplace) commandConfig.replaces = targets
        else commandConfig.commands = targets
        setSettings({
            ...settings,
            commands: commandConfig
        })
    }

    const onEditCommand = (index: number, config: KeywordConfig) => {
        if (!settings) return
        let commandConfig = settings.commands

        let targets = commandConfig.useReplace ? commandConfig.replaces : commandConfig.commands
        targets = targets.map((conf: KeywordConfig, target: number) => {
            if (target === index) return config
            return conf
        })

        if (commandConfig.useReplace) commandConfig.replaces = targets
        else commandConfig.commands = targets
        setSettings({
            ...settings,
            commands: commandConfig
        })
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
                                <>

                                    <div style={{ padding: '0 12px' }}>
                                        <Tooltip title="ทับคำเก่าด้วยคำใหม่ เพื่อใช้คู่กับ webhook หรือ เปลี่ยนเป็นข้อความพิเศษ" >
                                            <Checkbox
                                                style={{color: 'white'}}
                                                onChange={(e: CheckboxChangeEvent) => {
                                                    let {commands} = settings
                                                    commands.useReplace = e.target.checked
                                                    if (e.target.checked) commands.useOnlyDefined = false
                                                    setCommand(commands)
                                                }}
                                                checked={settings.commands.useReplace}
                                            >
                                                Use replace
                                            </Checkbox>
                                        </Tooltip>

                                        {
                                            !settings.commands.useReplace &&
                                            <Tooltip title="ใช้แค่คำที่ประกาศไว้เท่านั้นเพื่อความปลอดภัย">
                                                <Checkbox
                                                    style={{color: 'white'}}
                                                    onChange={(e: CheckboxChangeEvent) => {
                                                        let {commands} = settings
                                                        commands.useOnlyDefined = e.target.checked
                                                        setCommand(commands)
                                                    }}
                                                    checked={settings.commands.useOnlyDefined}
                                                >
                                                    Use only defined
                                                </Checkbox>
                                            </Tooltip>
                                        }
                                        
                                        <Tooltip title="จำนวนข้อความต้องถึงกำหนดไว้เพื่อทำงาน">
                                            <Checkbox
                                                style={{color: 'white'}}
                                                onChange={(e: CheckboxChangeEvent) => {
                                                    let {commands} = settings
                                                    commands.usePool = e.target.checked
                                                    setCommand(commands)
                                                }}
                                                checked={settings.commands.usePool}
                                            >
                                                Use pool
                                            </Checkbox>
                                        </Tooltip>

                                        <InputNumber
                                            size='small'
                                            min={0}
                                            value={settings.commands.pool.defaultRatio}
                                            onChange={(e) => {
                                                let {commands} = settings
                                                commands.pool.defaultRatio = parseInt(e?.toString() || "0")
                                                setCommand(commands)
                                            }}
                                        />
                                    </div>

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

                                </>
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
                                onDeleteCommand={onDeleteCommand}
                                onEditCommand={onEditCommand}
                                isReplace={settings?.commands.useReplace}
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
            <CommandForm
                title="Create New Command"
                visible={isNewModalOpen}
                closeModal={newModalClose}
                addNewCommand={onGetCommand}
                isReplace={settings?.commands.useReplace}
            />
        </InnerPageLayout>
    )
}

export default SettingPage
