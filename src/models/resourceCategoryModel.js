
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    href: String,
    name: String,
    description: String,
    code: String,
    version: {
      type:String,
      //required: true,
      default:'1.0'
    },
    "@schemaLocation": String,
    "@type": String,
    "@baseType": String,
    categorySchema: String,
    validFor: {
      startDateTime:{
        type:Date,
        default: undefined
      } ,
      endDateTime: {
        type:Date,
        default: undefined
      } 
    },
    lifecycleStatus: {
      type: String,
      enum: [
        "Initial",
        "Active",
        "Launched",
        "Retired"
      ]
    },
    realizingResourceType: {
      type: String,
      enum: [
        "logicalResource",
        "physicalResource",
        "nonSerializedResource"
      ]
    },
    lastUpdate: Date,
    isRoot: { 
      type: Boolean,
      default : false
    },
    isBundle: { 
      type: Boolean,
      default : false
    },
    parentId: String,
    category: [
      mongoose.Schema.Types.ObjectId
    ],
    relatedParty: [
      {
        _id:false,
        id:String,
        href: String,
        role: String,
        name: String
      }
    ]
  }
)



const resourceCategoryModel = mongoose.model('resourcecategory', schema);
module.exports = resourceCategoryModel;
