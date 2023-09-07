exports.newBridgeApp = function newBridgeApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run(mode) {
        
        process.on('uncaughtException', function (err) {
            if (err.message && err.message.indexOf("EADDRINUSE") > 0) {
                SA.logger.error("The Superalgos Bridge Client cannot be started. Reason: the port configured might be being used by another application, or Superalgos Bridge Client might be already running.")
                return
            }
            SA.logger.error('Bridge App -> uncaughtException -> err.message = ' + err.message)
            SA.logger.error('Bridge App -> uncaughtException -> err.stack = ' + err.stack)
            SA.logger.error('Bridge App -> uncaughtException -> err = ' + err)
            process.exit(1)
        })

        process.on('unhandledRejection', (reason, p) => {
            // Signal user that a necessary node module is missing
            if (reason.code == 'MODULE_NOT_FOUND') {
                SA.logger.error("Dependency library not found. Please try running the 'node setup' command and then restart the Superalgos Bridge Client.")
                SA.logger.error('Bridge App -> reason = ' + JSON.stringify(reason))
                process.exit(1)
            }
            SA.logger.error('Bridge App -> unhandledRejection -> reason = ' + JSON.stringify(reason))
            SA.logger.error('Bridge App -> unhandledRejection -> p = ' + JSON.stringify(p))
            process.exit(1)
        })
        try {
            /* Callbacks default responses. */

            global.DEFAULT_OK_RESPONSE = {
                result: "Ok",
                message: "Operation Succeeded"
            };

            global.DEFAULT_FAIL_RESPONSE = {
                result: "Fail",
                message: "Operation Failed"
            };

            global.DEFAULT_RETRY_RESPONSE = {
                result: 'Retry',
                message: 'Retry Later'
            }

            global.CUSTOM_OK_RESPONSE = {
                result: 'Ok, but check Message',
                message: 'Custom Message'
            }

            global.CUSTOM_FAIL_RESPONSE = {
                result: 'Fail Because',
                message: 'Custom Message'
            }

            /* Servers */
            let UI_SERVER = require('./Client/UiLoader.js')

            /* Network Interfaces */

            /*
            Setting up servers running inside this Client.
            */
            BR.servers = {}
            SA.logger.info('SUPERALGOS BRIDGE CLIENT SERVERS:')
            SA.logger.info('')

            if (mode === "devBackend") {
                BR.servers.WEBSOCKET_SERVER = WEBSOCKET_SERVER.newWebSocketsServer()
                BR.servers.WEBSOCKET_SERVER.initialize()
                SA.logger.info('Websocket Server .................................................. Started in Dev Mode')
                
            } else if (mode === "dev") {
                BR.servers.UI_SERVER = UI_SERVER.newBridgeUIApp()
                BR.servers.UI_SERVER.initialize(mode)
                SA.logger.info('UI Server .................................................. Started in Dev Mode')
            
            } else {
                BR.servers.UI_SERVER = UI_SERVER.newBridgeUIApp()
                BR.servers.UI_SERVER.initialize()
                SA.logger.info('UI Server .................................................. Listening on port ' + global.env.BRIDGE_HTTP_INTERFACE_PORT)
            }

            SA.logger.info('')
            SA.logger.info("You are running Superalgos Bridge App: " + SA.version)
            SA.logger.info('')
            SA.logger.info('Join the Superalgos Token Group on Telegram for all questions you may have!')
            SA.logger.info('https://t.me/superalgostoken')

            SA.logger.info('')

        } catch (err) {
            SA.logger.error('Bridge App -> Error = ' + err.stack)
        }
    }
}
