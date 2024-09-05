import { ApiResponse } from 'src/_common/dtos/response.dto';

export const responder = {
  success: <T = null>(message: string, data: T = null): ApiResponse<T> => {
    return {
      message,
      data,
    };
  },
};
