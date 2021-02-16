import React, { useState } from 'react'
import { Configs } from '../utils/loadConfig'
import { Input, InputNumber, Checkbox, Card  } from 'antd';
import styled from 'styled-components'
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface Props {
    setSources: (sources: Configs) => void
    sources: Configs
}

interface TextFieldSourceProps {
    title: string
    placeholder: string
    numberic?: boolean
    onChange?: (event: any) => void
    value: any
}

interface AvaliableFormProps {
    sourceName: string
    value: any
    onCheck: (check: boolean) => void
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
    numberic,
    onChange,
    value
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
                        onChange={onChange}
                        value={value}
                    />
                    : <Input placeholder={placeholder} onChange={onChange} value={value} />
                }
            </div>
        </div>
    )
}

const AvaliableForm: React.FC<AvaliableFormProps> = ({sourceName, children, onCheck, value}) => {
    return (
        <div>
            <SourceHeader>
                {sourceName}
            </SourceHeader>
            <Checkbox
                onChange={(e) => {
                    onCheck(e.target.checked)
                }}
                checked={value}
            >
                avaliable {sourceName.toLowerCase()}
            </Checkbox>
            {
                value &&
                <Card style={{padding: "12px"}}>
                    { children }
                </Card>
            }
        </div>
    )
}

const YoutubeForm: React.FC<Props> = (props: Props) => {
    const onChangeMethod = (e: CheckboxChangeEvent) => {
        let sources = props.sources
        sources.youtube.useAPI = e.target.checked
        props.setSources(sources)
    }

    return (
        <AvaliableForm
            sourceName="Youtube"
            onCheck={(check) => {
                let sources = props.sources
                sources.youtube.allow = check
                props.setSources(sources)
            }}
            value={props.sources.youtube.allow}
        >
            <Checkbox
                onChange={onChangeMethod}
                checked={props.sources.youtube.useAPI}
            >
                use youtube APIs
            </Checkbox>
            {
                props.sources.youtube.useAPI 
                ? <YoutubeApiForm {...props} />
                : <YoutubeScripingForm {...props} />
            }
        </AvaliableForm>
    )
}

const YoutubeApiForm: React.FC<Props> = (props: Props) => {
    return (
        <div>
            <TextFieldSource
                title="Youtube API KEY"
                placeholder="API KEY"
                onChange={(e) => {
                    let sources = props.sources
                    sources.youtube.API_KEY = e.target.value
                    props.setSources(sources)
                }}
                value={props.sources.youtube.API_KEY}
            />

            <TextFieldSource
                title="Youtube CHANNEL_ID"
                placeholder="CHANNEL_ID"
                onChange={(e) => {
                    let sources = props.sources
                    sources.youtube.CHANNEL_ID = e.target.value
                    props.setSources(sources)
                }}
                value={props.sources.youtube.CHANNEL_ID}
            />
        </div>
    )
}

const YoutubeScripingForm: React.FC<Props> = (props: Props) => {
    return (
        <div>
            <TextFieldSource
                title="Youtube Stream ID"
                placeholder="Stream ID"
                onChange={(e) => {
                    let sources = props.sources
                    sources.youtube.STREAM_ID = e.target.value
                    props.setSources(sources)
                }}
                value={props.sources.youtube.STREAM_ID}
            />

            <TextFieldSource
                title="Youtube Chat Interval (ms)"
                placeholder="Interval"
                numberic
                onChange={(interval: number) => {
                    let sources = props.sources
                    sources.youtube.INTERVAL = interval
                    props.setSources(sources)
                }}
                value={props.sources.youtube.INTERVAL || 1000}
            />
        </div>
    )
}

const TwitchForm: React.FC<Props> = (props: Props) => {
    return (
        <AvaliableForm
            sourceName="Twitch"
            onCheck={(check) => {
                let sources = props.sources
                sources.twitch.allow = check
                props.setSources(sources)
            }}
            value={props.sources.twitch.allow}
        >
            <TextFieldSource
                title="Twitch Channel Name"
                placeholder="channel name"
                onChange={(e) => {
                    let sources = props.sources
                    sources.twitch.channel = e.target.value
                    props.setSources(sources)
                }}
                value={props.sources.twitch.channel}
            />
        </AvaliableForm>
    )
}

const DiscordForm: React.FC<Props> = (props: Props) => {
    return (
        <AvaliableForm
            sourceName="Discord"
            onCheck={(check) => {
                let sources = props.sources
                sources.discord.allow = check
                props.setSources(sources)
            }}
            value={props.sources.discord.allow}
        >
            <TextFieldSource
                title="Discord Token"
                placeholder="token"
                onChange={(e) => {
                    let sources = props.sources
                    sources.discord.token = e.target.value
                    props.setSources(sources)
                }}
                value={props.sources.discord.token}
            />
        </AvaliableForm>
    )
}

const WebHookForm: React.FC<Props> = (props: Props) => {
    return (
        <AvaliableForm
            sourceName="Webhook"
            onCheck={(check) => {
                let sources = props.sources
                sources.webhooks.allow = check
                props.setSources(sources)
            }}
            value={props.sources.webhooks.allow}
        >
            <TextFieldSource
                title="Webhook url"
                placeholder="url"
                onChange={(e) => {
                    let sources = props.sources
                    sources.webhooks.urls = [e.target.value]
                    props.setSources(sources)
                }}
                value={props.sources.webhooks.urls}
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
                Sources.map((Source: React.FC<Props>, key: number) => <Source key={key} {...props} />)
            }
        </Card>
    )
}

export default SourcesForm
