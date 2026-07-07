/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1958710375");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
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
        "id": "text1689669068",
        "max": 0,
        "min": 0,
        "name": "userId",
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
        "id": "date2513197146",
        "max": "",
        "min": "",
        "name": "timeOfCompletion",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number2422731324",
        "max": null,
        "min": null,
        "name": "mission",
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
        "id": "json2868110883",
        "maxSize": 0,
        "name": "rewardedItems",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
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
    "id": "pbc_1958710375",
    "indexes": [
      "CREATE UNIQUE INDEX idx_missions_legacyId ON missions (legacyId)"
    ],
    "listRule": null,
    "name": "missions",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
})
