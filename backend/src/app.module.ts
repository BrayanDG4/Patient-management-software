import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: 'mysqldb',
        port: configService.get('MYSQLDB_DOCKER_PORT'),
        username: 'root',
        password: configService.get('MYSQLDB_ROOT_PASSWORD'),
        database: configService.get('MYSQLDB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        retryDelay: 3000,
        synchronize: true,
      }),
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
