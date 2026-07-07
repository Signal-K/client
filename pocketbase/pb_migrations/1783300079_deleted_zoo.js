/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2523473220");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
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
      },
      {
        "help": "",
        "hidden": false,
        "id": "number2476487423",
        "max": null,
        "min": null,
        "name": "legacyId",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3182418120",
        "max": 0,
        "min": 0,
        "name": "author",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3479234172",
        "max": 0,
        "min": 0,
        "name": "owner",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number1587448267",
        "max": null,
        "min": null,
        "name": "location",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json2783094231",
        "maxSize": 0,
        "name": "configuration",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number2545907250",
        "max": null,
        "min": null,
        "name": "uploaded",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text4274335913",
        "max": 0,
        "min": 0,
        "name": "content",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "date2261412156",
        "max": "",
        "min": "",
        "name": "createdAt",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text967950098",
        "max": 0,
        "min": 0,
        "name": "fileUrl",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      }
    ],
    "id": "pbc_2523473220",
    "indexes": [
      "CREATE UNIQUE INDEX idx_zoo_legacyId ON zoo (legacyId)"
    ],
    "listRule": null,
    "name": "zoo",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
})
