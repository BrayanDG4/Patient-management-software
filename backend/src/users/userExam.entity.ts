import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Paciente } from './user.entity';
import { Examen } from './exam.entity';

@Entity({ name: 'PacienteExamen' })
export class PacienteExamen {
  @PrimaryColumn()
  Pacientes_documento: number;

  @PrimaryColumn()
  Examenes_idExamenes: number;

  @ManyToOne(() => Paciente, (paciente) => paciente.pacienteExamenes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'Pacientes_documento' })
  paciente: Paciente;

  @ManyToOne(() => Examen, (examen) => examen.pacientes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'Examenes_idExamenes' })
  examen: Examen;
}
