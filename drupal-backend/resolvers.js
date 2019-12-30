const mysql = require('mysql');
const util = require('util');
const fs = require('fs');
const { buildBoatQuery, buildHandicapQuery } = require('./boat-details');
const boatQuery = fs.readFileSync('./boats.sql', 'utf8')

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
      designer: { name: boat.designer_name }
   };
   if (boat.hull_type) {
      c.hullType = boat.hull_type
      delete boat.hull_type;
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

const ownershipsByBoat = async (db, id) => {
   const l = await db.query(`
   SELECT
   n.field_owner_name_value as name,
   p.field_parts_owned_value as parts_owned,
   s.field_start_year_value as start,
   e.field_end_year_value as end
   FROM field_data_field_owners b
   LEFT JOIN field_data_field_owner_name n ON b.field_owners_target_id=n.entity_id
   LEFT JOIN field_data_field_parts_owned p ON b.field_owners_target_id=p.entity_id
   LEFT JOIN field_data_field_start_year s ON b.field_owners_target_id=s.entity_id
   LEFT JOIN field_data_field_end_year e ON b.field_owners_target_id=e.entity_id
   WHERE b.entity_id = ? AND (field_end_year_value=0 OR field_end_year_value is null)
   `, [id]);
   const r = [];
   l.forEach(i => {
      r.push({
         owner: { name: i.name },
         sixtyFourths: i.parts_owned
      });
   });
   return r;
}

const processBoatSummaries = async (db, l) => {
   const boats = [];
   for (let i = 0; i < l.length; i++) {
      const b = l[i];
      if (b.uri) {
         b.image = b.uri.replace('public:/', 'https://oga.org.uk/sites/default/files');
      }
      boats.push({
         ...b,
         id: b.oga_no,
         currentOwnership: await ownershipsByBoat(db, b.entity_id),
         class: await getClass(db, b),
         builder: { name: b.builder_name }
      });
   }
   return boats;
}

const numBoats = async (db) => {
   const c = await db.query("SELECT count(*) as num FROM node WHERE type='boat'");
   return c[0].num;
}

const numPublishedBoats = async (db) => {
   const c = await db.query("SELECT count(*) as num FROM node WHERE type='boat' AND status=1");
   return c[0].num;
}

const numUnpublishedBoats = async (db) => {
   const c = await db.query("SELECT count(*) as num FROM node WHERE type='boat' AND status=0");
   return c[0].num;
}

const pagedBoats = async (_, { page, boatsPerPage }) => {
   const db = makeDb(options);
   const totalCount = await numPublishedBoats(db);
   let start = 0;
   let pageSize = totalCount;
   if(boatsPerPage) {
      pageSize = boatsPerPage;
   }
   if(page) {
      start = (page-1)*pageSize;
   }
   const l = await db.query(`${boatQuery} LIMIT ${start},${pageSize}`);
   const boats = await processBoatSummaries(db, l);
   db.close();
   const hasNextPage = start + pageSize < totalCount;
   const hasPreviousPage = page>1;
   const result = {
      boats,
      totalCount,
      hasNextPage,
      hasPreviousPage
   };
   return result;
};

const Query = {
   boats: pagedBoats,
   boat: async (_, {id}) => {
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
      l = await db.query("SELECT IFNULL(field_builder_name_value,'') as name FROM field_data_field_builder_name WHERE entity_id=?", [b.builder]);
      if(l.length>0) {
         b.builder = {name: l[0].name };
      }
      l = await db.query("SELECT body_value FROM field_data_body WHERE entity_id=?", [b.entity_id]);
      if(l.length>0) {
         b.full_desc = l[0].body_value;
      }
      b.currentOwnership = await ownershipsByBoat(db, b.entity_id);
      b.class = await getClass(db, b);
      l = await db.query(`
         SELECT 
            REPLACE(uri, 'public:/', 'https://oga.org.uk/sites/default/files') as uri,
            field_copyright_value as copyright
            FROM field_data_field_boat_image i 
            JOIN file_managed f ON i.field_boat_image_fid = f.fid 
            JOIN field_data_field_copyright c ON c.entity_id = f.fid
            WHERE i.entity_id=?`, [b.entity_id]);
      if(l.length>0) {
         b.images = l;
      }
      db.close();
      return b;
   },
   handicap: async (_, {id}) => {
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
