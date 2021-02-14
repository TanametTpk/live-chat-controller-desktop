import React from 'react'
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

const TopBar = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    padding: 1.5em;
`

const BackButton = styled.div`
    cursor: pointer;
`

interface Props {
    disableBack?: boolean
}

const Layout: React.FC<Props> = ({ children, disableBack }) => {
    const history = useHistory()
    
    const goBack = () => {
        if (!disableBack) history.goBack()
    }

    return (
        <Container>
            <TopBar>
                <BackButton
                    style={{ color: disableBack ? "gray" : "white" }}
                    onClick={goBack}
                >
                    back
                </BackButton>
            </TopBar>
            {children}
        </Container>
    )
}

export default Layout
