import {useState} from 'react'

export default (init_state: boolean = false) => {
    const [isOpen, setOpen] = useState<boolean>(init_state)

    const open = () => {
        setOpen(true)
    }

    const close = () => {
        setOpen(false)
    }

    return [isOpen, open, close]
}