import { createServer } from 'node:http'
import { createApplication } from './app/index.js'

async function main () {
    try{
        const server = createServer(createApplication())
        const port :number=8080

        server.listen(port,()=>{
            console.log(`HTTP Server is running on ${port}`)
        })

    } catch(err){
        console.log(`Error starting http server`)
        throw err
    }
}

main()