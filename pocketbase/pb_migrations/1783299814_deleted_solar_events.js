/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3856350160");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "help": "",
        "hidden": false,
        "id": "date3387360544",
        "max": "",
        "min": "",
        "name": "weekStart",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "help": "",
        "hidden": false,
        "id": "date2527038286",
        "max": "",
        "min": "",
        "name": "weekEnd",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "help": "",
        "hidden": false,
        "id": "bool1992361090",
        "name": "wasDefended",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
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
        "hidden": false,
        "id": "autodate3175243278",
        "name": "updatedAt",
        "onCreate": true,
        "onUpdate": true,
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
    "id": "pbc_3856350160",
    "indexes": [],
    "listRule": null,
    "name": "solar_events",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
})
