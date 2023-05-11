

function databaseUrl(username, password, host, port, parameters) {
    return `postgresql://${username}:${password}@${host}:${port}/flais${parameters}`
}

module.exports = {
    databaseUrl
};