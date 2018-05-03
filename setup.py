from setuptools import setup, find_packages
setup(
    name="mictray",
    url='http://github.com/karlcswanson/mictray',
    author='Karl Swanson',
    author_email='karlcswanson@gmail.com',
    version="0.1",
    packages=['mictray'],
    # scripts=['mictray/mictray.py'],
    install_requires=['cherrypy','configparser'],
    include_package_data=True,
    entry_points={
        'console_scripts': [
            'mictray = mictray.__main__:main'
        ]
    }
)
