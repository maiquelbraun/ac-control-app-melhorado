// ac-control-app/src/lib/mqtt.ts

import mqtt from 'mqtt';

let mqttClient: mqtt.Client;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id, acao, valor } = req.body;
    
    // Conectar ao MQTT Broker
    if (!mqttClient) {
      mqttClient = mqtt.connect('ws://localhost:1883');
      mqttClient.on('connect', () => {
        console.log('Conectado ao MQTT Broker');
        mqttClient.subscribe(`climaControl/${id}/command`, (err) => {
          if (!err) {
            console.log(`Subscrito no tópico climaControl/${id}/command`);
          }
        });
      });
    }

    // Enviar comando
    const topic = `climaControl/${id}/command`;
    const message = JSON.stringify({ acao, valor });
    mqttClient.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error('Erro ao publicar:', err);
        res.status(500).json({ error: 'Erro ao enviar comando' });
      } else {
        console.log(`Comando enviado para ${topic}: ${message}`);
        res.status(200).json({ message: 'Comando enviado com sucesso!' });
      }
    });
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}