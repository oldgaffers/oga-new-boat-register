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

const boatQuery2 = "SELECT count(*) FROM node WHERE type='boat' AND status=1";

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

const allBoatsCursor = async (_, { after, first }) => {
   const db = makeDb(options);
   if (first < 0) {
      throw new UserInputError('First must be positive');
   }
   const totalCount = await numPublishedBoats(db);
   let start = 0;
   let after_clause = '';
   if (after !== undefined) {
      const buff = Buffer.from(after, 'base64');
      const afterId = buff.toString('ascii');
      console.log('after', afterId);
      const ar = await db.query("SELECT entity_id FROM field_data_field_boat_name WHERE entity_id=?", [afterId]);
      if(ar.length===0) {
         throw new UserInputError('After does not exist');
      }
      after_clause = `AND n.entity_id > ${afterId}`
   }
   let l = [];
   if(first === undefined) {
      l = await db.query(`${boatQuery} ${after_clause}`);
   } else {
      l = await db.query(`${boatQuery} ${after_clause} LIMIT ${start},${first}`);
   }
   const boats = await processBoats(db, l);
   let endCursor;
   const edges = boats.map((boat) => {
      const buffer = Buffer.from(`${boat.id}`);
      endCursor = buffer.toString('base64');
      return ({
         cursor: endCursor,
         node: boat,
      });
   });
   const hasNextPage = start + first < totalCount;
   const pageInfo = endCursor !== undefined ?
      {
         endCursor,
         hasNextPage,
      } :
      {
         hasNextPage,
      };
   const result = {
      boats,
      edges,
      pageInfo,
      totalCount,
   };
   return result;
};

const old = async (_, args) => {
   const db = makeDb(options);
   const first = 0;
   const count = args.first;
   let l = await db.query(`${boatQuery} LIMIT ${first},${count}`);
   const c = await db.query(boatQuery2);
   console.log('total', c);
   const boats = await processBoats(db, l);
   return {
      totalCount: c[0].totalCount,
      edges: {
         cursor: '',
         node: null
      },
      boats: boats,
      pageInfo: {
         startCursor: '',
         endCursor: '',
         hasNextPage: false
      }
   };
}

const Query = {
   boats2: allBoatsCursor,
   boats: async () => {
      const db = makeDb(options);
      let l = await db.query(boatQuery);
      return await processBoats(db, l);
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
