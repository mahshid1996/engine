
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    href: String,
    name: String,
    description: String,
    status: {
      type: String,
      enum: [
        "Active",
        "InActive"
      ]
    },
    code: String,
    "@type": String,
    "@baseType": {
      type: String
    },
    batchStart: String,
    currentBatch: String,
    relatedParty: [
      {
        _id:false,
        name: String,
        email: String,
        phone: String
      }
    ],
    attachment: [
      {
        _id:false,
        href: String,
        attachmentType: String,
        content: String,
        description: String,
        mimeType: String,
        name: String,
        url: String,
        size: {
          amount: String,
          units: String
        },
        validFor: {
          startDateTime: Date,
          endDateTime: Date
        },
        "@baseType": String,
        "@type": String,
        "@schemaLocation": String,
        "@referredType": String
      }
    ],
    configCharacteristics: [
      {
        _id:false,
        name: String,
        code: String,
        valueType: String,
        configCharacteristicsValues: [
          {}
        ]
      }
    ]
  }
)



const masterConfigsModel = mongoose.model('masterconfigs',schema);
module.exports = masterConfigsModel;
