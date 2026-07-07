/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2875855363");

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
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3879679654",
        "max": 0,
        "min": 0,
        "name": "bucket",
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
        "id": "text190089999",
        "max": 0,
        "min": 0,
        "name": "path",
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
        "id": "file2359244304",
        "maxSelect": 1,
        "maxSize": 52428800,
        "mimeTypes": null,
        "name": "file",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": null,
        "type": "file"
      }
    ],
    "id": "pbc_2875855363",
    "indexes": [
      "CREATE UNIQUE INDEX idx_storage_objects_bucket_path ON storage_objects (bucket, path)"
    ],
    "listRule": "",
    "name": "storage_objects",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": ""
  });

  return app.save(collection);
})
