/*!
 * API Projects engine
 * Copyright(c) 2016 Wisdman <wisdman@ajaw.it>
 */

'use strict'

const translite = require('../translite.js')

const escapeStr = str => "'" + String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'"

module.exports = class APIProject {
	constructor(DB) {
		this.DB = DB
		this.DB.query(`SELECT unnest(enum_range(NULL::models)) AS model`).then(rows =>
			this.models = rows.reduce( (prev, value) => prev.concat(value.model), [] )
		)
	}

	api(requestData) {
		let method = requestData.request.method

		let model = requestData.request.path.shift()
		if (!model || !this.models.includes(model))
			return Promise.resolve({
				code: 400,
				data: { error: 'Wrong model name'}
			})

		let data = requestData.request.body || undefined

		let id = requestData.request.path.shift() || data && data.__id || null
		if (id && !/^[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))
			return Promise.resolve({
				code: 400,
				data: { error: 'ID is not valid UUIDv1'}
			})

		if (data && data.id)
			delete data.id

		switch (method) {
			case 'GET':

				if (!id)
					return this.DB.query(`
						SELECT
							objects.id,
							objects.enable,
							objects.title,
							json_build_object('id',users.id, 'title',users.title) AS owner
						FROM objects
						LEFT JOIN users ON objects.owner = users.id
						WHERE model = '${model}'
						ORDER BY title
					`).then(rows => ({
						code: 200,
						data: rows
					}))

				return this.DB.query(`
					SELECT
						objects.id,
						objects.enable,
						objects.title,
						objects.data,
						json_build_object('id',users.id, 'title',users.title) AS owner
					FROM objects
					LEFT JOIN users ON objects.owner = users.id
					WHERE
						objects.model = '${model}'
						AND
						objects.id = '${id}'
				`).then(rows => {
					if (rows.length !== 1)
						return {
							code: 404,
							data: { error: `Object "${id}"" not found`}
						}

					let obj = {
						id: rows[0].id,
						enable: rows[0].enable,
						title: rows[0].title,
						owner: rows[0].owner
					}

					let data = rows[0].data

					if (data.owner !== undefined)
						delete data.owner

					if (data.id !== undefined)
						delete data.id

					if (data.enable !== undefined)
						delete data.enable

					if (data.title !== undefined)
						delete data.title

					return {
						code: 200,
						data: Object.assign(obj, data)
					}
				})

			case 'POST':
				if (!data)
					return Promise.resolve({
						code: 400,
						data: { error: 'Invalid request object'}
					})

				if (!id)
					return Promise.resolve({
						code: 400,
						data: { error: 'ID is empty'}
					})

				id = `'${id}'`

				let command = requestData.request.path.shift()

				switch (command) {
					case 'enable':
						return this.DB.query(`
							UPDATE objects
							SET enable = NOT enable
							WHERE
								model = '${model}'
								AND
								id = ${id}
							RETURNING enable
						`).then( rows => ({
							code: 200,
							data: rows[0]
						}))
					default:
						let owner = "'" + requestData.user.id + "'"

						if (data.owner !== undefined)
							delete data.owner

						if (data.id !== undefined)
							delete data.id

						let enable = true
						if (data.enable !== undefined) {
							enable = !!data.enable
							delete data.enable
						}
						enable = enable && 'TRUE' || 'FALSE'

						let title = ''
						if (data.title !== undefined) {
							title = String(data.title).trim()
							delete data.title
						}
						title = escapeStr(title)

					 	data = escapeStr(JSON.stringify(data || {}))

						return this.DB.query(`
							INSERT INTO objects (
								model,      id,    enable,    owner,    title,    data
							) VALUES (
								'${model}', ${id}, ${enable}, ${owner}, ${title}, ${data}
							) ON CONFLICT (id) DO UPDATE SET
								enable = ${enable},
								owner = ${owner},
								title = ${title},
								data = ${data}
							RETURNING
								objects.*,
								(
									SELECT json_build_object('id',id, 'title',title)
									FROM users
									WHERE objects.owner = users.id
								) AS owner
						`).then( rows => ({
							code: 200,
							data: Object.assign(rows[0], rows[0].data, { data: null })
						}) )
				}

			case 'DELETE':
				if (!id)
					return Promise.resolve({
						code: 400,
						data: { error: 'ID is not set' }
					})
				return this.DB.query(`
					DELETE FROM objects
					WHERE
						model = '${model}'
						AND
						id='${id}'
				`).then(rows => ({
					code: 200,
					data: { sucess: 'deleted', id: id }
				}))
		}
	}
}
