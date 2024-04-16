import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Citacion } from './citation.entity';
import { PacienteExamen } from './userExam.entity';

@Entity({ name: 'Pacientes' })
export class Paciente {
  @PrimaryColumn()
  documento: number;

  @Column({ length: 100 })
  tipo_documento: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'date' })
  fecha_ultima_menstruacion: Date;

  @Column({ length: 20 })
  edad: string;

  @Column({ type: 'time' })
  hora_llegada: string;

  @OneToMany(() => Citacion, (citacion) => citacion.paciente)
  citaciones: Citacion[];

  @OneToMany(() => PacienteExamen, (pacienteExamen) => pacienteExamen.paciente)
  pacienteExamenes: PacienteExamen[];
}
