import sys
from PyInstaller.__main__ import run


def main():
    run([
        'main.py', '--onefile', '--noupx', '--clean', '--noconfirm', '--name=Antenna Python Software', '--icon=icon.ico',
        '--noconsole', '--add-data=icon.png;.',
    ])


if __name__ == "__main__":
    main()
