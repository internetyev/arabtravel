import './rxjs-extensions'

import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { routing } from './app.routing'

import { APIService } from './service/api.service'
import { MLService } from './service/ml.service'

import { AppComponent } from './component/app.component'
import { MLPipe } from './pipe/ml.pipe'

import { TripSelectorFormComponent } from './component/tripselector/tripselector-form.component'
import { OrderPageComponent } from './component/order/order-page.component'
import { PackageListComponent } from './component/packagelist/packagelist.component'
import { OrderHumanComponent } from './component/order/order-human.component'

import { UserPageComponent } from './component/user/user-page.component'
import { ContactFormComponent } from './component/contact/contact-form.component'

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		routing
	],
	declarations: [
		AppComponent,
		MLPipe,
		TripSelectorFormComponent,
		OrderPageComponent,
		PackageListComponent,
		OrderHumanComponent,
		UserPageComponent,
		ContactFormComponent
	],
	providers: [
		APIService,
		MLService
	],
	bootstrap: [
		AppComponent,
		ContactFormComponent
	]
})
export class AppModule { }
