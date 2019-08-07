#!/bin/bash

dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

case "$OSTYPE" in
    darwin*)
        # OSX
        if ! $(which python3 &>/dev/null); then
            echo "Installation and application require python3" && exit
        fi
        # create venv
        [ -d "./sapp_venv" ] || python3 -m venv sapp_venv
        # activate venv
        . sapp_venv/bin/activate
        # install dependencies
        pip install -r requirements.txt
        # exit venv
        deactivate
        # install mongodb
        if ! $(which mongod &>/dev/null); then
            echo "mongodb is required for application to run. install?"
            select option in "yes" "no"; do
                case $option in
                    no ) exit ;;
                    yes ) brew install mongodb; break;;
                    * ) echo "Enter 1 or 2";;
                esac
            done
        fi
        # Pull sample xml wiki dump (test file is ~ 100mb in size)
        if ! [ -d "./test.xml" ]; then
            echo "application requires a xml file dump from wikipedia. download? (~100mb)"
            select option in "yes" "no"; do
                case $option in
                    no ) exit ;;
                    yes ) curl -o test.xml https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-abstract1.xml.gz; break;;
                    * ) echo "Enter 1 or 2";;
                esac
            done
        fi
        ;;
    linux*)
        # Linux
        echo "linux"
        ;;
    *)
        # Unsupported
        echo "Unsupported OS"
        ;;
esac

