const parse = require("pg-connection-string").parse;

module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "bookshelf",
      settings: {
        host: env('PGHOST', '127.0.0.1'),
        port: env.int('PGPORT', 5931),
        database: env('PGDATABASE', 'railway'),
        user: env('PGUSER', 'postgres'),
        password: env('PGPASSWORD', 'password'),
        ssl: env.bool(true),
        client: "postgres",
        // host: config.host,
        // port: config.port,
        // database: config.database,
        // username: config.user,
        // password: config.password,
        // ssl: {
        //   rejectUnauthorized: false,
        // },
      },
      options: {
        ssl: true,
      },
    },
  },
});
