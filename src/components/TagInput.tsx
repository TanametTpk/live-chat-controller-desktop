import React, { ChangeEvent, useState } from 'react'
import { Tag, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TagState } from './CommandForm';

interface Props {
    setTagState: (tagState: TagState) => void
    tagState: TagState
}

const TagInput: React.FC<Props> = ({ tagState, setTagState }) => {
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
                    size="middle"
                    style={{ width: '100%' }}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                    autoFocus
                />
            )}
            {!inputVisible && (
                <Tag style={{ width: '100%'}} onClick={showInput} className="site-tag-plus">
                    <PlusOutlined /> New Word
                </Tag>
            )}
        </>
    );
}

export default TagInput