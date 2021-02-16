import React, {useState, useEffect} from 'react'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import styled from 'styled-components'
import InnerPageLayout from '../layouts/InnerPageLayout'
import MacroList from '../components/MacroList'
import { Modal, Input, Card } from 'antd';

const Container = styled.div`
    color: black;
`

const Macro = () => {
    const [playingMacro, setPlayingMacro] = useState<string>("")
    const [isRecord, setRecord] = useState<boolean>(false)
    const [macros, setMacros] = useState<string[]>([])
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
    const [targetMacroName, setTargetMacroName] = useState<string>("")
    const [newMacroName, setNewMacroName] = useState<string>("")

    useEffect(() => {
        ipcRenderer.on('macro:list', (_: IpcRendererEvent, macros: string[]) => {
            setMacros(macros)
        })

        ipcRenderer.on('macro:onStartRecord', (_: IpcRendererEvent) => {
            setRecord(true)
        })

        ipcRenderer.on('macro:onStopRecord', (_: IpcRendererEvent) => {
            setRecord(false)
        })

        ipcRenderer.on('macro:stopPlaying', (_: IpcRendererEvent) => {
            setPlayingMacro("")
        })

        ipcRenderer.send('macro:ready')

        getMacros()

        return () => {
            ipcRenderer.send('macro:quit')
            ipcRenderer.removeAllListeners('macro:list')
            ipcRenderer.removeAllListeners('macro:onStartRecord')
            ipcRenderer.removeAllListeners('macro:onStopRecord')
        }
    }, [])

    const getMacros = async () => {
        const macros: string[] = ipcRenderer.sendSync('macro:get')
        setMacros(macros)
    }

    const recordMacro = () => {
        const max: number = Number.MAX_SAFE_INTEGER
        const min: number = 1
        const randomName: string = `macro-${Math.floor(Math.random() * (max - min) + min)}`
        ipcRenderer.send('macro:record', randomName)
    }

    const stopRecord = () => {
        ipcRenderer.send('macro:stopRecord')
    }

    const playMacro = (name: string) => {
        ipcRenderer.send('macro:play', name)
        setPlayingMacro(name)
    }

    const renameMacro = (name: string) => {
        setTargetMacroName(name)
        showModal()
    }

    const deleteMacro = (name: string) => {
        ipcRenderer.send('macro:remove', name)
        setMacros(macros.filter((macro) => macro !== name))
    }

    const showModal = () => {
        setIsModalVisible(true);
    }

    const handleOk = () => {
        setIsModalVisible(false);
        if (! /^[a-zA-Z0-9 ]+$/.test(newMacroName)) {
            Modal.error({
                title: 'Can not use this name',
                content: "name should be english and number only (a-z, A-Z, 0-9)"
            })
            return
        }
        ipcRenderer.send('macro:rename', targetMacroName, newMacroName)
        setMacros(macros.map((macro) => macro === targetMacroName ? newMacroName : macro))
        setTargetMacroName("")
        setNewMacroName("")
    }

    const handleCancel = () => {
        setIsModalVisible(false);
        setTargetMacroName("")
        setNewMacroName("")
    }

    return (
        <InnerPageLayout disableBack={isRecord || playingMacro.length > 0}>
            <Container>
                {
                    playingMacro ?
                    <Card>
                        <h1>{playingMacro} are playing</h1>
                        <p>Press Esc to stop</p>
                    </Card>
                    :
                    <>
                        <div>
                            <button
                                type="button"
                                className={isRecord ? "disableBtn" : "mainBtn"}
                                onClick={() => isRecord ? stopRecord() : recordMacro()}
                            >
                                {
                                    !isRecord ?
                                    <>
                                        <span role="img" aria-label="books">
                                        🔴
                                        </span>
                                        Record (F6)
                                    </>
                                    : <> To Stop Record Press Esc </>
                                }
                            </button>
                        </div>
                        <MacroList
                            onPlay={playMacro}
                            onRename={renameMacro}
                            onDelete={deleteMacro}
                            macros={macros}
                        />
                    </>
                }
            </Container>
            <Modal title="Update Macro Name" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Input
                    placeholder="Enter macro name here"
                    value={newMacroName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewMacroName(event.target.value)}    
                />
            </Modal>
        </InnerPageLayout>
    )
}

export default Macro
