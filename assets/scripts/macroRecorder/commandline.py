# -*- coding: cp1252 -*-

# By Zuzu_Typ

import ctypes
import os
from ctypes import wintypes

import winput

import argparse
import time
import zlib

RECORD_MOVEMENT = True

MIN_FPS = 60

WAIT_BETWEEN_ACTIONS = True

SAVE_COMPRESSED = True

IS_LOCKED = False

IS_RELATIVE = False

# lang

button_create_new_macro = None

button_save_macros = None

button_choose_stop_recording_key = None

root = None

stop_recording_key = winput.VK_ESCAPE

macros = {}
current_macro = []
time_delta = 0
start_time = time.time()
last_time = 0
last_flip = time.time()
options = {
    "relative": False,
    "mouse": True,
    "keyboard": True,
    "once": False
}
screen_res = (800,600)

user32 = ctypes.WinDLL('user32', use_last_error=True)

INPUT_MOUSE    = 0
INPUT_KEYBOARD = 1
INPUT_HARDWARE = 2

KEYEVENTF_EXTENDEDKEY = 0x0001
KEYEVENTF_KEYUP       = 0x0002
KEYEVENTF_UNICODE     = 0x0004
KEYEVENTF_SCANCODE    = 0x0008

MAPVK_VK_TO_VSC = 0

class Config:
    def __init__(self, filename):
        file_ = open(filename, "rb")
        content_string = file_.read()
        file_.close()
        self.filename = filename
        try:
            content_string = zlib.decompress(content_string)
        except:
            pass
        content_string = content_string.decode("utf-8")
        self.content_list = list(content_string.split("\n"))

    def save(self):
        content_string = ""
        for i in self.content_list:
            content_string += i
            
        content_string = zlib.compress(content_string.encode("utf-8"), 9)
        
        file_ = open(self.filename, "wb")
        file_.write(content_string)
        file_.close()

    def get(self, text):
        return text in self.content_list

    def add(self, text):
        if not self.get(text):
            self.content_list.append(text)

config = Config(os.path.join(os.path.dirname(os.path.abspath(__file__)), "cfg.ini" ))

# msdn.microsoft.com/en-us/library/dd375731
# keys

# C struct definitions

wintypes.ULONG_PTR = wintypes.WPARAM

class MOUSEINPUT(ctypes.Structure):
    _fields_ = (("dx",          wintypes.LONG),
                ("dy",          wintypes.LONG),
                ("mouseData",   wintypes.DWORD),
                ("dwFlags",     wintypes.DWORD),
                ("time",        wintypes.DWORD),
                ("dwExtraInfo", wintypes.ULONG_PTR))

class KEYBDINPUT(ctypes.Structure):
    _fields_ = (("wVk",         wintypes.WORD),
                ("wScan",       wintypes.WORD),
                ("dwFlags",     wintypes.DWORD),
                ("time",        wintypes.DWORD),
                ("dwExtraInfo", wintypes.ULONG_PTR))

    def __init__(self, *args, **kwds):
        super(KEYBDINPUT, self).__init__(*args, **kwds)
        # some programs use the scan code even if KEYEVENTF_SCANCODE
        # isn't set in dwFflags, so attempt to map the correct code.
        if not self.dwFlags & KEYEVENTF_UNICODE:
            self.wScan = user32.MapVirtualKeyExW(self.wVk,
                                                 MAPVK_VK_TO_VSC, 0)

class HARDWAREINPUT(ctypes.Structure):
    _fields_ = (("uMsg",    wintypes.DWORD),
                ("wParamL", wintypes.WORD),
                ("wParamH", wintypes.WORD))

class INPUT(ctypes.Structure):
    class _INPUT(ctypes.Union):
        _fields_ = (("ki", KEYBDINPUT),
                    ("mi", MOUSEINPUT),
                    ("hi", HARDWAREINPUT))
    _anonymous_ = ("_input",)
    _fields_ = (("type",   wintypes.DWORD),
                ("_input", _INPUT))

LPINPUT = ctypes.POINTER(INPUT)

def _check_count(result, func, args):
    if result == 0:
        raise ctypes.WinError(ctypes.get_last_error())
    return args

user32.SendInput.errcheck = _check_count
user32.SendInput.argtypes = (wintypes.UINT, # nInputs
                             LPINPUT,       # pInputs
                             ctypes.c_int)  # cbSize

# Functions

def MouseEvent(dwFlags = 0x0001, dx = 0, dy = 0, mouseData = 0x000):
    me = INPUT(type=INPUT_MOUSE,
               mi=MOUSEINPUT(dx = dx, dy = dy, dwFlags = dwFlags, mouseData = mouseData))
    user32.SendInput(1, ctypes.byref(me), ctypes.sizeof(me))

def PressKey(hexKeyCode):
    x = INPUT(type=INPUT_KEYBOARD,
              ki=KEYBDINPUT(wVk=hexKeyCode))
    user32.SendInput(1, ctypes.byref(x), ctypes.sizeof(x))

def ReleaseKey(hexKeyCode):
    x = INPUT(type=INPUT_KEYBOARD,
              ki=KEYBDINPUT(wVk=hexKeyCode,
                            dwFlags=KEYEVENTF_KEYUP))
    user32.SendInput(1, ctypes.byref(x), ctypes.sizeof(x))

class POINT(ctypes.Structure):
    _fields_ = [("x", ctypes.c_ulong), ("y", ctypes.c_ulong)]



def getMousePosition():
    pt = POINT()
    user32.GetCursorPos(ctypes.byref(pt))
    return (pt.x, pt.y)

def hookAllEvents(event):
    global current_macro, time_delta, start_time, last_time, RECORD_MOVEMENT, hookManager, options, stop_recording_key, IS_RELATIVE, screen_res, last_flip, MIN_FPS
    IS_RELATIVE = (IS_RELATIVE or options["relative"])

    this_time = time.time()
    time_delta = ((this_time - start_time) - last_time)
    last_time = this_time - start_time

    if (this_time - last_flip) > 1./MIN_FPS:
        # root.update()
        last_flip = this_time

    if type(event) == winput.MouseEvent:
        if options["mouse"]:
            x, y = event.position
            if IS_RELATIVE:
                x = round(float(x)/screen_res[0], 5)
                y = round(float(y)/screen_res[1], 5)
            if event.action == winput.WM_MOUSEMOVE:
                if RECORD_MOVEMENT:
                    current_macro.append((time_delta, winput.WM_MOUSEMOVE, x, y))
            else:
                current_macro.append((time_delta, event.action, x, y))
            return 1

    else:
        
        key_vkCode = event.vkCode
        if event.action == winput.WM_KEYDOWN:
            if key_vkCode == stop_recording_key:
                winput.unhook_mouse()
                winput.unhook_keyboard()
                winput.stop()
                return
                
        if options["keyboard"]:
            current_macro.append((time_delta, event.action, key_vkCode))

def createNewMacro(name = None):
    global macros, current_macro, last_time, options, start_time, last_flip

    if not name:
        name = "Macro #{}".format(len(macros))
        
    start_time = time.time()
    last_time = 0
    last_flip = time.time()
    
    winput.hook_mouse(hookAllEvents)
    winput.hook_keyboard(hookAllEvents)
    winput.wait_messages()

    if current_macro:
        macros[name] = current_macro
        current_macro = []

def getMacros():
    global macros
    return macros

def playMacro(macro):
    global WAIT_BETWEEN_ACTIONS, last_time, root, IS_RELATIVE, options, screen_res, last_flip, MIN_FPS, STOP_PLAYING
    IS_RELATIVE = (IS_RELATIVE or options["relative"])
    total_time = 0
    start_time = time.time()
    last_time = 0

    for action in macro:
        # if (STOP_PLAYING):
        #     break
        this_time = time.time()
        total_time += action[0]
        if (this_time - last_flip) > 1./MIN_FPS:
            # root.update()
            winput.get_message()
            last_flip = this_time
        
        time_delta = max(total_time - (this_time-start_time),0) 
        
        action_type = int(action[1])
        
        if WAIT_BETWEEN_ACTIONS:
            if time_delta: time.sleep(time_delta)
            
        if action_type in (winput.WM_KEYUP, winput.WM_SYSKEYUP, winput.WM_KEYDOWN, winput.WM_SYSKEYDOWN):
            key = int(action[2])
            if action_type == winput.WM_KEYUP: # key up
                ReleaseKey(key)
            else:
                PressKey(key)

        elif action_type == winput.WM_MOUSEMOVE:
            desired_position = (int(round(action[2] * screen_res[0],0)), int(round(action[3] * screen_res[1],0))) if IS_RELATIVE else (int(action[2]), int(action[3]))
            user32.SetCursorPos(*desired_position)
        else:
            current_mouse_position = getMousePosition()
            relative_position = (int(round(action[2] * screen_res[0],0)) - current_mouse_position[0], int(round(action[3] * screen_res[1],0)) - current_mouse_position[1]) if IS_RELATIVE else (int(action[2]) - current_mouse_position[0], int(action[3]) - current_mouse_position[1])

            mouse_change = 0x0002 if action_type == winput.WM_LBUTTONDOWN else \
                           0x0004 if action_type == winput.WM_LBUTTONUP else \
                           0x0020 if action_type == winput.WM_MBUTTONDOWN else \
                           0x0040 if action_type == winput.WM_MBUTTONUP else \
                           0x0008 if action_type == winput.WM_RBUTTONDOWN else \
                           0x0010

            MouseEvent(0x0001 + mouse_change, *relative_position)

            # root.update()
        
def saveMacros(macros, filename):
    global options, SAVE_COMPRESSED, IS_RELATIVE
    file_ = open(filename,"wb")
    file_content = "*{}".format(filename)
    if options["once"]:
        file_content += " -o"
    if (options["relative"] or IS_RELATIVE):
        file_content += " -r"

    file_content += "\n"
    for macro_name in macros:
        macro = macros[macro_name]
        file_content += "|{}\n".format(macro_name)
        for action in macro:
            file_content += "{}, {}, {}".format(action[0], action[1], action[2])
            if len(action) == 4:
                file_content += ", {}".format(action[3])

            file_content += "\n"
            
    if SAVE_COMPRESSED:
        file_content = zlib.compress(file_content.encode("utf-8"),9)
    file_.write(file_content)

    file_.close()

def loadMacros(filename):
    global config, IS_LOCKED, button_create_new_macro, button_save_macros, IS_RELATIVE
    macros = {}
    
    file_ = open(filename, "rb")
    file_content = file_.readlines()
    file_content_string = b""
    for line in file_content:
        file_content_string += line
    try:
        file_content_string = zlib.decompress(file_content_string)
    except: pass
    try: file_content_string = file_content_string.decode()
    except: pass
    file_content = []
    current_content = ""
    for character in file_content_string:
        if len(current_content) and current_content[-1] == "\n":
            file_content.append(current_content)
            current_content = character
        else:
            current_content += character
    file_.close()

    macro = []

    macro_name = ""

    for line in file_content:
        if line[0] == "*":
            line = line[1:]
            line = line.strip()
            line_split = line.split(" ")

            if config.get(os.path.basename(line_split[0])):
                IS_LOCKED = False
                IS_RELATIVE = False
                return

            if "-o" in line_split:
                IS_LOCKED = True
                config.add(os.path.basename(line_split[0]))
                continue

            if "-r" in line_split:
                IS_RELATIVE = True
            else:
                IS_RELATIVE = False
                
            IS_LOCKED = False
            continue
                
        if line[0] == "|":
            if macro:
                macros[macro_name] = macro
                macro = []
                
            macro_name = line.strip()[1:]
            continue
        
        if not "," in line:
            continue


        values = line.split(",")
        action = [float(values[0].strip()), values[1].strip(), eval(values[2].strip())]
        if len(values) == 4: # motion
            action.append(eval(values[3].strip()))
                          
        macro.append(action)
    if macro:
        macros[macro_name] = macro
    return macros

def choose_stop_recording_key_hook(event):
    global button_choose_stop_recording_key, stop_recording_key

    stop_recording_key = event.vkCode

    winput.stop()
    
def choose_stop_recording_key():
    global stop_recording_key, root

    # root.update()

    winput.hook_keyboard(choose_stop_recording_key_hook)

    winput.wait_messages()

    winput.unhook_keyboard()

def str2bool(v):
    if isinstance(v, bool):
       return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')

def createFileIfNotExist(filename):
    if not os.path.isfile(filename):
        saveMacros(macros, filename)

def record(name, filename):
    global macros
    macros = loadMacros(filename)
    createNewMacro(name=name)
    saveMacros(macros, filename)

def play(name, filename):
    macros = loadMacros(filename)
    if name in macros:
        playMacro(macros[name])

def remove(name, filename):
    macros = loadMacros(filename)
    if name in macros:
        macros.pop(name)
    saveMacros(macros, filename)

def getCommands(name, filename):
    macros = loadMacros(filename)
    print(list(macros.keys()))

def update(oldName, newName, filename):
    macros = loadMacros(filename)
    if oldName == newName:
        return
        
    if oldName in macros:
        macros[newName] = macros[oldName]
        del macros[oldName]
        saveMacros(macros, filename)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Record Input/Output with commandline')
    parser.add_argument('-c', '--command', type=str, help='command record, play, remove', required=True)
    parser.add_argument('-n', '--name', type=str, help='macro name', required=True)
    parser.add_argument('-t', '--to_name', type=str, help='update macro name')
    parser.add_argument('--save_file', type=str, default="./macros.mcr", help='the location you want to save macros')
    parser.add_argument('--relative', type=str2bool, default=False, help="use relative")
    parser.add_argument('--record_mouse', type=str2bool, default=True, help="record mouse")
    parser.add_argument('--record_keyboard', type=str2bool, default=True, help="record keyboard")
    parser.add_argument('--once', type=str2bool, default=False, help="use recorded macros to be playable once only")
    args = parser.parse_args()

    options = {
        "relative": args.relative,
        "mouse": args.record_mouse,
        "keyboard": args.record_keyboard,
        "once": args.once,
        "filename": args.save_file,
    }

    commands = {
        "record": record,
        "play": play,
        "remove": remove,
        "list": getCommands
    }
    time.sleep(1)
    createFileIfNotExist(options["filename"])

    if args.to_name:
        update(args.name, args.to_name, options["filename"])
        exit()

    for command in commands:
        if args.command == command:
            commands[command](args.name, options["filename"])