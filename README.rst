=============
sol_validator
=============

sol_validator is a Django App that will automate Javascript form validation
for you without the need to write any Javascript code.


Quick start
-----------

1. Add "sol_validator" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = [
        ...
        'sol_validator',
    ]

2. Create a form that inherits from SolForm::
    
    from sol_validator.forms import SolForm
    ...
    ...
    class MyForm(SolForm):
        ...
    

3. Include sol_validator Javascript and CSS files in your HTML file.
   You need JQuery in order for sol_validator to work::
    
    <link href="{% static 'sol_validator/solcss.css' %}></script>
    ...
    ...
    <script src="{% static 'sol_validator/soljs.js' %}"></script>

4. Add 'sol-validator' attribute to your form::
   
    <form action="" method="POST" sol-validator="error">
    ...

Validation Types
----------------

There are currently only 2 validation types. Default one is 'sol-validator' which validates
the data when you click the submit button. The other type of validation is 'sol-request' which
sends an AJAX to the url given in the 'action' attribute of the form.

'sol-request' checks if checks if form is valid in the backend and returnes
the data needed to be displayed if form was invalid.

To use sol-request all you have to do is add the 'sol-request' attribute to your form::
    
    <form action="" method="POST" sol-validator="error" sol-request>
    
In that view in the backend you need to check if any AJAX request came and
return the data if form was valid or not. In your view all you have to do is
write those lines::

    ...
    from sol_validator.utils import SolAjax
    ...
    
    def index(request):
        ....
        if request.is_ajax():
		    json_data = SolAjax(YourFormClass, request.POST).json_response()
		    return HttpResponse(json_data, content_type="json")
		...



Customization
-------------

There are three types to show validation errors::
    
    1) error:           sol-validator="error"
    2) placeholder:     sol-validator="placeholder"
    3) tooltip:         sol-validator="tooltip"
    
To change the type in which you want the errors to display simply
change 'sol-validator' attribute to any of the types given above.

To set a CSS class for input fields with errors use::
    
   <form ... sol-error="youCSSClassName" ...>
  
To set a CSS class for unordered list which holds the errors
(only for 'error' type)::
    
   <form ... sol-errorlist="youCSSClassName" ...>
   
To set the HTML for the symbol that will be displayed when input field
is invalid (only for 'tooltip' type)::
    
    <form ... sol-symbol='<span class="glyphicon glyphicon-search" aria-hidden="true"></span>' ...>
    
To set the CSS class for the symbol (only for 'tooltip' type)::

    <form ... sol-symbolclass="youCSSClassName" ... >
