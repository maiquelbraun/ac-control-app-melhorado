import mqtt, { MqttClient } from 'mqtt'
import mqttService from '@/services/mqtt'
import { EventEmitter } from 'events'

// Mock do mqtt
jest.mock('mqtt', () => ({
  connect: jest.fn(),
}))

describe('MQTTService', () => {
  let mockClient: MqttClient

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock do cliente MQTT
    mockClient = new EventEmitter() as MqttClient
    mockClient.connected = false
    mockClient.end = jest.fn()
    mockClient.subscribe = jest.fn()
    mockClient.publish = jest.fn()
    
    const mqtt = require('mqtt')
    mqtt.connect.mockReturnValue(mockClient)
  })

  describe('connect', () => {
    it('deve conectar com sucesso', async () => {
      const connectPromise = mqttService.connect({
        host: 'localhost',
        port: 1883,
        username: 'admin',
        password: 'admin123',
      })

      // Simular conexão bem-sucedida
      setTimeout(() => {
        mockClient.connected = true
        mockClient.emit('connect')
      }, 10)

      await expect(connectPromise).resolves.toBeUndefined()
      expect(mqttService.isConnected()).toBe(true)
    })

    it('deve rejeitar quando há erro na conexão', async () => {
      const connectPromise = mqttService.connect({
        host: 'invalid-host',
        port: 1883,
      })

      // Simular erro de conexão
      setTimeout(() => {
        mockClient.emit('error', new Error('Connection failed'))
      }, 10)

      await expect(connectPromise).rejects.toThrow('Connection failed')
    })

    it('deve usar configurações padrão quando não especificadas', async () => {
      mqttService.connect()

      expect(mqtt.connect).toHaveBeenCalledWith(
        'ws://localhost:1883',
        expect.objectContaining({
          username: undefined,
          password: undefined,
          keepalive: 30,
          reconnectPeriod: 0,
        })
      )
    })
  })

  describe('publish', () => {
    beforeEach(async () => {
      // Conectar antes dos testes de publicação
      const connectPromise = mqttService.connect()
      setTimeout(() => {
        mockClient.connected = true
        mockClient.emit('connect')
      }, 10)
      await connectPromise
    })

    it('deve publicar mensagem string', async () => {
      mockClient.publish.mockImplementation((topic, message, options, callback) => {
        callback()
      })

      await mqttService.publish('test/topic', 'test message')

      expect(mockClient.publish).toHaveBeenCalledWith(
        'test/topic',
        'test message',
        { qos: 1 },
        expect.any(Function)
      )
    })

    it('deve publicar objeto como JSON', async () => {
      mockClient.publish.mockImplementation((topic, message, options, callback) => {
        callback()
      })

      const testObject = { command: 'LIGAR', value: 23 }
      await mqttService.publish('test/topic', testObject)

      expect(mockClient.publish).toHaveBeenCalledWith(
        'test/topic',
        JSON.stringify(testObject),
        { qos: 1 },
        expect.any(Function)
      )
    })

    it('deve rejeitar quando não está conectado', async () => {
      mqttService.disconnect()

      await expect(
        mqttService.publish('test/topic', 'message')
      ).rejects.toThrow('Cliente MQTT não está conectado')
    })

    it('deve rejeitar quando há erro na publicação', async () => {
      mockClient.publish.mockImplementation((topic, message, options, callback) => {
        callback(new Error('Publish failed'))
      })

      await expect(
        mqttService.publish('test/topic', 'message')
      ).rejects.toThrow('Publish failed')
    })
  })

  describe('subscribe', () => {
    beforeEach(async () => {
      // Conectar antes dos testes de subscrição
      const connectPromise = mqttService.connect()
      setTimeout(() => {
        mockClient.connected = true
        mockClient.emit('connect')
      }, 10)
      await connectPromise
    })

    it('deve subscrever em tópico com sucesso', async () => {
      mockClient.subscribe.mockImplementation((topic, callback) => {
        callback(null, [{ topic, qos: 1 }])
      })

      await mqttService.subscribe('test/topic')

      expect(mockClient.subscribe).toHaveBeenCalledWith(
        'test/topic',
        expect.any(Function)
      )
    })

    it('deve rejeitar quando há erro na subscrição', async () => {
      mockClient.subscribe.mockImplementation((topic, callback) => {
        callback(new Error('Subscribe failed'))
      })

      await expect(
        mqttService.subscribe('test/topic')
      ).rejects.toThrow('Subscribe failed')
    })

    it('deve rejeitar quando não está conectado', async () => {
      mqttService.disconnect()

      await expect(
        mqttService.subscribe('test/topic')
      ).rejects.toThrow('Cliente MQTT não está conectado')
    })
  })

  describe('disconnect', () => {
    it('deve desconectar corretamente', () => {
      mqttService.disconnect()

      expect(mockClient.end).toHaveBeenCalledWith(true)
      expect(mqttService.isConnected()).toBe(false)
    })
  })

  describe('publishCommand', () => {
    beforeEach(async () => {
      // Conectar antes dos testes
      const connectPromise = mqttService.connect()
      setTimeout(() => {
        mockClient.connected = true
        mockClient.emit('connect')
      }, 10)
      await connectPromise
    })

    it('deve publicar comando no tópico correto', async () => {
      mockClient.publish.mockImplementation((topic, message, options, callback) => {
        callback()
      })

      const command = { action: 'LIGAR', temperature: 23 }
      await mqttService.publishCommand('device123', command)

      expect(mockClient.publish).toHaveBeenCalledWith(
        'comando/device123',
        JSON.stringify(command),
        { qos: 1 },
        expect.any(Function)
      )
    })
  })
})


