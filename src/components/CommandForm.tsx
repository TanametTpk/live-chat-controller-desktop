import { Select } from 'antd';
import React from 'react'
import TagInput from './TagInput';

const { Option } = Select;

interface Props {
    words?: string[]
    onWordsChange?: (words: string[]) => void
}

const CommandForm: React.FC<Props> = ({onWordsChange, words = []}) => {

    const onTagChange = (words: string[]) => {
        if (onWordsChange) onWordsChange(words)
    }

    function onSelectCommand(value: string) {
        console.log(`selected ${value}`);
    }

    return (
        <div>
            <Select defaultValue="lucy" style={{ width: 120 }} onChange={onSelectCommand}>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled">
                    Disabled
                </Option>
                <Option value="Yiminghe">yiminghe</Option>
            </Select>
            <TagInput init_tags={words} onChange={onTagChange} />
        </div>
    )
}

export default CommandForm
