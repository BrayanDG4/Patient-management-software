import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paciente } from './user.entity';
import { Citacion } from './citation.entity';
import { Examen } from './exam.entity';
import { PacienteExamen } from './userExam.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, Citacion, Examen, PacienteExamen]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
