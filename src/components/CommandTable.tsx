import React from 'react'
import { Table, Tag, Space } from 'antd';
import { CommandConfig, KeywordConfig } from '../utils/loadConfig';
import { ColumnsType } from 'antd/lib/table';

interface Props {
    commands?: CommandConfig
}

export type DataKeywordConfig = KeywordConfig & {key: string}

const columns: ColumnsType<DataKeywordConfig> = [
    {
      title: 'Command',
      dataIndex: 'toCommand',
      key: 'command',
      render: (toCommand: string) => (
        <div style={{
            maxHeight: '80px',
            overflowY: 'auto'
        }}>
          {toCommand}
        </div>
      )
    },
    {
      title: 'Words',
      key: 'words',
      dataIndex: 'words',
      render: (tags: string[]) => (
        <div style={{
            maxHeight: '80px',
            overflowY: 'auto'
        }}>
          {
            tags.map((tag, index: number) => {
                const colors: string[] = [
                    'geekblue',
                    'green',
                    'volcano'
                ]
                const color: string = colors[index % colors.length]
                return (
                    <Tag color={color} key={tag}>
                        {tag}
                    </Tag>
                )
            })
          }
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <a>Edit</a>
          <a>Delete</a>
        </Space>
      ),
    },
];

const data: DataKeywordConfig[] = [
    {
        key: '0',
        words: [
            "ขวา",
            "right",
            "r"
        ],
        toCommand: "press d"
    },
];

const CommandTable: React.FC<Props> = ({ commands }) => {
    const getKeywords = (): DataKeywordConfig[] => {
        if (!commands) return []

        let keywords: KeywordConfig[] = commands?.commands
        if (commands?.useReplace) {
            keywords = commands.replaces
        }

        return keywords.map((keyword: KeywordConfig, index: number): DataKeywordConfig => {
            return {
                ...keyword,
                key: index.toString()
            }
        })
    }

    return (
        <Table
            columns={columns}
            dataSource={getKeywords()}
            pagination={{
                position: ['topRight'],
                defaultPageSize: 6
            }}
        />
    )
}

export default CommandTable
