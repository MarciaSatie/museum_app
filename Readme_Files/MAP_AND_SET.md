# JavaScript Map and Set

This note explains two useful JavaScript collection types: `Map` and `Set`.

## 1. Map

`Map` stores data as **key-value pairs**.

Example:

```javascript
const userMap = new Map();
userMap.set("u1", { firstName: "Homer", lastName: "Simpson" });
userMap.set("u2", { firstName: "Marge", lastName: "Simpson" });

console.log(userMap.get("u1"));
// { firstName: "Homer", lastName: "Simpson" }
```

### Why use `Map`?

- It is fast for lookups by key.
- Keys can be any type, not just strings.
- It keeps insertion order.
- It has helpful methods like `set()`, `get()`, `has()`, `delete()`, and `clear()`.

### Common `Map` methods

- `set(key, value)` - add or update a pair.
- `get(key)` - read a value by key.
- `has(key)` - check if a key exists.
- `delete(key)` - remove one entry.
- `clear()` - remove everything.
- `size` - number of items in the map.

### Example in this project

In your `galleries-controller.ts`, `Map` is used to connect IDs to user or museum objects:

```javascript
const userMap = new Map(allUsers.map((u) => [u._id, u]));
const museumMap = new Map(museums.map((m) => [m._id, m]));
```

That means:

- the key is the `_id`
- the value is the full user or museum object

Later you can do fast lookups like:

```javascript
const owner = userMap.get(museum.userid);
```

That is much cleaner than searching the whole array every time.

### Looping over a `Map`

```javascript
for (const [key, value] of userMap) {
  console.log(key, value);
}
```

## 2. Set

`Set` stores **unique values only**.

Example:

```javascript
const numbers = new Set();
numbers.add(1);
numbers.add(2);
numbers.add(2); // ignored because 2 already exists

console.log(numbers.size); // 2
```

### Why use `Set`?

- It automatically removes duplicates.
- It is fast for membership checks.
- It is useful when you only care whether a value exists or not.

### Common `Set` methods

- `add(value)` - insert a value.
- `has(value)` - check if the value exists.
- `delete(value)` - remove one value.
- `clear()` - remove all values.
- `size` - number of unique values in the set.

### Example in this project

In `galleries-controller.ts`, `Set` is used to store public museum IDs:

```javascript
const publicMuseumIds = new Set(publicMuseums.map((m) => m._id));
```

Then the code checks quickly:

```javascript
if (!publicMuseumIds.has(image.museum)) continue;
```

That means:

- if the image belongs to a public museum, keep it
- if not, skip it

This is a fast and simple way to filter images.

## 3. Main difference

| Feature | Map | Set |
|---|---|---|
| Stores | key-value pairs | unique values |
| Duplicate keys/values | keys are unique | values are unique |
| Best for | lookup by ID or key | uniqueness checks |

## 4. When to use each one

Use `Map` when:

- you need to connect an ID to an object
- you want fast lookups
- you need key-value storage

Use `Set` when:

- you need unique values only
- you want to test if something exists quickly
- you want to remove duplicates

## 5. In one sentence

- `Map` = fast key to value lookup.
- `Set` = unique values with fast existence checking.

## 6. Tiny project summary

For your app:

- `Map` helps match users, museums, and images by `_id`.
- `Set` helps keep only public museum IDs.

That is why both are useful in `galleries-controller.ts`.