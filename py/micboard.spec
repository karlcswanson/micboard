# -*- mode: python -*-

block_cipher = None


a = Analysis(['micboard.py'],
             pathex=['/Users/karl/Dropbox/brainstorm/Projects/Current Projects/micbox/dev/micboard/py'],
             binaries=[],
             datas=[('../static/','static/'),
                    ('../democonfig.json','.'),
                    ('../dcid.json','.')],
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
          name='micboard-service',
          debug=False,
          strip=False,
          upx=True,
          runtime_tmpdir=None,
          console=True )
