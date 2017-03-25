(function(){
	window.addEventListener('DOMContentLoaded', () => {
		let passwordFormModal = document.getElementById('password-form-modal')

		if (!passwordFormModal)
			return

		let passwordForm = lpasswordFormModal.querySelector('form')

		if (!passwordForm)
			return

		passwordForm.addEventListener('submit', event => {
			event.preventDefault()

			let xhr = new XMLHttpRequest
			xhr.open('POST','/ar/api/resetpassword', true)

			xhr.addEventListener('error', error => {
				console.error(error)
				UIkit.notify('Internal service error', {status  : 'danger'})

			})

			xhr.addEventListener('load', () => {
				if( 200 !== xhr.status)
					return UIkit.notify('Incorrect email', {status  : 'warning' })

				UIkit.modal('#password-form-modal').hide()
			})

			xhr.send(JSON.stringify({ email: passwordForm.elements.email.value }))
		})
	})
})()
