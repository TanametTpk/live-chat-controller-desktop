import KeywordBuilder from "../utils/KeywordBuilder";

export const mouseMoveKeywords: string[] = new KeywordBuilder()
.addKeyword('mouse', true)
.addKeyword('move', true)
.addKeywords(['up', 'down', 'left', 'right'], true)
.addKeyword('strong')
.build()

export const mouseClickKeywords: string[] = new KeywordBuilder()
.addKeyword('click', true)
.addKeywords(['left', 'right', 'middle'])
.addKeywords(['hold', 'release'])
.build()

export const mouseScrollKeywords: string[] = new KeywordBuilder()
.addKeyword('scroll', true)
.addKeywords(['up', 'down', 'left', 'right'], true)
.addKeyword('strong')
.build()

export const keyboardKeywords: string[] = new KeywordBuilder()
.addKeyword('press', true)
.addKeywords(
  [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'backspace',
    'delete',
    'enter',
    'tab',
    'escape',
    'up',
    'down',
    'right',
    'left',
    'command',
    'alt',
    'control',
    'shift',
    'space',
    'numpad_0',
    'numpad_1',
    'numpad_2',
    'numpad_3',
    'numpad_4',
    'numpad_5',
    'numpad_6',
    'numpad_7',
    'numpad_8',
    'numpad_9',
  ],
  true
)
.addKeywords(['hold', 'release'])
.build()