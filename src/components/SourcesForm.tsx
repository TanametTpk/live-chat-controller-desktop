import React, { useState } from 'react'
import { Configs } from '../utils/loadConfig'
import { Input, InputNumber, Checkbox, Card  } from 'antd';
import styled from 'styled-components'

interface Props {
    sources?: Configs
}

interface TextFieldSourceProps {
    title: string
    placeholder: string
    numberic?: boolean
}

interface AvaliableFormProps {
    sourceName: string
}

const SourceHeader = styled.h1`
    margin: 12px;
`

const TextFieldTitle = styled.h2`
    margin: 12px;
`

const TextFieldSource: React.FC<TextFieldSourceProps> = ({
    title,
    placeholder,
    numberic
}) => {

    return (
        <div>
            <TextFieldTitle>{title}</TextFieldTitle>
            <div style={{padding: '0 24px'}}>
                {
                    numberic ? 
                      <InputNumber
                        min={100}
                        defaultValue={1000}
                    />
                    : <Input placeholder={placeholder} />
                }
            </div>
        </div>
    )
}

const AvaliableForm: React.FC<AvaliableFormProps> = ({sourceName, children}) => {
    const [isAvaliable, setAvaliable] = useState<boolean>(false)

    return (
        <div>
            <SourceHeader>
                {sourceName}
            </SourceHeader>
            <Checkbox
                onChange={(e) => setAvaliable(e.target.checked)}
                value={isAvaliable}
            >
                avaliable {sourceName.toLowerCase()}
            </Checkbox>
            {
                isAvaliable &&
                <Card style={{padding: "12px"}}>
                    { children }
                </Card>
            }
        </div>
    )
}

const YoutubeForm: React.FC<Props> = ({ sources }) => {
    const [isApi, setIsApi] = useState<boolean>(false)

    return (
        <AvaliableForm sourceName="Youtube">
            <Checkbox
                onChange={(e) => setIsApi(e.target.checked)}
                value={isApi}
            >
                use youtube APIs
            </Checkbox>
            {
                isApi 
                ? <YoutubeApiForm sources={sources} />
                : <YoutubeScripingForm sources={sources} />
            }
        </AvaliableForm>
    )
}

const YoutubeApiForm: React.FC<Props> = ({ sources }) => {
    return (
        <div>
            <TextFieldSource
                title="Youtube API KEY"
                placeholder="API KEY"
            />

            <TextFieldSource
                title="Youtube CHANNEL_ID"
                placeholder="CHANNEL_ID"
            />
        </div>
    )
}

const YoutubeScripingForm: React.FC<Props> = ({ sources }) => {
    return (
        <div>
            <TextFieldSource
                title="Youtube Stream ID"
                placeholder="Stream ID"
            />

            <TextFieldSource
                title="Youtube Chat Interval (ms)"
                placeholder="Interval"
                numberic
            />
        </div>
    )
}

const TwitchForm: React.FC<Props> = ({ sources }) => {
    return (
        <AvaliableForm sourceName="Twitch">
            <TextFieldSource
                title="Twitch Channel Name"
                placeholder="channel name"
            />
        </AvaliableForm>
    )
}

const DiscordForm: React.FC<Props> = ({ sources }) => {
    return (
        <AvaliableForm sourceName="Discord">
            <TextFieldSource
                title="Discord Token"
                placeholder="token"
            />
        </AvaliableForm>
    )
}

const WebHookForm: React.FC<Props> = ({ sources }) => {
    return (
        <AvaliableForm sourceName="Webhook">
            <TextFieldSource
                title="Webhook url"
                placeholder="url"
            />
        </AvaliableForm>
    )
}

const SourcesForm: React.FC<Props> = (props: Props) => {
    let Sources: React.FC<Props>[] = [
        YoutubeForm,
        TwitchForm,
        DiscordForm,
        WebHookForm
    ]

    return (
        <Card style={{padding: '12px'}}>
            {
                Sources.map((Source: React.FC<Props>) => <Source {...props} />)
            }
        </Card>
    )
}

export default SourcesForm
