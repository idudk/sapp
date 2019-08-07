# sapp

sapp is a small prototype application that parses and provides incremental search capability to wikipedia xml dumps. Expansion of project scope to support any xml file is currently in the works.

## Installation
The installation script currently supports OSX
```bash
. install.sh
```

## Usage
First start mongodb server on one process
```bash
mongod --dbpath ./data
```

Next start flask dev server
```bash
flask export FLASK_APP=sapp.py
flask run
```
