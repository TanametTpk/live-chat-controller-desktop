import React, {useEffect, useState} from 'react'
import { ipcRenderer } from 'electron'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { notification } from 'antd'
import Chat from '../models/chat'
import Checkbox from 'antd/lib/checkbox/Checkbox'

const Container = styled.div`
    height: 100vh
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: black;
`

const HeaderText = styled.h1`
    font-size: 5em;
    color: white;
`

const Home = () => {
    const [isStart, setStart] = useState<boolean>(false)
    const [isShowNotify, setNotify] = useState<boolean>(false)
    const history = useHistory()

    useEffect(() => {
        if (isShowNotify) ipcRenderer.on('receivedChats', (_, chats: Chat[]) => {
            for (let i = 0; i < chats.length; i++) {
                const chat = chats[i];
                notification.open({
                    message: `Message From ${chat.author_name}`,
                    description: chat.message
                })
            }
        })
        return () => {
            ipcRenderer.removeAllListeners('receivedChats')
        }
    }, [isShowNotify])

    const toggleStart = () => {
        if (isStart) {
            ipcRenderer.send('livechat:stop')
        }else {
            ipcRenderer.send('livechat:start')
        }
        setStart(!isStart)
    }

    const goto = (path: string) => {
        if (!isStart) history.push(path)
    }

    return (
        <Container>
            <HeaderText>Live Chat Controller</HeaderText>
            <Checkbox
                onChange={(e) => setNotify(e.target.checked)}
                checked={isShowNotify}
            >
                show message
            </Checkbox>
            <div>
                <button
                    type="button"
                    onClick={toggleStart}
                    className="mainBtn"
                >
                    {
                        !isStart ?
                        <>
                            <span role="img" aria-label="books">
                            ⭐
                            </span>
                            Start Live Chat
                        </>
                        : <>Stop Live Chat</>
                    }
                </button>
            </div>
            <div>
                <button
                    type="button"
                    className={isStart ? "disableBtn" : "mainBtn"}
                    onClick={() => goto("/macros")}
                >
                    <span role="img" aria-label="books">
                    ⌨️
                    </span>
                    Macros
                </button>
                <button
                    type="button"
                    className={isStart ? "disableBtn" : "mainBtn"}
                    onClick={() => goto("/settings")}
                >
                    <span role="img" aria-label="books">
                    ⚙️
                    </span>
                    Settings
                </button>
                <a
                href="https://bit.ly/3m3uH5p"
                target="_blank"
                rel="noreferrer"
                >
                <button
                    className="mainBtn"
                    type="button"
                >
                    <span role="img" aria-label="books">
                    🙏
                    </span>
                    Donate
                </button>
                </a>
            </div>
        </Container>
    );
}

export default Home
