import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Paciente } from './user.entity';

@Entity({ name: 'Citaciones' })
export class Citacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha_citacion: Date;

  @Column({ type: 'time' })
  hora_citacion: string;

  @Column({ type: 'time', nullable: true })
  hora_atendido: string;

  @Column()
  pacienteDocumento: number; // Referencia al documento del paciente

  @ManyToOne(() => Paciente, (paciente) => paciente.citaciones, {
    onDelete: 'CASCADE', // Opcional, para eliminar citas si se elimina el paciente
  })
  paciente: Paciente;
}
