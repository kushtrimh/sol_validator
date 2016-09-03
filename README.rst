=====
sol_validator
=====

Sol_validator is a Django App that will automate Javascript validation
for you without the need to write any Javascript code.

Detailed documentation is in the "docs" directory.

Quick start
-----------

1. Add "sol_validator" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = [
        ...
        'sol_validator',
    ]

2. Create a form that inherits from SolForm.
    from sol_validator.forms import SolForm
    ...
    ...
    class MyForm(SolForm):
        ...
    

3. Include sol_validator Javascript and CSS files in your HTML file.
    <link href="{% static 'sol_validator/solcss.css' %}></script>
    ...
    ...
    <script src="{% static 'sol_validator/soljs.js' %}"></script>

4. Add 'sol-validator' attribute to your form.
    <form action="" method="POST" sol-validator="error">
    ...

