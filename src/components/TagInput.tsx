import React, { ChangeEvent, useRef, useState } from 'react'
import { Tag, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Props {
    init_tags: string[]
    onChange: (tags: string[]) => void
}

interface TagState {
    tags: string[]
    inputVisible: boolean
    inputValue: string
}

const TagInput: React.FC<Props> = ({ init_tags, onChange }) => {
    const [tagState, setTagState] = useState<TagState>({
        tags: init_tags || [],
        inputVisible: false,
        inputValue: '',
    })
    const { tags, inputVisible, inputValue } = tagState;

    const handleClose = (removedTag: string) => {
        const tags: string[] = tagState.tags.filter(tag => tag !== removedTag);
        setTagState({ ...tagState, tags });
    }

    const showInput = () => {
        setTagState({ ...tagState, inputVisible: true })
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTagState({ ...tagState, inputValue: e.target.value });
    }

    const handleInputConfirm = () => {
        const { inputValue } = tagState;
        let { tags } = tagState;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }
        setTagState({
            tags,
            inputVisible: false,
            inputValue: '',
        });
        onChange(tags)
    };

    const forMap = (tag: string) => {
        const tagElem = (
            <Tag
                closable
                onClose={e => {
                e.preventDefault();
                    handleClose(tag);
                }}
            >
                {tag}
            </Tag>
        );
        return (
            <span key={tag} style={{ display: 'inline-block' }}>
                {tagElem}
            </span>
        );
    };

    const tagChild = tags.map(forMap);

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                {tagChild}
            </div>
            {inputVisible && (
                <Input
                    type="text"
                    size="small"
                    style={{ width: 78 }}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                    autoFocus
                />
            )}
            {!inputVisible && (
                <Tag onClick={showInput} className="site-tag-plus">
                    <PlusOutlined /> New Tag
                </Tag>
            )}
        </>
    );
}

export default TagInput