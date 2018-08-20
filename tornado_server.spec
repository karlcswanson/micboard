# -*- mode: python -*-

block_cipher = None


a = Analysis(['tornado_server.py'],
             pathex=['/Users/karl/Dropbox/brainstorm/Projects/Current Projects/micbox/dev/mictray'],
             binaries=[],
             datas=[('config.ini','.'),
                    ('static/','.')],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='tornado_server',
          debug=False,
          strip=False,
          upx=True,
          runtime_tmpdir=None,
          console=True )
