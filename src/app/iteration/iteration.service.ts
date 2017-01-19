import { Http, Headers } from '@angular/http';
import { AuthenticationService } from './../auth/authentication.service';
import { IterationModel } from './../models/iteration.model';
import { Injectable } from '@angular/core';

@Injectable()
export class IterationService {
  private iterations: IterationModel[] = [];
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http, private auth: AuthenticationService) {
      if (this.auth.getToken() != null) {
        this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
      }
  }

  /**
   * getIteration - We call this service method to fetch
   * @param iterationUrl - The url to get all the iteration
   * @return Promise of IterationModel[] - Array of iterations
   */
  getIterations(iterationUrl: string = ''): Promise<IterationModel[]> {
    if (this.checkValidIterationUrl(iterationUrl)) {
      return this.http
        .get(iterationUrl, { headers: this.headers })
        .toPromise()
        .then (response => {
          if (response.status != 200) {
            throw new Error('API error occured');
          }
          return response.json().data as IterationModel[];
        })
        .then((data) => {
          this.iterations = data;
          return this.iterations;
        })
        .catch ((error: Error | any) => {
          console.log('Fetch iteration API returned some error - ', error.message);
          return Promise.reject<IterationModel[]>([] as IterationModel[]);
        })
    } else {
      console.log('URL not matched');
      return Promise.reject<IterationModel[]>([] as IterationModel[]);
    }
  }

  /**
   * Create new iteration
   * @param iterationUrl - POST url
   * @param iteration - data to create a new iteration
   * @return new item
   */
  createIteration(
    iterationUrl: string = '',
    iteration: IterationModel
  ): Promise<IterationModel> {
    if (this.checkValidIterationUrl(iterationUrl)) {
      return this.http
        .post(iterationUrl, { headers: this.headers })
        .toPromise()
        .then (response => {
          if (response.status != 200) {
            throw new Error('API error occured');
          }
          return response.json().data as IterationModel
        })
        .then (newData => {
          // Add the newly added iteration on the top of the list
          this.iterations.splice(0, 0, newData);
          return newData;
        })
        .catch ((error: Error | any) => {
          console.log('Post iteration API returned some error - ', error.message);
          return Promise.reject<IterationModel>({} as IterationModel);
        })
    } else {
      console.log('URL not matched');
      return Promise.reject<IterationModel>( {} as IterationModel );
    }
  }

  /**
   * Get locally saved iterations' reference
   */
  getIterationList() {
    return this.iterations;
  }

  /**
   * checkValidIterationUrl checks if the API url for
   * iterations is valid or not
   * sample url -
   * http://localhost:8080/api/spaces/d7d98b45-415a-4cfc-add2-ec7b7aee7dd5/iterations
   *
   * @param URL
   * @return Boolean
   */
  checkValidIterationUrl(url: string): Boolean {
    let urlArr: string[] = url.split('/');
    let uuidRegExpPattern = new RegExp('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');
    return (
      urlArr[urlArr.length - 1] === 'iterations' &&
      uuidRegExpPattern.test(urlArr[urlArr.length - 2]) &&
      urlArr[urlArr.length - 3] === 'spaces'
    );
  }
}
