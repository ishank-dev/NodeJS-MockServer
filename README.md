# Mock Server Documentation

This mock server is built using **Node.js** and **Express** to provide a simple way to create, read, update, and delete (CRUD) entities. All data is stored in an in-memory object (`store`) and persisted in a file called `store.json`.  

## Main Functionalities

1. **Initialize Store**  
   - Reads from `store.json` once on server startup to populate the `store` object in memory.

2. **Create Entities (POST)**  
   - Accepts JSON data to create new entities under any specified entity type.
   - Automatically generates a unique `id` (UUID).

3. **Read Entities (GET)**  
   - Retrieves a list of **all entity types** or all records of a specific entity type.
   - Allows fetching a **single entity** by its `id`.

4. **Update Entities (PUT)**  
   - Updates the properties of an existing entity without allowing changes to the entity’s `id`.

5. **Delete Entities (DELETE)**  
   - Removes a specific entity by its `id`.

6. **Write Back to `store.json`**  
   - After any POST, PUT, or DELETE operation, the updated data is written to `store.json` for persistence.

---

## Filters and Query Parameters

When making **GET** requests for a specific entity type, you can combine **filters**, **search**, and **sorting** parameters:

1. **Field-based Filters**  
   - Query format: `?key=value`  
   - Filters out results that match the specified key-value pair(s).
   - Example:  
     ```
     GET /products?category=Electronics
     ```

2. **Search**  
   - Query format: `?_q=term`  
   - Searches for the provided term (`term`) across **all fields** of the entities.
   - **Multiple Search Terms**: You can include multiple `?_q` parameters to search for different terms as an **OR** condition. For example:
     ```
     GET /products?_q=phone&_q=tv
     ```
     This will return all products whose fields include `phone` **OR** `tv` (case-insensitive).
   - Example (single term):  
     ```
     GET /products?_q=phone
     ```

3. **Sorting**  
   - Query format: `?_sort=<field>&_order=asc|desc`  
   - Sorts the resulting array based on the provided field in either ascending or descending order.
   - Example:  
     ```
     GET /products?_sort=price&_order=desc
     ```

**Note**: All these operations (filters, search, sorting) can be chained together. For example:

```
GET /products?_q=phone&_sort=price&_order=desc&category=Electronics
```

**Happy Mocking!**

