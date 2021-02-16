import React, { useState } from 'react'
import { Table, Tag, Space, Modal } from 'antd';
import { CommandConfig, KeywordConfig } from '../utils/loadConfig';
import { ColumnsType } from 'antd/lib/table';
import CommandForm from './CommandForm';
import useModal from '../hooks/useModal';

interface Props {
    commands?: CommandConfig
    onDeleteCommand: (index: number) => void
    onEditCommand: (index: number, newCommand: KeywordConfig) => void
    isReplace?: boolean
}

export type DataKeywordConfig = KeywordConfig & {key: string}

const CommandTable: React.FC<Props> = ({ onDeleteCommand, onEditCommand, commands, isReplace }) => {
  const [isEditModalShow, openEditModal, closeEditModal] = useModal()
  const [editCommand, setEditCommand] = useState<DataKeywordConfig>()

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
      render: (config: DataKeywordConfig) => (
        <Space size="middle">
          <a
            onClick={() => {
              setEditCommand(config)
              openEditModal()
            }}
          >
            Edit
          </a>
          <a 
            onClick={() => {
              Modal.confirm({
                title: `Confirm Delete Action`,
                content: `Are You Really Want To Delete "${config.toCommand}" ?`,
                onOk: () => {
                  onDeleteCommand(parseInt(config.key))
                }
              })
            }}
          >
            Delete
          </a>
        </Space>
      ),
    },
  ];

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

  const onCommandChange = (config: KeywordConfig) => {
    onEditCommand(parseInt(editCommand?.key || ""), config)
  }

  return (
      <>
        <Table
            columns={columns}
            dataSource={getKeywords()}
            pagination={{
                position: ['topRight'],
                defaultPageSize: 6
            }}
        />
        <CommandForm
          visible={isEditModalShow}
          closeModal={closeEditModal}
          title="Edit Command"
          addNewCommand={onCommandChange}
          init_keywords={editCommand?.words}
          init_ratio={editCommand?.ratio}
          init_selectedKeyword={editCommand?.toCommand}
          isReplace={isReplace}
        />
      </>
  )
}

export default CommandTable
