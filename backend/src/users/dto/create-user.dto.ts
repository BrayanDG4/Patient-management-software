export class CreateUserDto {
  documento: number;
  tipo_documento: string;
  nombre: string;
  fecha_ultima_menstruacion: Date;
  edad: string;
  hora_llegada: string;
}
