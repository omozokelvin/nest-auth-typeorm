export class MessageDto {
  message: string;
}

export class ApiResponse<T = null> extends MessageDto {
  data: T;
}
