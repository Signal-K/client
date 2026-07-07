/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2159713675");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id = profileId",
    "deleteRule": "@request.auth.id = profileId",
    "fields": [
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text2602996892",
        "max": 0,
        "min": 0,
        "name": "profileId",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "autodate2261412156",
        "name": "createdAt",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      }
    ],
    "id": "pbc_2159713675",
    "indexes": [],
    "listRule": "@request.auth.id = profileId",
    "name": "notification_rejections",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id = profileId",
    "viewRule": "@request.auth.id = profileId"
  });

  return app.save(collection);
})
