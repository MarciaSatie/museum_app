use app_museum

db.users.deleteOne({ email: "r@r.com" })


db.users.deleteMany({ _id: { $type: "objectId" } })


db.users.insertOne({
  _id: "d3c0948f-744c-49eb-85a5-fc2c2ebbdf72",
  firstName: "Homer",
  lastName: "Simpson",
  email: "homer@simpson.com",
  password: "secret",
  role: "admin"
})

db.users.insertOne({
  _id: "8370b37d-49ff-45bb-8b07-7eebf90c3e73",
  firstName: "Marge",
  lastName: "Simpson",
  email: "marge@simpson.com",
  password: "secret",
  role: "user"
})

db.users.insertOne({
  _id: "fd3d1c1f-7cf7-4683-9b4f-f6c5e4217087",
  firstName: "Bart",
  lastName: "Simpson",
  email: "bart@simpson.com",
  password: "secret",
  role: "user"
})

use app_museum
db.categories.insertOne({
  name: "Art",
  location: "Europe",
  description: "Beautiful paintings and sculptures"
})

db.getCollection("users").find({})
db.getCollection("categories").find({})

