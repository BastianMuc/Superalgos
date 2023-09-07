exports.newBridgeUIApp = function newBridgeUIApp() {
    const { spawn: spawnProcess } = require('child_process')

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize(mode) {
        if (mode !== 'dev') {
            let path = __dirname + '/../UI/dist'
            let fileServer = new SA.nodeModules.static.Server(path)
            SA.nodeModules.http.createServer(function (req, res) {
                req.addListener('end', function() {
                    fileServer.serve(req, res)
                }).resume()
            }).listen(global.env.BRIDGE_HTTP_INTERFACE_PORT)
        } else {        
            let path = __dirname + '/../UI/'
            spawnProcess('npm run dev', [], {shell: true, stdio: "inherit", cwd: path})
        }
    }   

    function finalize () {

    }
}