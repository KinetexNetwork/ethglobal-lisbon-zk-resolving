# Kinetex flash simple Resolver (1inch Fusion)

⚙️ Simple Resolver (1inch Fusion) for Kinetex Flash project

## Development

The following requirements must be met to setup development requirements:

* Python 3.10+
* Pipenv
* VS Code (recommended)

Install dependencies:

* Run `pipenv sync --dev`

Configure VS Code to use `pipenv`'s environment:

* Run `pipenv shell`
* Copy virtual environment path from output (omitting `/bin/activate`)
* Open python interpreter selection:

  * Click on the `Python` badge in the bottom panel

  _or_

  * Open VS Code command palette (`<ctrl> + <shift> + <p>` by default)
  * Find and execute `Python: Select interpreter`

* Choose the `Enter interpreter path` option and paste `<copied-virtual-env-path>/bin/python`
* Selected interpreter text should change in the bottom panel meaning you now have
  correct `python` autocompletion in source files and debug available via `F5` hit

There are some useful `make` commands:

   Command   | Description
:-----------:|------------------------------------------------------------------
 `make run`  | Launches app with hot reload
 `make lint` | Performs auto formatting & lint of the main module
 `make test` | Runs all tests inside `test` folder
 `make up`   | Starts docker compose services
 `make dn`   | Stops docker compose services