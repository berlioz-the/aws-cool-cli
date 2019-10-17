const _ = require('the-lodash');
const Promise = require('the-promise');
const Client = require('ssh2').Client;
const fs = require('fs');

class SshClient
{
    constructor()
    {
    }
    
    execute(command, host, username, pkPath, allowError)
    {
        return this.connect(host, username, pkPath)
            .then(conn => {
                return this._runCommand(conn, command);
            })
            .then(code => {
                if (code == 0) {
                    return;
                }
                if (!allowError) {
                    throw new Error(`Exit Code = ${code}`);
                }
                return code;
            });
    }

    connect(host, username, pkPath)
    {
        return new Promise((resolve, reject) => {
            var connectConfig = {
                host: host,
                port: 22,
                username: username,
                privateKey: fs.readFileSync(pkPath)
            }
    
            var conn = new Client();
            conn
            .on('ready', function() {
                resolve(conn);
            })
            .on('error', (err) => {
                console.log(err);
                reject(err);
            })
            .connect(connectConfig)
            ;
        })
    }

    _runCommand(conn, command)
    {
        return new Promise((resolve, reject) => {
            conn.exec(command, (err, stream) => {
                if (err) {
                    return reject(err);
                }
                stream.on('close', function(code, signal) {
                    conn.end();
                    // console.log(`code = ${code}, signal = ${signal}`);
                    resolve(code);
                }).on('data', function(data) {
                    process.stdout.write(data);
                }).stderr.on('data', function(data) {
                    process.stderr.write(data);
                });
            });
        })
    }

}

module.exports = SshClient;