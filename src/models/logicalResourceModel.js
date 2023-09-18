
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    href: String,
    description: String,
    name: String,
    resourceVersion: { 
      type: String,
      default : '1.0'
    },
    "@type": String,
    "@baseType": { 
      type: String,
      default : 'LogicalResource'
    },
    "@schemaLocation": String,
    isBundle:{ 
      type: Boolean,
      default : false
    },
    value: String,
    startOperatingDate: {
      type:Date,
      default: Date.now
    } ,
    endOperatingDate: {
      type:Date,
      default: Date.now
    } ,
    operationalState: String,
    resourceStatus: {
      type: String,
      enum: [
        "Created",
        "Available",
        "Reserved",
        "InUse",
        "Retired",
        "Disabled",
        "Pooled",
        "Blocked"
      ]
    },
    businessType: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    category: [
      {
        _id:false,
        id:String,
        name: String
      }
    ],
    cost: {
      taxFreeValue: Number,
      taxedValue: Number,
      unit: String
    },
    attachment: [
      {
        _id:false,
        id:String,
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
    note: [
      {
        _id:false,
        // id:String,
        authorRole: String,
        author: String,
        date: Date,
        text: String
      }
    ],
    place: [
      mongoose.Schema.Types.ObjectId
    ],
    relatedParty: [
      {
        _id:false,
        //id:String,
        name: String,
        role: String,
        "@type": String,
        "@baseType": String
      }
    ],
    resourceCharacteristic: [
      {
        _id:false,
        // id:String,
        code: String,
        name: String,
        publicIdentifier: {
          type: Boolean,
          default: true
        },
        value: String,
        valueType: String
      }
    ],
    resourceSpecification: [
      mongoose.Schema.Types.ObjectId
    ],
    productOffering: [
      mongoose.Schema.Types.ObjectId
    ],
    resourceRelationship: [
      {
        _id:false,
        relationshipType: {
          type: String,
          enum: [
            "reliesOn",
            "bundle",
            "dependency",
            "starterPack"
          ]
        },
        validFor: {
          startDateTime: {
            type:Date,
            default: Date.now
          } ,
          endDateTime: {
            type:Date,
            default: Date.now
          } 
        },
        resource: {}
      }
    ],
    bundledResources: [
      {
        _id:false,
        id:String,
        href: String,
        "@type": String,
        "@baseType": String,
        "@schemaLocation": String
      }
    ]
  }
)



const logicalResourceModel = mongoose.model('logicalresource',schema);
module.exports = logicalResourceModel;
