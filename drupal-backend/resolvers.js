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
   let result;
   try {
      result = await getBoats(db, filters);
      result.boats = await processBoatSummaries(db, result.boats);
   } catch(e) {
      console.log('error in getting boat data', e);
   }
   db.close();
   return result;
};

const boat = async (_, {id}) => {
   const db = makeDb(options);
   let b = {};
   try {
      let l = await db.query(buildBoatQuery(id));
      // only take the non-null keys from the database
      Object.keys( r).forEach(key => {
         const val =  r[key];
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
   } catch(e) {
      console.log('error in getting boat data', e);
   }
   db.close();
   return b;
}

const handicap = async (_, {id}) => {
   const db = makeDb(options);
   let r;
   try {
      const l = await db.query(buildHandicapQuery(id));
      r = l[0];
   } catch(e) {
      console.log('error in getting boat handicap data', e);
   }
   db.close();
   let h = { 
      oga_no:  r.oga_no, no_head_sails:  r.no_head_sails,
      fore_triangle_height:  r.fore_triangle_height,
      fore_triangle_base:  r.fore_triangle_base,
      calculated_thcf:  r.calculated_thcf,
      sailarea:  r.sailarea
    };
   h.main = {
      foot:  r.main_sail_foot,
      head:  r.mainsail_head,
      luff:  r.mainsail_luff
   };
   if( r.mizzen_luff) {
      h.mizzen = {
         foot:  r.mizzen_foot,
         head:  r.mizzen_head,
         luff:  r.mizzen_luff
      };   
   }
   if( r.topsail_luff) {
      h.topsail = {
         perpendicular:  r.topsail_perpendicular,
         luff:  r.topsail_luff
      };   
   }
   if( r.foretopsail_luff) {
      h.foretopsail = {
         perpendicular:  r.foretopsail_perpendicular,
         luff:  r.foretopsail_luff
      };   
   }
   if( r.mizzen_topsail_luff) {
      h.mizzen_topsail = {
         perpendicular:  r.mizzen_topsail_perpendicul,
         luff:  r.mizzen_topsail_luff
      };   
   }
   return h;
}

const designers = async (_, {}) => {
   const db = makeDb(options);
   let designers;
   try {
      designers = await getTargetIdsForType(db, 'designers');
   } catch(e) {
      console.log('error in getting designers data', e);
   }
   db.close();
   return designers;
}

const builders = async (_, {}) => {
   const db = makeDb(options);
   let builders;
   try {
      builders = await getTargetIdsForType(db, 'builders');
   } catch(e) {
      console.log('error in getting builders data', e);
   }
   db.close();
   return builders;
}

const taxonomy = async (name) => {
   const db = makeDb(options);
   let r;
   try {
      r = await getTaxonomy(db, name);
   } catch(e) {
      console.log('error in getting %s data', name, e);
   }
   db.close();
   return r;
}

const piclists = async () => {
   const db = makeDb(options);
   let r;
   try {
      r = {
         rigTypes: await getTaxonomy(db, 'rig_type'),
         sailTypes:await getTaxonomy(db, 'main_sail_type'),
         classNames:await getTaxonomy(db, 'design_class'),
         genericTypes:await getTaxonomy(db, 'generic_type'),
         constructionMaterials:await getTaxonomy(db, 'construction_material')
      };
   } catch(e) {
      console.log('error in getting pick lists', e);
   }
   db.close();
   return r;
}

const boatNames = async () => {
   const db = makeDb(options);
   let l;
   try {
      l = await db.query(buildSummaryQuery());
   } catch(e) {
      console.log('error in getting boat names', e);
   }
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
   rigTypes:async () => taxonomy('rig_type'),
   sailTypes:async () => taxonomy('main_sail_type'),
   classNames:async () => taxonomy('design_class'),
   genericTypes:async () => taxonomy('generic_type'),
   constructionMaterials:async () => taxonomy('construction_material'),
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
