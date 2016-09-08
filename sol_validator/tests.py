import json
from django.test import TestCase
from django import forms

from .forms import SolForm
from .utils import SolAjax

class SolTestForm(SolForm):
	""" Form used for testing SolForm """
	username = forms.CharField(max_length=50, required=True, min_length=2)
	password = forms.CharField(max_length=50, required=True, min_length=3)

class FormTest(TestCase):
	attributes = [
		'max_length', 'min_length',
		'required', 'decimal_places',
		'max_digits', 'max_value',
		'min_value', 'input_formats']

	def test_form_has_sol_attributes(self):
		form = SolTestForm()
		for name, field in form.fields.items():
			for attr_name in self.attributes:
				attr = getattr(field, attr_name, None)
				if attr is not None:
					sol_attr = field.widget.attrs.get('sol-{}'.format(attr_name), None)
					self.assertIsNotNone(sol_attr)

class SolAjaxTest(TestCase):
	def test_sol_ajax_returns_invalid(self):
		data = {
			'form_data': json.dumps(
					[{'name': 'username', 'value': 'v'},
					{'name': 'password', 'value': 'hh'}]
				)
		}
		response_data = json.loads(SolAjax(SolTestForm, data).json_response())

		self.assertFalse(response_data['valid'])
		self.assertEqual(len(response_data['errors']), 2)

	def test_soj_ajax_returns_valid(self):
		data = {
			'form_data': json.dumps(
					[{'name': 'username', 'value': 'vv'},
					{'name': 'password', 'value': 'hhh'}]
				)
		}

		response_data = json.loads(SolAjax(SolTestForm, data).json_response())

		self.assertTrue(response_data['valid'])
		self.assertEqual(len(response_data['errors']), 0)

