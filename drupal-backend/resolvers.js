const mysql = require('mysql');
const util = require('util');
const fs = require('fs');
const {
   ownershipsByBoat, getTargetField, getBoats,
   buildSummaryQuery, buildBoatQuery, buildHandicapQuery,
   getImages, getFullDescription, getTargetIdsForType, getTaxonomy
} = require('./queries');

function makeDb(config) {
   const connection = mysql.createConnection(config);
   return {
      query(sql, args) {
         return util.promisify(connection.query)
            .call(connection, sql, args);
      },
      close() {
         return util.promisify(connection.end).call(connection);
      }
   };
}

const options = {
   user: process.env.MYSQL_USER,
   password: process.env.MYSQL_PWD,
   database: process.env.MYSQL_DB,
   host: process.env.MYSQL_HOST
}

const getClass = async (db, boat) => {
   let name = `${boat.name} Class`;
   if (boat.design_class) {
      name = boat.design_class
      delete boat.design_class
   }
   const c =  {
      name: name,
      rigType: boat.rig_type,
   };
   if (boat.hull_type) {
      c.hullType = boat.hull_type
      delete boat.hull_type;
   }
   if (boat.designer) {
      const designer = await getTargetField(db, "designer_name", boat.designer);
      if(designer) {
         c.designer = {name: designer };
      }
      delete boat.designer;
   }
   if (boat.generic_type) {
      c.genericType = boat.generic_type
      delete boat.generic_type;
   }
   if (boat.mainsail_type) {
      c.mainsailType = boat.mainsail_type
      delete boat.mainsail_type;
   }
   return c;
}

const processBoatSummaries = async (db, l) => {
   const boats = [];
   for (let i = 0; i < l.length; i++) {
      const b = l[i];
      if (b.uri) {
         b.image = b.uri.replace('public:/', 'https://oga.org.uk/sites/default/files');
         delete b.uri
      }
      const builder = await getTargetField(db, "builder_name", b.builder);
      if(builder) {
         b.builder = {name: builder };
      }
      boats.push({
         ...b,
         id: b.oga_no,
         class: await getClass(db, b),
      });
   }
   return boats;
}

const pagedBoats = async (_, filters) => {
   const db = makeDb(options);
   const result = await getBoats(db, filters);
   result.boats = await processBoatSummaries(db, result.boats);
   db.close();
   return result;
};

const boat = async (_, {id}) => {
   const db = makeDb(options);
   let l = await db.query(buildBoatQuery(id));
   // only take the non-null keys from the database
   const b = {};
   Object.keys(l[0]).forEach(key => {
      const val = l[0][key];
      if(val) {
         b[key] = val;
      }
   });
   b.id = b.oga_no;
   const builder = await getTargetField(db, "builder_name", b.builder);
   if(builder) {
      b.builder = {name: builder };
   }
   const fd = getFullDescription(db, b.entity_id);
   if(fd) {
      b.full_desc = fd;
   }
   b.currentOwnership = await ownershipsByBoat(db, b.entity_id);
   b.class = await getClass(db, b);
   const images = getImages(db, b.entity_id);
   if(images) {
      b.images = images;
   }
   db.close();
   return b;
}

const handicap = async (_, {id}) => {
   const db = makeDb(options);
   let l = await db.query(buildHandicapQuery(id));
   db.close();
   h = { 
      oga_no: l[0].oga_no, no_head_sails: l[0].no_head_sails,
      fore_triangle_height: l[0].fore_triangle_height,
      fore_triangle_base: l[0].fore_triangle_base,
      calculated_thcf: l[0].calculated_thcf,
      sailarea: l[0].sailarea
    };
   h.main = {
      foot: l[0].main_sail_foot,
      head: l[0].mainsail_head,
      luff: l[0].mainsail_luff
   };
   if(l[0].mizzen_luff) {
      h.mizzen = {
         foot: l[0].mizzen_foot,
         head: l[0].mizzen_head,
         luff: l[0].mizzen_luff
      };   
   }
   if(l[0].topsail_luff) {
      h.topsail = {
         perpendicular: l[0].topsail_perpendicular,
         luff: l[0].topsail_luff
      };   
   }
   if(l[0].foretopsail_luff) {
      h.foretopsail = {
         perpendicular: l[0].foretopsail_perpendicular,
         luff: l[0].foretopsail_luff
      };   
   }
   if(l[0].mizzen_topsail_luff) {
      h.mizzen_topsail = {
         perpendicular: l[0].mizzen_topsail_perpendicul,
         luff: l[0].mizzen_topsail_luff
      };   
   }
   return h;
}

const designers = async (_, {}) => {
   const db = makeDb(options);
   const designers = await getTargetIdsForType(db, 'designers');
   db.close();
   return designers;
}

const builders = async (_, {}) => {
   const db = makeDb(options);
   const builders = await getTargetIdsForType(db, 'builders');
   db.close();
   return builders;
}

const rigTypes = async (_, {}) => {
   const db = makeDb(options);
   const r = await getTaxonomy(db, 'rig_type');
   db.close();
   return r;
}

const sailTypes = async (_, {}) => {
   const db = makeDb(options);
   const r = await getTaxonomy(db, 'main_sail_type');
   db.close();
   return r;
}

const classesOfBoat = async (_, {}) => {
   const db = makeDb(options);
   const r = await getTaxonomy(db, 'design_class');
   db.close();
   return r;
}

const genericTypes = async (_, {}) => {
   const db = makeDb(options);
   const r = await getTaxonomy(db, 'generic_type');
   db.close();
   return r;
}

const constructionMaterials = async (_, {}) => {
   const db = makeDb(options);
   const r = await getTaxonomy(db, 'construction_material');
   db.close();
   return r;
}

const piclists = async () => {
   const db = makeDb(options);
   const r = {
      rigTypes: await getTaxonomy(db, 'rig_type'),
      sailTypes:await getTaxonomy(db, 'main_sail_type'),
      classNames:await getTaxonomy(db, 'design_class'),
      genericTypes:await getTaxonomy(db, 'generic_type'),
      constructionMaterials:await getTaxonomy(db, 'construction_material')
   };
   db.close();
   return r;
}

const boatNames = async () => {
   const db = makeDb(options);
   let l = await db.query(buildSummaryQuery());
   db.close();
   const r = {};
   l.forEach(boat => {
      r[boat.name.trim()] = 1
      const p = boat.prev_name
      if(p) {
         p.split(',').forEach(name => {
            const n = name.trim();
            if(n) r[n] = 1
         });
      }
   })
   return Object.keys(r).sort();
}

const Query = {
   boats: pagedBoats,
   boat: boat,
   handicap: handicap,
   designers: designers,
   builders: builders,
   rigTypes:rigTypes,
   sailTypes:sailTypes,
   classNames:classesOfBoat,
   genericTypes:genericTypes,
   constructionMaterials:constructionMaterials,
   picLists: piclists,
   boatNames:boatNames
}

const Mutation = {
   /*
   addBoat: (parent, args) => {
      console.log('addBoat', parent, args);
      const c = db.classes.list().find(({name}) => name === args.class);
      console.log(c);
      const boat = {
         name: args.name,
         class: c.id
      };
      const id = db.boats.create(boat);
      console.log('addBoat', id, boat);
      return {id:id, ...boat};
   }
   */
}
module.exports = { Query, Mutation }
