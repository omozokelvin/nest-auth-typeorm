import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IResponse<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T> | any> {
    return next.handle().pipe(
      map((responseData) => {
        let data = responseData || null;
        let message = 'Success';

        if (typeof data === 'string') {
          message = data;
          data = null;
        } else if (typeof data === 'boolean') {
          message = 'Success';
        } else if (!data?.hasOwnProperty('message')) {
          data = data?.data || data;
        } else {
          message = data?.message;
          delete data.message;
        }

        const transformedResponse: any = {
          status: 'success',
          message,
        };

        if (!isEmpty(data)) {
          transformedResponse.data = data;
        }

        return transformedResponse;
      }),
    );
  }
}
