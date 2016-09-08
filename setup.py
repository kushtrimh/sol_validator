import os
from setuptools import find_packages, setup

with open(os.path.join(os.path.dirname(__file__), 'README.rst')) as readme:
    README = readme.read()

# allow setup.py to be run from any path
os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

setup(
    name='sol_validator',
    version='1.1',
    packages=find_packages(),
    include_package_data=True,
    license='BSD License',
    description='Simple Django App to automate Javascript form validation.',
    long_description=README,
    url='https://www.wierdsource.com/',
    author='Kushtrim Hajrizi',
    author_email='kushtrimmh13@gmail.com',
)
