const JSONStream = require('json-stream')
const Client = require('kubernetes-client').Client
const config = require('kubernetes-client').config
const client = new Client({ config: config.fromKubeconfig(), version: '1.9' })

async function main() {
    try {

        //
        // Get a JSON stream for Deployment events
        //
        stream = client.api.v1.watch.nodes.getStream()
        const jsonStream = new JSONStream()

        stream.pipe(jsonStream)
        jsonStream.on('data', object => {
            switch (object.type) {
                case "ADDED": // on start or new node was add to the cluster
                    console.log("ADD: " + object.object.metadata.name + " " + object.object.status.addresses.find(a => a.type === "InternalIP").address +
                        " " + object.object.status.addresses.find(a => a.type === "ExternalIP").address)

                    break;
                case "DELETED":
                    console.log("DELETED: " + object.object.metadata.name + " " + object.object.status.addresses.find(a => a.type === "InternalIP").address +
                        " " + object.object.status.addresses.find(a => a.type === "ExternalIP").address)
                    break;
                case "MODIFIED":
                    //console.log("MODIFIED: " + object.object.metadata.name)
                    break;
                default:
            }
        })

        //
        // Disconnect from the watch endpoint
        //
        //stream.abort()

    } catch (err) {
        console.error('Error: ', err)
    }


}
console.log("Starting getting nodes change notifications ...")

main()

