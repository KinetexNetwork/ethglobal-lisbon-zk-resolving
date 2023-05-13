#!/bin/sh

set -e

MODULE=${1}
PYTHON="pipenv run python"


cd $MODULE
$PYTHON -m pytest test
