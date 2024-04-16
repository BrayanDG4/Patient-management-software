import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paciente } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateCitationDto } from './dto/create-citation.dto';
import { Citacion } from './citation.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { Examen } from './exam.entity';
import { PacienteExamen } from './userExam.entity';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  private readonly filePath: string = path.resolve(__dirname, 'users.json');

  constructor(
    @InjectRepository(Paciente) private userRepository: Repository<Paciente>,
    @InjectRepository(Citacion)
    private citationRepository: Repository<Citacion>,
    @InjectRepository(Examen)
    private examRepository: Repository<Examen>,
    @InjectRepository(PacienteExamen)
    private userExamRepository: Repository<PacienteExamen>,
  ) {
    this.loadUsersFromFile();
  }

  private users: any[] = [];

  async createUser(user: CreateUserDto) {
    const userFound = await this.userRepository.findOne({
      where: {
        documento: user.documento,
      },
    });

    if (userFound) {
      throw new HttpException('Usuario ya existe!', HttpStatus.CONFLICT);
    }
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async getPatientsByDate(date: string) {
    const patientsWithCitationsAndExams = await this.userRepository
      .createQueryBuilder('paciente')
      .leftJoinAndSelect('paciente.citaciones', 'citacion')
      .leftJoinAndSelect('paciente.pacienteExamenes', 'pacienteExamen')
      .leftJoinAndSelect('pacienteExamen.examen', 'examen')
      .where('DATE(citacion.fecha_citacion) = :date', { date })
      .orderBy('citacion.hora_citacion', 'ASC')
      .getMany();

    if (patientsWithCitationsAndExams.length === 0) {
      return new HttpException(
        'Usuarios no encontrados para esta fecha',
        HttpStatus.NOT_FOUND,
      );
    }

    return patientsWithCitationsAndExams;
  }

  async createCitation(citation: CreateCitationDto) {
    const { pacienteDocumento } = citation;

    const userExists = await this.userRepository.findOne({
      where: { documento: pacienteDocumento },
    });

    if (!userExists) {
      throw new HttpException('El usuario no existe', HttpStatus.NOT_FOUND);
    }

    const newCitation = this.citationRepository.create(citation);
    return this.citationRepository.save(newCitation);
  }

  getCitation() {
    return this.citationRepository.find();
  }

  getExam() {
    return this.examRepository.find();
  }

  createExam(exam: CreateExamDto) {
    const newExam = this.examRepository.create(exam);
    return this.examRepository.save(newExam);
  }

  async asociarExamenesAPaciente(
    documentoPaciente: number,
    idsExamenes: number[],
  ) {
    const paciente = await this.userRepository.findOne({
      where: { documento: documentoPaciente },
    });

    if (!paciente) {
      throw new HttpException('Paciente no encontrado', HttpStatus.NOT_FOUND);
    }

    const examenes = await Promise.all(
      idsExamenes.map(async (idExamen) => {
        const examen = await this.examRepository.findOne({
          where: { idExamenes: idExamen },
        });
        if (!examen) {
          throw new HttpException(
            `Examen con id ${idExamen} no encontrado`,
            HttpStatus.NOT_FOUND,
          );
        }
        return examen;
      }),
    );

    const asociacionesPacienteExamenes = examenes.map((examen) => {
      const asociacion = new PacienteExamen();
      asociacion.paciente = paciente;
      asociacion.examen = examen;
      return asociacion;
    });

    try {
      await Promise.all(
        asociacionesPacienteExamenes.map(async (asociacion) => {
          await this.userExamRepository.save(asociacion);
        }),
      );
      return 'Exámenes asociados al paciente correctamente';
    } catch (error) {
      throw new HttpException(
        'Error al asociar exámenes al paciente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getAllUsers() {
    return this.userRepository.find();
  }

  async getUserById(id: number) {
    const userFound = await this.userRepository.findOne({
      where: {
        documento: id,
      },
    });

    if (!userFound) {
      return new HttpException('Usuario no encontrado!', HttpStatus.NOT_FOUND);
    }

    return userFound;
  }

  async getExamsForPatient(documento: number): Promise<PacienteExamen[]> {
    return this.userExamRepository.find({
      where: { Pacientes_documento: documento },
      relations: ['examen'],
    });
  }

  async updateExamsForPatient(
    documento: number,
    updatedExamsData: {
      Pacientes_documento: number;
      Examenes_idExamenes: number[];
    },
  ): Promise<PacienteExamen[]> {
    try {
      const { Pacientes_documento, Examenes_idExamenes } = updatedExamsData;

      // Obtener los exámenes actuales asociados al paciente
      const currentExams = await this.getExamsForPatient(documento);

      // Filtrar los IDs de los exámenes actuales asociados al paciente
      const currentExamIds = currentExams.map(
        (exam) => exam.Examenes_idExamenes,
      );

      // Obtener los IDs de los exámenes a eliminar (los actuales no presentes en los exámenes actualizados)
      const examsToDelete = currentExamIds.filter(
        (examId) => !Examenes_idExamenes.includes(examId),
      );

      // Eliminar los exámenes que no están en los exámenes actualizados
      for (const examId of examsToDelete) {
        await this.userExamRepository.delete({
          Pacientes_documento: documento,
          Examenes_idExamenes: examId,
        });
      }

      // Agregar los nuevos exámenes que no están ya asociados al paciente
      const examsToAdd = Examenes_idExamenes.filter(
        (examId) => !currentExamIds.includes(examId),
      );

      const asociacionesPacienteExamenes = examsToAdd.map((examId) => {
        const asociacion = new PacienteExamen();
        asociacion.Pacientes_documento = Pacientes_documento;
        asociacion.Examenes_idExamenes = examId;
        return asociacion;
      });

      await this.userExamRepository.save(asociacionesPacienteExamenes);

      // Obtener y retornar los exámenes actualizados
      return await this.getExamsForPatient(documento);
    } catch (error) {
      throw new HttpException(
        'Error al actualizar los exámenes del paciente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(id: number, user: UpdateUserDto) {
    const userFound = await this.userRepository.findOne({
      where: {
        documento: id,
      },
    });

    if (!userFound) {
      return new HttpException('Usuario no encontrado!', HttpStatus.NOT_FOUND);
    }

    const updateUser = Object.assign(userFound, user);

    return this.userRepository.save(updateUser);
  }

  async deleteUser(id: number) {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      return new HttpException('Usuario no encontrado!', HttpStatus.NOT_FOUND);
    }

    return result;
  }

  private loadUsersFromFile() {
    try {
      const fileData = fs.readFileSync(this.filePath, 'utf-8');
      this.users = JSON.parse(fileData);
    } catch (error) {
      // Si el archivo no existe o hay un error al leerlo, se crea un array vacío
      this.users = [];
    }
  }

  private saveUsersToFile() {
    fs.writeFileSync(
      this.filePath,
      JSON.stringify(this.users, null, 2),
      'utf-8',
    );
  }

  getAllUsersList() {
    return this.users;
  }

  getUserByDocument(documento: number) {
    const user = this.users.find((u) => u.documento === documento);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async createUserList(users: any[]) {
    users.forEach((user) => {
      const userExists = this.users.find((u) => u.documento === user.documento);
      if (userExists) {
        throw new ConflictException('El usuario ya existe');
      }
      this.users.push(user);
    });

    this.saveUsersToFile();
    return users;
  }

  deleteUserByDocumentList(documento: number) {
    const userIndex = this.users.findIndex((u) => u.documento == documento);
    if (userIndex === -1) {
      throw new NotFoundException('Usuario no encontrado');
    }
    this.users.splice(userIndex, 1);
    this.saveUsersToFile();
    return { message: 'Usuario eliminado correctamente' };
  }

  clearUserList() {
    this.users = [];
    this.saveUsersToFile();
    return { message: 'Lista de usuarios vaciada correctamente' };
  }
}
