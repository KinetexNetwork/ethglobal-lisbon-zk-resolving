#!/bin/sh

set -e

MODULE=${1}
CHECK=${2}
TOTAL_STEPS=5
PYTHON="pipenv run python"

# Pretty stuff
START_SYMBOL=🤖
START_ARROW=🡻
FINISH_SYMBOL=✅
FINISH_ARROW=🢁
YELLOW_COLOR="\033[1;33m"
GREEN_COLOR="\033[1;32m"
NO_COLOR="\033[0m"

echo_lint () {
    index=$1
    name=$2
    color=$3
    arrow=$4
    symbol=$5

    printf $color
    echo "$arrow Lint [$index/$TOTAL_STEPS]: $name $symbol $arrow"
    printf $NO_COLOR
}

step () {
    index=$1
    name=$2
    command=$3

    echo
    echo_lint $index $name $YELLOW_COLOR $START_ARROW $START_SYMBOL
    eval $command
    echo_lint $index $name $GREEN_COLOR $FINISH_ARROW $FINISH_SYMBOL
    echo
}

cd $MODULE
step 1 isort "$PYTHON -m isort app ${CHECK:+--check-only --diff}"
step 2 black "$PYTHON -m black app ${CHECK:+--check --diff}"
step 3 pylint "$PYTHON -m pylint app"
step 4 flake8 "$PYTHON -m flake8 app"
step 5 mypy "$PYTHON -m mypy app"
