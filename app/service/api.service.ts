import { Injectable } from '@angular/core'
import { Http, Headers, Response, RequestOptions } from '@angular/http'
import 'rxjs/add/operator/toPromise'

import { Model } from '../../model/model'
import { UUID } from '../../model/uuid'

@Injectable()
export class APIService {
	private static apiRoot = '/api'

	private static options = new RequestOptions({
		headers: new Headers({
			'Content-Type': 'application/json'
		})
	})

	private static handleError (error: any) {

		if (error instanceof Error) {
			console.error(error)
			return Promise.reject(new Error('API service internal error'))
		}

		let message = error.status && (
						error.status === 403 && 'Действие запрещено политикой приложения' ||
						error.json instanceof Function && error.json().error ||
						error.text instanceof Function && error.text() ||
						`${error.status} - ${error.statusText}`
					  ) || `Unknown API service error: ${error}`

		console.error(message)
		return Promise.reject(new Error(message))
	}

	private static getAPIurl(api:string = '', item: UUID | Model | string = null): string {
		let id = item instanceof Model && item.id.toString() ||
				 item instanceof UUID && item.toString() ||
				 item && String(item).trim() || ''
		return `${APIService.apiRoot}/${api}/${id}`.replace(/\/\//,'/')
	}

	constructor(private http: Http) {}

	get<T extends Model>( model: { new(value: any): T, __api: string },
						  item: UUID | Model | string = null
						) : Promise<T | T[] | Error> {
		let api = APIService.getAPIurl(model.__api, item)
		return this.http.get(api)
						.toPromise()
						.then(response => response.json() || null)
						.then(value => value && value || Promise.reject({ message: 'Response is empty' }) )
						.then(value => {
							if (value instanceof Array)
								return value.map( (value:any) => new model(value))
							return new model(value)
						})
						.catch(APIService.handleError)
	}
}