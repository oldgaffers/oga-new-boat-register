const mysql = require('mysql')
const util = require('util');
const fs = require('fs')

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
   const r = await db.query(`
      SELECT name, description 
      FROM taxonomy_term_data WHERE tid IN (?,?)
      `,
      [boat.rig_type, boat.class]
   );
   if (boat.class !== 0) {
      name = r[1].name;
      description = r[1].description;
   }
   return {
      name: name,
      rigType: r[0].name,
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
   JOIN field_data_field_owner_name n ON b.field_owners_target_id=n.entity_id
   JOIN field_data_field_parts_owned p ON b.field_owners_target_id=p.entity_id
   JOIN field_data_field_start_year s ON b.field_owners_target_id=s.entity_id
   LEFT JOIN field_data_field_end_year e ON b.field_owners_target_id=e.entity_id
   WHERE b.entity_id = ? AND field_end_year_value=0
   `, [id])
   const r = [];
   l.forEach(i => {
      r.push({
         owner: { name: i.name },
         sixtyFourths: i.parts_owned
      });
   });
   return r;
}

const processBoats = async (db, l) => {
   const boats = [];
   for (let i = 0; i < l.length; i++) {
      const b = l[i];
      if (b.uri) {
         b.image = b.uri.replace('public:/', 'https://oga.org.uk/sites/default/files');
      }
      boats.push({
         ...b,
         currentOwnership: await ownershipsByBoat(db, b.id),
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
   const boats = await processBoats(db, l);
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
   boats: pagedBoats
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
