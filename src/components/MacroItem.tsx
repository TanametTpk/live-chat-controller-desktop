import React, {useState} from 'react'
import styled from 'styled-components'
import { Button, Tooltip } from 'antd';
import { PlayCircleOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';

const Container = styled.div`
    background-color: white;
    padding: 12px;
    display: flex;
    justify-content: center;
    align-item: center;
    margin 12px;
    border-radius: 10px;
    font-size: 1rem;
    box-shadow: 0px 8px 28px -6px rgba(24, 39, 75, 0.12),
        0px 18px 88px -4px rgba(24, 39, 75, 0.14);
    transition: transform ease-in 0.1s;
    cursor: pointer;

    &:hover {
        transform: scale(1.05);
    }
`

const Controller = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 12px;
`

interface Props {
    macro: string
    onRename: (name: string) => void
    onPlay: (name: string) => void
    onDelete: (name: string) => void
}

const MacroItem: React.FC<Props> = ({ macro, onPlay, onRename, onDelete }) => {
    const [isHover, setHover] = useState<boolean>(false)

    return (
        <Container
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {
                isHover ?
                <Controller>
                    <Tooltip title={`Play ${macro}`}>
                        <Button
                            onClick={() => onPlay(macro)}
                            type="primary"
                            shape="circle"
                            icon={<PlayCircleOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title={`Rename ${macro}`}>
                        <Button
                            onClick={() => onRename(macro)}
                            type="primary"
                            shape="circle"
                            icon={<SettingOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title={`Delete ${macro}`}>
                        <Button
                            onClick={() => onDelete(macro)}
                            type="primary"
                            shape="circle"
                            icon={<DeleteOutlined />}
                        />
                    </Tooltip>
                </Controller>
                :
                <>
                    {macro}
                </>
            }
        </Container>
    )
}

export default MacroItem
