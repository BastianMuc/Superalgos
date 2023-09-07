exports.newBridgeRoot = function newBridgeRoot() {
    /*
    This module represents the execution root of the Bridge App
    */
    let thisObject = {
        run: run
    }

    return thisObject

    async function run() {
      /*
      This module represents the execution root of the Dashboards App.
      We use this module that is outside the Dashboards folder to
      load all node dependencies and get them ready for the actual App.
      */

      /*
      The DS object is accessible everywhere at the Superalgos Dashboards Client.
      It provides access to all modules built for this Client.
      */
      global.BR = {}
      /*
      The SA object is accessible everywhere at the Superalgos Social Trading App.
      It provides access to all modules built for Superalgos in general.
      */
      global.SA = {}

      /* Load Environment Variables */
      let ENVIRONMENT = require('./Environment.js')
      let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
      global.env = ENVIRONMENT_MODULE
      /*
      First thing is to load the project schema file.
      */
      //global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)
      /*
      Setting up the modules that will be available, defined at the Project Schema file.
      */
      //let MULTI_PROJECT = require('./MultiProject.js')
      //let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
      //MULTI_PROJECT_MODULE.initialize(PL, 'PL')
      //MULTI_PROJECT_MODULE.initialize(SA, 'SA')
      /*
      Setting up external dependencies.
      */
      SA.nodeModules = {
        fs: require('fs'),
        util: require('util'),
        path: require('path'),
        http: require('http'),
        static: require('node-static')
      }

      const saLogsPath = SA.nodeModules.path.join(global.env.PATH_TO_LOG_FILES, 'Bridge')
      SA.logger = require('./loggerFactory').loggerFactory(saLogsPath, 'BR')
      
      /* 
      Setting up the App Schema Memory Map. 
      */
      //let APP_SCHEMAS = require('./AppSchemas.js')
      //let APP_SCHEMAS_MODULE = APP_SCHEMAS.newAppSchemas()
      //await APP_SCHEMAS_MODULE.initialize()
      /*
      Version Management
      */
      SA.version = "Early Alpha"

      
      let mode
      for (let i = 0; i < process.argv.length; i++) {
        let arg = process.argv[i]

        if (arg === 'minMemo') { continue }
        if (arg.indexOf(':') >= 0) { continue }
        if (arg.indexOf('/') >= 0) { continue }
        if (arg === "dev") {
          mode = arg
        }
      }
  
      run(mode)
      
      async function run(mode) {
        BR.app = require('./Bridge/BridgeApp.js').newBridgeApp()
        await BR.app.run(mode)
        SA.logger.info('Superalgos Bridge App is Running!')
        if (process.send) {
          process.send('Running')
        }
      }
    }
}