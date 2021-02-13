import React, {useState} from 'react'
import { ipcRenderer } from 'electron'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'

const Container = styled.div`
    height: 100vh
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`

const HeaderText = styled.h1`
    font-size: 5em;
`

const Home = () => {
    const [isStart, setStart] = useState<boolean>(false)
    const history = useHistory()

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
                            🔴⭐
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
