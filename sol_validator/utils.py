import json

class SolAjax(object):
	"""
	Used to accept the data sent by the SolAjaxRequest,
	validate it and make ready the reponse data to be
	sent back.
	"""
	def __init__(self, form_class, request_data):
		# Get data dict from request data
		self.form_data = self.form_data_builder(request_data)
		self.form_class = form_class


	def form_data_builder(self, request_data):
		"""
		Builds the form data needed for validation
		using the data sent by the AJAX request.
		"""

		form_data = json.loads(request_data['form_data'])

		form_dict = {}
		for data in form_data:
			form_dict[data['name']] = data['value']

		return form_dict

	def json_response(self):
		"""
		Checks if the data is valid or not,
		and returns JSON data to be sent as
		the response. If the data is not valid
		then the JSON data that will be used in
		the response will contain the errors that
		were raised through validation.
		"""

		form = self.form_class(self.form_data)
		if form.is_valid():
			response = {
				"valid": True,
				"errors": []
			}
			# return json.dumps(response)
		else:
			response = {
				"valid": False,
				"errors": self.change_errors(form.errors.as_json())
			}

		return json.dumps(response)

	def change_errors(self, errors):
		"""
		Changes the error in the way that our Javascript
		will understand to work with.
		"""

		error_dict = json.loads(errors)
		errors_changed = {}

		for name, err in error_dict.items():
			errors_changed[name] = (name, err[0]['message'])

		return errors_changed
