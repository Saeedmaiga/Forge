import { buildServer } from './server.js';

const server = buildServer();


const start = async () => {
    try{
    await server.listen ({port: 3000, host: '0.0.0.0'});
    console.log('API IS RUNNING ON PORT 3000');
} catch (err) {
    console.log(err);
    process.exit(1);
}
}

start();