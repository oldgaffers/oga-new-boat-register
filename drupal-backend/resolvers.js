const util = require("util");
const axios = require("axios");

// found an image with a # in the name - this fixes it.
const urlMangle = u => {
  const a = u.split("/");
  a[a.length - 1] = encodeURIComponent(a[a.length - 1]);
  return a.join("/");
};

const {
  ownershipsByBoat,
  getTargetField,
  getBoats,
  getBoatSummaries,
  getBoat,
  getBoatHandicapData,
  getBoatPropulsionData,
  getImages,
  getFullDescription,
  getTargetIdsForType,
  getTaxonomy
} = require("./queries");

const getClass = async (db, boat) => {
  let name = `${boat.name} Class`;
  if (boat.design_class) {
    name = boat.design_class;
    delete boat.design_class;
  }
  const c = {
    name: name,
    rigType: boat.rig_type
  };
  if (boat.hull_type) {
    c.hullType = boat.hull_type;
    delete boat.hull_type;
  }
  if (boat.designer) {
    const name = await getTargetField(db, "designer_name", boat.designer);
    const description = await getTargetField(
      db,
      "designer_description",
      boat.designer
    );
    if (name || description) {
      c.designer = { name, description, id: boat.designer };
    }
    delete boat.designer;
  }
  if (boat.generic_type) {
    c.genericType = boat.generic_type;
    delete boat.generic_type;
  }
  if (boat.mainsail_type) {
    c.mainsailType = boat.mainsail_type;
    delete boat.mainsail_type;
  }
  return c;
};

const processBoatSummaries = async (db, l) => {
  const boats = [];
  for (let i = 0; i < l.length; i++) {
    const b = l[i];
    const builder = await getTargetField(db, "builder_name", b.builder);
    if (builder) {
      b.builder = { name: builder, id: b.builder };
    }
    const albumKey = await getAlbumKey(b.oga_no);
    if (albumKey) {
      b.image = await getThumbNail(albumKey);
    }
    boats.push({
      ...b,
      id: b.oga_no,
      class: await getClass(db, b)
    });
  }
  return boats;
};

const pagedBoats = async (_, filters, context) => {
  let result = {
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    boats: []
  };
  try {
    result = await getBoats(context.db, filters);
    result.boats = await processBoatSummaries(context.db, result.boats);
  } catch (e) {
    console.log("error in getting boat data", e);
  }
  return result;
};

const boat = async (_, { id }, context) => {
  const db = context.db;
  let b = {};
  try {
    let r = await getBoat(db, id);
    // only take the non-null keys from the database
    Object.keys(r).forEach(key => {
      const val = r[key];
      if (val) {
        b[key] = val;
      }
    });
    b.id = b.oga_no;
    {
      const name = await getTargetField(db, "builder_name", b.builder);
      const description = await getTargetField(
        db,
        "builder_description",
        b.builder
      );
      if (name || description) {
        b.builder = { name, description };
      }
    }
    const fd = getFullDescription(db, b.entity_id);
    if (fd) {
      b.full_desc = fd;
    }
    b.currentOwnership = await ownershipsByBoat(db, b.entity_id);
    b.class = await getClass(db, b);
    const images = await getImages(db, b.entity_id);
    if (images) {
      b.images = images.map(img => {
        return { uri: urlMangle(img.uri), ...img };
      });
    }
    const p = await getBoatPropulsionData(db, id);
    b.propulsion = p[0];
  } catch (e) {
    console.log("error in getting boat data", e);
  }
  try {
    b.albumKey = await getAlbumKey(id);
  } catch (e) {
    console.log("error in getting boat image data", e);
  }
  if (b.albumKey) {
    b.thumbNail = await getThumbNail(b.albumKey);
  }
  return b;
};

const boatThumb = async (_, { id }, context) => {
  try {
    const albumKey = await getAlbumKey(id);
    return getThumbNail(albumKey);
  } catch (e) {
    console.log("error in getting boat image data", e);
  }
};

const getThumbNail = async albumKey => {
  const api_key = process.env.SMUGMUG_API_KEY;
  const r = await axios.get(
    `https://api.smugmug.com/api/v2/album/${albumKey}!highlightimage`,
    {
      headers: { Accept: "application/json" },
      params: {
        APIKey: api_key
      }
    }
  );
  if (r.data.Response.AlbumImage) {
    return r.data.Response.AlbumImage.ThumbnailUrl;
  }
  return null;
};

const getAlbumKey = async id => {
  const api_key = process.env.SMUGMUG_API_KEY;
  const r = await axios.get("https://api.smugmug.com/api/v2!weburilookup", {
    headers: { Accept: "application/json" },
    params: {
      APIKey: api_key,
      WebUri: "//oga.smugmug.com/Boats/OGA-" + id
    }
  });
  if (r.data.Response.Album) {
    return r.data.Response.Album.AlbumKey;
  }
  return null;
};

const handicap = async (_, { id }, context) => {
  let r;
  try {
    const l = await getBoatHandicapData(context.db, id);
    r = l[0];
  } catch (e) {
    console.log("error in getting boat handicap data", e);
  }
  let h = {
    oga_no: r.oga_no,
    no_head_sails: r.no_head_sails,
    fore_triangle_height: r.fore_triangle_height,
    fore_triangle_base: r.fore_triangle_base,
    calculated_thcf: r.calculated_thcf,
    sailarea: r.sailarea
  };
  h.main = {
    foot: r.main_sail_foot,
    head: r.mainsail_head,
    luff: r.mainsail_luff
  };
  if (r.mizzen_luff) {
    h.mizzen = {
      foot: r.mizzen_foot,
      head: r.mizzen_head,
      luff: r.mizzen_luff
    };
  }
  if (r.topsail_luff) {
    h.topsail = {
      perpendicular: r.topsail_perpendicular,
      luff: r.topsail_luff
    };
  }
  if (r.foretopsail_luff) {
    h.foretopsail = {
      perpendicular: r.foretopsail_perpendicular,
      luff: r.foretopsail_luff
    };
  }
  if (r.mizzen_topsail_luff) {
    h.mizzen_topsail = {
      perpendicular: r.mizzen_topsail_perpendicul,
      luff: r.mizzen_topsail_luff
    };
  }
  return h;
};

const designers = async (_p, _, context) => {
  try {
    return await getTargetIdsForType(context.db, "designers");
  } catch (e) {
    console.log("error in getting designers data", e);
  }
  return [];
};

const builders = async (_p, _, context) => {
  try {
    return await getTargetIdsForType(context.db, "builders");
  } catch (e) {
    console.log("error in getting builders data", e);
  }
  return [];
};

const taxonomy = async (db, name) => {
  let r;
  try {
    r = await getTaxonomy(db, name);
  } catch (e) {
    console.log("error in getting %s data", name, e);
  }
  return r;
};

const piclists = async (_p, _, context) => {
  const db = context.db;
  let r;
  try {
    r = {
      rigTypes: await getTaxonomy(db, "rig_type"),
      sailTypes: await getTaxonomy(db, "main_sail_type"),
      classNames: await getTaxonomy(db, "design_class"),
      genericTypes: await getTaxonomy(db, "generic_type"),
      constructionMaterials: await getTaxonomy(db, "construction_material")
    };
  } catch (e) {
    console.log("error in getting pick lists", e);
  }
  return r;
};

const boatNames = async (_p, _, context) => {
  let l;
  try {
    l = await getBoatSummaries(context.db);
  } catch (e) {
    console.log("error in getting boat names", e);
  }
  const r = {};
  l.forEach(boat => {
    r[boat.name.trim()] = 1;
    const p = boat.prev_name;
    if (p) {
      p.split(",").forEach(name => {
        const n = name.trim();
        if (n) r[n] = 1;
      });
    }
  });
  return Object.keys(r).sort();
};

const Query = {
  boats: pagedBoats,
  boat: boat,
  handicap: handicap,
  designers: designers,
  builders: builders,
  rigTypes: async (_p, _, context) => taxonomy(context.db, "rig_type"),
  sailTypes: async (_p, _, context) => taxonomy(context.db, "main_sail_type"),
  classNames: async (_p, _, context) => taxonomy(context.db, "design_class"),
  genericTypes: async (_p, _, context) => taxonomy(context.db, "generic_type"),
  constructionMaterials: async (_p, _, context) =>
    taxonomy(context.db, "construction_material"),
  picLists: piclists,
  boatNames: boatNames
  thumb: boatThumb
};

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
};
module.exports = { Query, Mutation };
