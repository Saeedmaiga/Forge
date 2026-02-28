import { buildServer, checkDatabaseConnection } from './server.js';
import { env } from './config/env.js';
const server = buildServer();


const start = async () => {
    try{
    await checkDatabaseConnection();
    await server.listen ({
        port: Number(env.PORT), 
        host: '0.0.0.0'});
    console.log('API IS RUNNING ON PORT 3000');
} catch (err) {
    console.log(err);
    process.exit(1);
}
}

start();