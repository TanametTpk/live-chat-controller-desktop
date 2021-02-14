import React from 'react'
import styled from 'styled-components'
import MacroItem from './MacroItem'

const Container = styled.div`
    width: 30rem;
    height: 50vh;
    overflow: auto;
`

interface Props {
    macros: string[]
    onPlay: (name: string) => void
    onDelete: (name: string) => void
    onRename: (name: string) => void
}

const MacroList: React.FC<Props> = ({ macros, onPlay, onRename, onDelete }) => {
    return (
        <Container>
            {
                macros.map((macro: string, index: number) => {
                    return <MacroItem
                                onPlay={onPlay}
                                onRename={onRename}
                                onDelete={onDelete}
                                macro={macro}
                                key={index} 
                            />
                })
            }
        </Container>
    )
}

export default MacroList
