# Engine Testing

# Getting started

## Prerequisites

Before continuing, make sure that you have these tools installed:

    Node.js >= 8.4.0
    Qlik Enterprise
    Qlik Desktop / Core

# Install

## source

1. Clone the Github Repo into extension directory
2. Install [nodejs](https://nodejs.org/)
3. Open Node.js command prompt
4. npm install
5. create virtual Proxy in qmc with following settings:



![virtualProxy](https://github.com/q2g/engine-test/raw/master/src/ApplyAlternateStates/docs/screenShot_1.PNG)

certificate is in the root folder of project, copy full certificate into virtual proxy settings

6. create config.json / copy config.json.example in src folder and edit
7. npm run start
