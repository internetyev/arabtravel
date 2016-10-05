import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { APIService } from '../../services/api.service'

import { User } from '../../common/user'

@Component({
	moduleId: module.id,
	selector: 'user-list',
	templateUrl: '/app/components/user/user-list.component.html'
})
export class UserListComponent implements OnInit {
	constructor(private router: Router, private apiService: APIService) {}

	ngOnInit(): void {
	}

	add(): void {

	}
}
