# -*- mode: python -*-

block_cipher = None


a = Analysis(['micboard.py'],
             binaries=[],
             datas=[('../static/','static/'),
                    ('../democonfig.json','.'),
                    ('../demo.html','.'),
                    ('../dcid.json','.'),
                    ('../package.json','.')],
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
          [],
          exclude_binaries=True,
          name='micboard-service',
          debug=False,
          strip=False,
          upx=True,
          runtime_tmpdir=None,
          console=True )

coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               name='micboard-service')
