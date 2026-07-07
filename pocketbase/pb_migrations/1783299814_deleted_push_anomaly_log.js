/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1193106167");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "help": "",
        "hidden": false,
        "id": "number1140983772",
        "max": null,
        "min": null,
        "name": "anomalyId",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "autodate1538108716",
        "name": "sentAt",
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
    "id": "pbc_1193106167",
    "indexes": [],
    "listRule": null,
    "name": "push_anomaly_log",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
})
