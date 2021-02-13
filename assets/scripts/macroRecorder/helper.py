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

speed = 100
dx, dy = 0, 0

def hookAllEvents(event):
    global speed, dx, dy
    key_vkCode = event.vkCode
    if event.action == winput.WM_KEYDOWN:
        if key_vkCode == stop_recording_key:
            winput.unhook_mouse()
            winput.unhook_keyboard()
            winput.stop()
            return
        
    if key_vkCode == 37:
        dx = -speed
    if key_vkCode == 38:
        dy = -speed
    if key_vkCode == 39:
        dx = speed
    if key_vkCode == 40:
        dy = speed
    if key_vkCode == 96:
        MouseEvent(0x0001 + 0x0002, dx=0, dy=0)
    if key_vkCode == 97:
        MouseEvent(0x0001 + 0x0002, dx=0, dy=0)

    if event.action == winput.WM_KEYUP:
        if key_vkCode == 37:
            dx = 0
        if key_vkCode == 38:
            dy = 0
        if key_vkCode == 39:
            dx = 0
        if key_vkCode == 40:
            dy = 00
        if key_vkCode == 96:
            MouseEvent(0x0008 + 0x0010, dx=0, dy=0)
        if key_vkCode == 97:
            MouseEvent(0x0001 + 0x0004, dx=0, dy=0)

    MouseEvent(dx= dx, dy=dy)

def createNewMacro(name = None):
    winput.hook_keyboard(hookAllEvents)
    winput.wait_messages()

if __name__ == "__main__":
    print("running helper")
    createNewMacro("test")