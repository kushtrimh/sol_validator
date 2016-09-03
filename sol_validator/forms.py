from django.forms import Form, Field
from django import forms
from django.forms.widgets import Input
from django.utils.html import format_html
from django.forms.utils import flatatt, ErrorList

class SolForm(Form):
	"""
	Form that displays field with additional attributes
	that will make Javascript validation possible. Backend
	validation works just fine.
	"""

	additional_attrs = [
		"input_formats",
		"decimal_places",
		"max_digits"
		]

	def __init__(self, *args, **kwargs):
		"""
		Adds the sol-* attributes to the
		inputs according to the validations
		given on the form fields.
		"""
		super(SolForm, self).__init__(*args, **kwargs)

		for name, field in self.fields.items():
			# Add sol HTML attributes and change widget
			self.widget_attrs = field.widget.attrs
			for key, value in self.widget_attrs.items():
				self.widget_attrs['sol-{}'.format(key)] = value

			if field.required:
				self.widget_attrs['sol-required'] = True

			# Set additional attributes
			for attr in self.additional_attrs:
				self.set_additional_attr(field, attr)

			# Reinitialize the widget now with new attrs
			field.widget = field.widget.__class__(self.widget_attrs)

		print(self.media)

	def set_additional_attr(self, field, attr):
		"""
		Check if field has additional attr, if it does
		make that a sol-* attribute and put it
		to widget attrs.

		field -- field which is being checked
		attr -- the attribute name
		"""
		attr_val = getattr(field, attr, None)
		if attr_val is not None:
			if attr == 'input_formats':
				attr_val = "~".join(attr_val)
			self.widget_attrs["sol-{}".format(attr)] = attr_val

# Forms to test
# class MyForm(SolForm):
# 	username = forms.CharField(max_length=50, required=True, min_length=2)
# 	password = forms.CharField(max_length=50, required=True, min_length=3)

# class ThisForm(SolForm):
# 	num = forms.DecimalField(required=True, max_digits=6, decimal_places=2)
# 	date = forms.DateTimeField(required=True, input_formats=['%Y-%m-%d %H:%M:%S'])
# 	age = forms.IntegerField(required=True)