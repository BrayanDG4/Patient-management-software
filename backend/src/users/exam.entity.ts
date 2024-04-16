import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Paciente } from './user.entity';

@Entity({ name: 'Examenes' })
export class Examen {
  @PrimaryGeneratedColumn()
  idExamenes: number;

  @Column({ length: 45, nullable: true })
  nombre_examen: string;

  @ManyToMany(() => Paciente, (paciente) => paciente.pacienteExamenes)
  @JoinTable({
    name: 'PacienteExamen',
    joinColumn: {
      name: 'Examenes_idExamenes',
      referencedColumnName: 'idExamenes',
    },
    inverseJoinColumn: {
      name: 'Pacientes_documento',
      referencedColumnName: 'documento',
    },
  })
  pacientes: Paciente[];
}
