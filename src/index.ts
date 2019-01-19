import deparam from 'deparam';

interface INetworkRequestResponse {
  body: any; // POJO or a JSON stringify equalivant
  method: string;
  headers: object;
}

export default class LogrocketFuzzySearch {
  public static setup(fields) {
    const instance = new LogrocketFuzzySearch(fields);

    return {
      requestSanitizer: instance.requestSanitizer.bind(instance),
      responseSanitizer: instance.responseSanitizer.bind(instance),
    };
  }

  private fields: string[] = [];

  constructor(privateFields: string[]) {
    this.fields = privateFields;
  }

  public requestSanitizer(request: INetworkRequestResponse): object | any {
    // avoid parsing GET requests as there will be no body
    if (request.method === 'GET') {
      return request;
    }

    this._networkHandler(request);
  }

  public responseSanitizer(reponse: INetworkRequestResponse): object | any {
    this._networkHandler(reponse);
  }

  private _networkHandler(networkRequestReponse: INetworkRequestResponse) {
    const { body, headers } = networkRequestReponse;
    const requestContentType: string = headers && (headers['Content-Type'] || '');
    const isUrlEncodedRequest: boolean = requestContentType.includes('form-urlencoded');
    let parsedBody: object;

    try {
      parsedBody = isUrlEncodedRequest ? deparam(body) : JSON.parse(body);

      this._searchBody(parsedBody);
    } catch (error) {
      return networkRequestReponse;
    }

    networkRequestReponse.body = parsedBody;

    return networkRequestReponse;
  }

  private _searchBody(body: any = {}) {
    // iterate over collection of objects ex. [{}, ...]
    if (body && body.constructor === Array) {
      body.forEach((item) => this._searchBody(item));
    } else {
      for (const key in body) {
        if (body.hasOwnProperty(key)) {
          const keyName = body[key];

          /*
            Determines if the passed in object is a type-value pair,
            resembling the following shape:

              {
                type: 'email',
                value: 'foo@ex.com'
              }
          */
          const isTypeValuePair = key === 'type' && 'value' in body;

          if (typeof keyName === 'object') {
            if (!isTypeValuePair) {
              this._searchBody(keyName);
            }
          }

          if (isTypeValuePair) {
            this._mask(body, body.type, 'value');
          } else {
            this._mask(body, key);
          }
        }
      }
    }
  }

  private _mask(body: object, searchKeyName: string, maskKeyName?: string) {
    maskKeyName = maskKeyName || searchKeyName;

    const isSensitiveFieldName = this._match(searchKeyName);

    if (isSensitiveFieldName) {
      body[searchKeyName] = '*';
    }
  }

  private _match(keyName: string = ''): boolean {
    const { fields } = this;
    const normalizedKeyName = keyName.toLowerCase();

    return fields.some((field) => normalizedKeyName.indexOf(field.toLowerCase()) > -1);
  }
}
