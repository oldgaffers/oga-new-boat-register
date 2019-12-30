const mysql = require('mysql');
const util = require('util');
const fs = require('fs');
const { buildQuery } = require('./boat-details');
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
   let description = "";
   if (boat.design_class) {
      const r = await db.query(`
      SELECT name, description 
      FROM taxonomy_term_data WHERE tid IN (?)
      `,
      [boat.design_class]
      );
      name = r[0].name;
      description = r[0].description;
   }
   let rigType = '';
   if (boat.rig_type) {
      const r = await db.query(`
      SELECT name, description 
      FROM taxonomy_term_data WHERE tid IN (?)
      `,
      [boat.rig_type]
      );
      rigType = r[0].name;
   }
   return {
      name: name,
      rigType: rigType,
      description: description,
      designer: { name: boat.designer_name }
   };
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

/*
    LEFT JOIN field_data_field_builder_name x ON x.entity_id=b.field_builder_target_id
    LEFT JOIN field_data_field_designer_name w ON w.entity_id=d.field_designer_target_id

*/
const Query = {
   boats: pagedBoats,
   boat: async (_, {id}) => {
      const db = makeDb(options);
      const l = await db.query(buildQuery(id));
      const b = l[0];
      b.id = b.oga_no;
      builder = await db.query("SELECT IFNULL(field_builder_name_value,'') as name FROM field_data_field_builder_name WHERE entity_id=?", [b.builder]);
      if(builder.length>0) {
         b.builder = {name: builder[0].name };
      }
      b.currentOwnership = await ownershipsByBoat(db, b.entity_id);
      b.class = await getClass(db, b);
      db.close();
      if (b.uri) {
         b.image = b.uri.replace('public:/', 'https://oga.org.uk/sites/default/files');
      }
      return b;
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
