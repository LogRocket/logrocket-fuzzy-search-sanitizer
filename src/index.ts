import deparam from 'jquery-deparam';

export default class LogrocketFuzzySearch {
  private fields: string[] = [];

  constructor(privateFields: string[]) {
    this.fields = privateFields;
  }

  public requestSanitizer(request: object): object | any {
    this._networkHandler(request);
  }

  public reponseSanitizer(reponse: object): object | any {
    this._networkHandler(reponse);
  }

  private _networkHandler(networkRequestReponse: any = {}) {
    const { body, headers } = networkRequestReponse;
    const requestContentType = headers['Content-Type'] || '';
    const isUrlEncodedRequest = requestContentType.includes('form-urlencoded');
    let parsedBody;

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
    if (body.constructor === Array) {
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
