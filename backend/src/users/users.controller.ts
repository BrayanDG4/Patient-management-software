import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateCitationDto } from './dto/create-citation.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamsForPatientDto } from './dto/update-userExam.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('list')
  getAllUsersList() {
    return this.userService.getAllUsersList();
  }

  @Get('list/:id')
  getUserByIdList(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    return this.userService.getUserByDocument(parsedId);
  }

  @Post('list')
  createUserList(@Body() user: any) {
    try {
      const newUser = this.userService.createUserList(user);
      return newUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new NotFoundException('Error al crear el usuario');
    }
  }

  @Delete('list/:documento')
  deleteUserByDocumentList(@Param('documento') documento: number) {
    return this.userService.deleteUserByDocumentList(documento);
  }

  @Delete('list')
  clearUserList() {
    return this.userService.clearUserList();
  }

  @Get()
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Get('get-citations')
  getCitation() {
    return this.userService.getCitation();
  }

  @Get('get-exams')
  getExam() {
    return this.userService.getExam();
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
    console.log(typeof id);
    return this.userService.getUserById(id);
  }

  @Get('get-patients-by-date/:date')
  async getPatientsByDate(@Param('date') date: string) {
    try {
      const patients = await this.userService.getPatientsByDate(date);
      return patients;
    } catch (error) {
      throw new HttpException(
        'Error al obtener pacientes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  createUser(@Body() newUser: CreateUserDto) {
    return this.userService.createUser(newUser);
  }

  @Post('create-citation')
  createCitation(@Body() citation: CreateCitationDto) {
    return this.userService.createCitation(citation);
  }

  @Post('create-exam')
  createExam(@Body() examData: CreateExamDto) {
    return this.userService.createExam(examData);
  }

  @Post(':documento/examenes/asociar')
  async createUserExam(
    @Param('documento') documentoPaciente: number,
    @Body() body: { idsExamenes: number[] },
  ) {
    try {
      const resultado = await this.userService.asociarExamenesAPaciente(
        documentoPaciente,
        body.idsExamenes,
      );
      return { mensaje: resultado };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: UpdateUserDto,
  ) {
    this.userService.updateUser(id, user);
  }

  @Patch(':documento/examenes')
  async updateExamsForPatient(
    @Param('documento') documento: number,
    @Body() updatedExamsData: UpdateExamsForPatientDto,
  ) {
    try {
      const result = await this.userService.updateExamsForPatient(
        documento,
        updatedExamsData,
      );
      return { message: 'Exámenes actualizados correctamente', data: result };
    } catch (error) {
      throw new HttpException(
        'Error al actualizar los exámenes del paciente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
