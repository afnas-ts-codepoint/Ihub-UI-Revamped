import httpServer from 'http-server';

const root = process.env.PROTOTYPE_DIR;
const port = 4174;

if (!root) {
  console.error('PROTOTYPE_DIR must point to the read-only prototype checkout.');
  process.exit(1);
}

const server = httpServer.createServer({ cache: -1, cors: true, root });
server.listen(port, '127.0.0.1', () => {
  console.log(`Prototype served from ${root} at http://127.0.0.1:${port}`);
});

const close = () => {
  server.close();
  process.exit(0);
};
process.on('SIGINT', close);
process.on('SIGTERM', close);
