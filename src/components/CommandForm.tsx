import React, { useEffect, useState } from 'react';
import { Select, InputNumber, Card, Input } from 'antd';
import TagInput from './TagInput';
import Modal from 'antd/lib/modal';
import * as Keywords from '../keywords';
import { KeywordConfig } from '../utils/loadConfig';
import { ipcRenderer } from 'electron';

const { Option } = Select;

interface Props {
    visible: boolean
    addNewCommand?: (config: KeywordConfig) => void
    closeModal: Function
    title: string
    init_ratio?: number
    init_selectedKeyword?: string
    init_keywords?: string[]
    isReplace?: boolean
}

export interface TagState {
    tags: string[]
    inputVisible: boolean
    inputValue: string
}

interface HeaderInputProps {
    title: string
}

interface NonRepeatKeyword {
    [name: string]: boolean
}

const HeaderInput: React.FC<HeaderInputProps> = ({title, children}) => {
    return (
        <>
            <h2>
                {title}
            </h2>
            <Card>
                {children}
            </Card>
        </>
    )
}

const CommandForm: React.FC<Props> = ({
    addNewCommand,
    title,
    visible,
    closeModal,
    init_ratio,
    init_keywords,
    init_selectedKeyword,
    isReplace,
}) => {
    const [ratio, setRatio] = useState<number>(0)
    const [selectedCommand, setSelected] = useState<string>(Keywords.mouseMoveKeywords[0])

    const [tagState, setTagState] = useState<TagState>({
        tags: [],
        inputVisible: false,
        inputValue: '',
    })
    
    const [avaliableCommands, setCommands] = useState<string[]>([
        ...Keywords.mouseMoveKeywords,
        ...Keywords.mouseClickKeywords,
        ...Keywords.keyboardKeywords
    ])

    useEffect(() => {
        let macros: string[] = ipcRenderer.sendSync('macro:get')
        let allCommand: string [] = [...avaliableCommands, ...macros]
        let mapping: NonRepeatKeyword = {}
        allCommand.map((command: string) => {
            mapping[command] = true
        })
        setCommands(Object.keys(mapping))
    }, [])

    useEffect(() => {
        if (init_ratio) setRatio(init_ratio)
        if (init_selectedKeyword) setSelected(init_selectedKeyword)
        if (init_keywords) setTagState({...tagState, tags: init_keywords})
    }, [init_ratio, init_keywords, init_selectedKeyword])

    function onSelectCommand(value: string) {
        if (onSelectedCommand) onSelectedCommand(value)
    }

    const onOk = () => {
        let newCommand: KeywordConfig = {
            words: tagState.tags,
            toCommand: selectedCommand,
            ratio: ratio
        }
        if (addNewCommand) addNewCommand(newCommand)
        clearCommandForm()
    }

    const clearCommandForm = () => {
        setTagState({
            tags: [],
            inputVisible: false,
            inputValue: '',
        })
        setSelected(avaliableCommands[0])
        setRatio(0)
        closeModal()
    }

    const onSelectedCommand = (command: string) => {
        setSelected(command)
    }

    return (
        <>
            <Modal
                title={title}
                visible={visible}
                onOk={onOk}
                onCancel={clearCommandForm}
            >
                <div>
                    <HeaderInput
                        title="Choose Action"
                    >
                        {
                            !isReplace ?
                                <Select
                                    showSearch
                                    value={selectedCommand}
                                    style={{ width: '100%' }}
                                    onChange={onSelectCommand}
                                    filterOption={(input, option) =>
                                        option?.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {
                                        avaliableCommands.map((command: string, key: number) => {
                                            return <Option key={key} value={command}>{command}</Option>
                                        })
                                    }
                                </Select>
                            :
                                <Input
                                    onChange={(e) => onSelectCommand(e.target.value)}
                                    value={selectedCommand}
                                    placeholder="Replace word"
                                />
                        }
                    </HeaderInput>

                    <HeaderInput
                        title="Enter Trigger Words"
                    >
                        <TagInput tagState={tagState} setTagState={setTagState} />
                    </HeaderInput>

                    <HeaderInput
                        title="How many chat to make it trigged"
                    >
                        <InputNumber
                            style={{width: '100%'}}
                            min={0}
                            defaultValue={0}
                            value={ratio}
                            onChange={(value) => setRatio(value as number)}
                        />
                    </HeaderInput>
                </div>
            </Modal>
        </>
    )
}

export default CommandForm
