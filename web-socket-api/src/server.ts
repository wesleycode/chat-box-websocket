import Fastify from 'fastify';
import { WebSocketServer } from 'ws';

const fastify = Fastify();

// Iniciar servidor Fastify
fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Servidor ouvindo em ${address}`);
});

// Criar WebSocket server
const wss = new WebSocketServer({ server: fastify.server });

const clients: Set<any> = new Set();

wss.on('connection', (ws: any) => {
    clients.add(ws);

    ws.on('message', (message: any) => {
        clients.forEach((client) => {
            if (client !== ws && client.readyState === client.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        clients.delete(ws);
    });
});