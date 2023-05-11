const {
    Client
} = require('pg')


// jdbc:postgresql://pg-alpha-fintlabs.aivencloud.com:16649/flais?sslmode=require&prepareThreshold=0


async function ensureSchema(url) {

    console.log(url)
    const pgClient = new Client({
        connectionString: url,
        ssl: {
            rejectUnauthorized: false
        }
    });

    await pgClient.connect();

    await pgClient.query("CREATE SCHEMA IF NOT EXISTS unleash");
    await pgClient.end();
}

module.exports = {
    ensureSchema
};