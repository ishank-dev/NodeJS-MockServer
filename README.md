# Node-Mom
Mother of all REST mock servers built with Node and Express from ground up.

### What is this project all about?
This is a backend service that lets you create REST APIs without having to write any code from your end.

### What is the need of this project?
Most of the front-end developers require fake REST APIs for quick prototyping and testing, and this project can be easily consumed by them in order to test and check the REST API of their choices.

### Usage
- ``npm install``
- ``cd Node-Mom``
- ``node index.js``

### API Endpoints

GET<br>
``/``<br>
Displays all the entities that you have created

POST<br>
``/:entityName``<br>
For creating a new entity<br>

BODY<br>
``{"key":"value"}``

PUT<br>
``/:entityName/:id``<br>
For updating a specific entity

DELETE<br>
``/:entityName/:id``<br>
For deleting a specific entity

### Filtering Results

#### Filtering by key value pair
``/:entityName?<key=value>``

#### Filtering by search
``/:entityName?_q=<value that you want to search>``

#### Filtering by sort
``/:entityName?_sort=<key>`` 

#### Filtering by order
``/:entityName?order=<asc/dsc>``(Gives ascending results by default)

### Key Features of this backend servidce
- Persistant storage in a file called store.json, where you can add your own JSON object
- No knowledge of backend + database needed to build the REST APIs
- Supports multiple search queries while filtering

### Drawbacks
- Search isn't supported for nested JSON objects

#### Please star the repository if you liked it
