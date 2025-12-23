import { Global, Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'

/**
 * Servicio Prisma para manejo de conexiones a la base de datos
 * Implementa patrón Singleton para evitar múltiples instancias
 */
@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly initialReconnectDelay = 1000; // 1 segundo
  
  // Control de instancia única
  private static instance: PrismaService;

  constructor() {
    // Evitar múltiples instancias
    if (PrismaService.instance) {
      return PrismaService.instance;
    }

    super({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    });

    // Guardar instancia única
    PrismaService.instance = this;

    // Manejo de eventos de Prisma
    this.$on('query' as never, (e: Prisma.QueryEvent) => {
      // Si necesitas depurar consultas específicas
      // this.logger.debug(`Prisma Query: ${e.query}`);
    });

    // Manejo de errores de conexión
    this.$on('error' as never, (e: Prisma.LogEvent) => {
      this.logger.error(`Error de Prisma: ${JSON.stringify(e)}`);
      if (!this.isConnected) {
        this.handleReconnect();
      }
    });
  }

  async onModuleInit() {
    // Evitar múltiples inicializaciones
    if (this !== PrismaService.instance) {
      return;
    }
    
    try {
      this.logger.log('Intentando conectar a la base de datos...');
      
      await this.$connect();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.logger.log('Prisma conectado exitosamente');
      
      // Verificar conexión con una consulta sencilla
      await this.$queryRaw`SELECT 1 as connection_test`;
    } catch (error) {
      this.isConnected = false;
      this.logPrismaError(error);
      this.handleReconnect();
    }
  }
  
  async onModuleDestroy() {
    // Evitar múltiples desconexiones
    if (this !== PrismaService.instance) {
      return;
    }
    
    try {
      this.logger.log('Desconectando Prisma...');
      this.isConnected = false;
      await this.$disconnect();
      this.logger.log('Prisma desconectado correctamente');
    } catch (error) {
      this.logger.error(`Error al desconectar Prisma: ${JSON.stringify(error)}`);
    }
  }

  private logPrismaError(error: any) {
    const errorCode = error?.errorCode;
    const message = error?.message || 'Error desconocido';
    
    this.logger.error(`Error al conectar Prisma: ${message}`);
    
    // Mensajes más descriptivos según el código de error
    switch (errorCode) {
      case 'P1000':
        this.logger.error('Error de autenticación: Verifica usuario y contraseña en DATABASE_URL');
        break;
      case 'P1001':
        this.logger.error('No se puede alcanzar el servidor de base de datos: Verifica que PostgreSQL esté funcionando');
        break;
      case 'P1002':
        this.logger.error('La base de datos especificada no existe');
        break;
      case 'P1013':
        this.logger.error('El archivo de la base de datos o el esquema prisma presenta problemas');
        this.logger.error('Soluciones posibles:');
        this.logger.error('1. Verifica la URL de conexión en .env');
        this.logger.error('2. Ejecuta "npx prisma migrate reset" para restablecer la base de datos');
        this.logger.error('3. Ejecuta "npx prisma generate" para regenerar el cliente Prisma');
        break;
      default:
        this.logger.error(`Error con código ${errorCode}. Revisa la documentación de Prisma`);
    }
    
    // Imprime detalles técnicos para depuración
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug('Detalles técnicos del error:');
      this.logger.debug(JSON.stringify(error, null, 2));
    }
  }

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(`Máximo número de intentos de reconexión (${this.maxReconnectAttempts}) alcanzado.`);
      return;
    }

    const delay = this.initialReconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    this.logger.log(`Intentando reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts} en ${delay}ms...`);
    
    setTimeout(async () => {
      try {
        await this.$connect();
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.logger.log('Prisma reconectado exitosamente');
      } catch (error) {
        this.isConnected = false;
        this.logPrismaError(error);
        this.handleReconnect();
      }
    }, delay);
  }

  // Helper para verificar el estado de la conexión
  async checkConnection(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1 as connection_test`;
      return true;
    } catch (error) {
      this.logPrismaError(error);
      return false;
    }
  }

  // Helper para limpiar recursos
  async cleanDb() {
    if (process.env.NODE_ENV === 'development') {
      // En desarrollo podemos realizar operaciones de limpieza si es necesario
    }
  }
}