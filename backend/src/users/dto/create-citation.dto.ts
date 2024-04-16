export class CreateCitationDto {
  fecha_citacion: string;
  hora_citacion: string;
  hora_atendido?: string;
  pacienteDocumento: number;
}
