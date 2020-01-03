  
 const summaryFields = {
    target_id: [ 'builder', 'designer'],
    value: [
    "boat_oga_no", "boat_name", "prev_name",
    "year_built", "place_built", "home_port",
    "for_sale", "short_desc", "sale_text", "price"
    ],
    tid: [ "rig_type", "generic_type", "mainsail_type", "design_class", "construction_material"]
 }

 const propulsionFields = {
    value: [
    "boat_oga_no",
    "engine_date", "engine_make", "engine_power", "hp", "previous_engine",
     "propellor_blades"
    ],
    tid: [
        // "engine_status", 
        "engine_fuel", "engine_position",
        "propellor_type", "propellor_position"
    ]
 }
 
const handicapFields = {
    dec_sq_feet: [ 'sailarea' ],
    dec_feet: ['biggest_down_wind_sail_foo', 'biggest_down_wind_sail_lea', 
    'biggest_down_wind_sail_luf', 'biggest_jib_foot', 
    'biggest_jib_leach', 'biggest_jib_luff', 'biggest_staysail_foot',
    'biggest_staysail_leach', 'biggest_staysail_luff',
    'fore_triangle_base', 'fore_triangle_height', 'foremast_foot', 'foremast_head',
    'foremast_luff', 'foretopsail_luff', 'foretopsail_perpendicular', 
    'main_sail_foot', 'mainsail_head', 'mainsail_luff', 
    'mizzen_foot', 'mizzen_head', 'mizzen_luff',
    'mizzen_topsail_luff', 'mizzen_topsail_perpendicul', 
     'topsail_luff', 'topsail_perpendicular'
    ],
    value: ['calculated_thcf', 'no_head_sails', 'boat_oga_no'] // boat_oga_no needed as primary key
};

const boatFields = { 
    dec_sq_feet: [ 'sailarea' ],
    target_id: [ 'builder', 'designer'],
    dec_feet: [
        'draft', 'depth', 'draft_keel_down', 'draft_keel_up', 'beam',
        'length_on_waterline', 'length_over_spars', 'length_overall',
    ],
    tid: [
        'rig_type', 'hull_type','construction_material',
        'design_class', 'generic_type', 
        'moving_keel_type', 'spar_material', 'home_country',
        'mainsail_type',
    ],
    value: [
    'boat_name', 'boat_oga_no',
    'year_built', 'approximate_year_of_build_',
    'construction_method',
    'home_port', 'location', 'place_built', 'port_reg',
    'moving_keel', 'moving_keel_weight',
    'fish_no', 'sail_no', 'ssr_no', 'nhsr_no', 'nsbr_no', 'off_reg_no', 
    'other_registries', 'call_sign',
    'ownerships_notes', 'prev_name', 'reference', 'more_info',
    'original_function', 'current_function', 'short_desc', 'special_tag',
    'for_sale', 'price', 'sale_text'
]};

const renames = {
    approximate_year_of_build_:'approximate_year_of_build',
    fish_no: 'fishing_no',
    boat_image:'image',
    boat_name:'name',
    boat_oga_no:'oga_no'
};

const buildFields = (fieldMap) => {
    let fields = "";
    let sep = "\n";
    Object.keys(fieldMap).forEach(key => {
        fieldMap[key].forEach(field => {
            fields += sep;
            let asField = field;
            if(renames[field]) asField = renames[field];
            if(key === 'tid') {
                fields += `(SELECT name FROM taxonomy_term_data WHERE tid= f_${field}.field_${field}_${key})`
            } else {
                if(field === 'for_sale') {
                    fields += ` ifnull(f_${field}.field_${field}_${key}='for-sale',false)`
                } else {
                    fields += ` f_${field}.field_${field}_${key}`
                }
            }
            fields += ` as ${asField}`;
            sep = ",\n";
        });
    });
    return fields;
}
const buildJoins = (fieldMap) => {
    let joins = "";
    Object.keys(fieldMap).forEach(key => {
        fieldMap[key].forEach(field => {
            joins += `\nLEFT JOIN field_data_field_${field} AS  f_${field} ON  f_${field}.entity_id = n.nid `
            if(key === 'target_id') {
                joins += `\nLEFT JOIN field_data_field_${field}_name AS  l_${field} ON  l_${field}.entity_id= f_${field}.field_${field}_target_id `
            }
        });
    });
    return joins
}

const buildSummaryQuery = (extra_joins, extra_wheres) => {
    let fields = buildFields(summaryFields)+",\nf.uri";
    let joins = buildJoins(summaryFields)
    +` LEFT JOIN (
        SELECT entity_id, max(field_boat_image_fid) AS fid, max(rand()), count(*) as num
        FROM field_data_field_boat_image GROUP BY entity_id
    ) image_count ON image_count.entity_id = n.nid
    LEFT JOIN file_managed f ON f.fid=image_count.fid`;
    if(extra_joins) joins = `${joins} ${extra_joins}`;
    wheres = "WHERE n.type='boat' AND n.status = 1";
    if(extra_wheres) wheres = `${wheres} ${extra_wheres}`;
    return `SELECT n.nid as entity_id, n.changed as updated, n.status as published,
    ${fields}
    FROM node AS n ${joins} ${wheres}
    `;
}

const buildBoatNumberQuery = (id, fieldMap) => {
    const q = `SELECT n.nid as entity_id, n.status as published, ${buildFields(fieldMap)}
    FROM node AS n
    ${buildJoins(fieldMap)}
    WHERE field_boat_oga_no_value = ${id}`;
    // console.log(q);
    return q;
}

const getTargetField = async (db, field, id) => {
    const [l] = await db.query(`SELECT IFNULL(field_${field}_value,'') as name FROM field_data_field_${field} WHERE entity_id=?`, [id]);
    if(l.length>0) {
       return l[0].name;
    }
    return undefined;
 }
 
const ownershipsByBoat = async (db, id) => {
    const [l] = await db.query(`
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

const numBoats = async (db) => {
    const [c] = await db.query("SELECT count(*) as num FROM node WHERE type='boat'");
    return c[0].num;
 }
 
 const numPublishedBoats = async (db) => {
    const [c] = await db.query("SELECT count(*) as num FROM node WHERE type='boat' AND status=1");
    return c[0].num;
 }
 
 const numUnpublishedBoats = async (db) => {
    const [c] = await db.query("SELECT count(*) as num FROM node WHERE type='boat' AND status=0");
    return c[0].num;
 }

 const fieldFilters = {
    name: { field: "boat_name" },
    prev_name: { field: "prev_name" },
    oga_no: { field: "boat_oga_no" },
    year_built: { field: "year_built" },
    minYear: { field: "year_built" },
    maxYear: { field: "year_built" },
    for_sale: { field: "for_sale" }
};

 const targetFilters = {
    builder: { field: "builder" },
    designer: { field: "designer" }
 };

 const taxonomyFilters = {
    constructionMaterial: { field: "construction_material" },
    designClass: { field: "design_class" },
    rigType: { field: "rig_type" }, 
    sailType: { field: "mainsail_type" },
    genericType: { field: "generic_type" }
 };

const builtBoatFilter = (filters) => {
    let wheres = "";
    let data = [];
    if(filters.has_images) {
        wheres += " AND image_count.num>0"
    }
    if(filters.has_images === false) {
        wheres += " AND (image_count.num=0 OR ISNULL(image_count.num))"
    }
    Object.keys(filters).forEach(key => {
        if(taxonomyFilters[key]) {
            field = taxonomyFilters[key].field;
            wheres += ` AND t_${field}.name = ?`;
            data.push(filters[key]); 
        }
        if(targetFilters[key]) {
            field = targetFilters[key].field;
            wheres += ` AND l_${field}.field_${field}_name_value = ?`;
            data.push(filters[key]); 
        }
        if(fieldFilters[key]) {
            field = fieldFilters[key].field;
            switch(key) {
            case 'name':
                wheres += ` AND ( f_${field}.field_${field}_value = ? OR instr(field_prev_name_value, ?)>0)`;
                data.push(filters[key]); 
                data.push(filters[key]);
                break; 
            case 'minYear':
                wheres += ` AND f_${field}.field_${field}_value >= ?`
                data.push(filters.minYear);
                break; 
            case 'maxYear':
                wheres += ` AND f_${field}.field_${field}_value <= ?`
                data.push(filters.maxYear);
                break; 
            case 'for_sale':
                wheres += ` AND f_${field}.field_${field}_value IS ${filters.for_sale?'NOT ':''}NULL`
                // data.push(filters.for_sale);
                break; 
            default:
                wheres += ` AND  f_${field}.field_${field}_value = ?`;
                data.push(filters[key]); 
            }
        }
    });
    return {data, wheres};
}

const numFilteredBoats = async (db, f) => {
    let joins = "";
    let fields_joined = {};
    let filters = {...f};
    if(filters.name) {
        filters.prev_name = filters.name; // also search prev_name
    }
    console.log('numFilteredBoats', filters);
    Object.keys(filters).forEach(key => {
        let field, join;
        if(taxonomyFilters[key]) {
            console.log(key, filters);
            field = taxonomyFilters[key].field;
            join = `
            JOIN field_data_field_${field} AS f_${field} ON n.nid = f_${field}.entity_id
            JOIN taxonomy_term_data AS t_${field} ON f_${field}.field_${field}_tid =  t_${field}.tid
            `;
        }
        if(targetFilters[key]) {
            field = targetFilters[key].field;
            join = `
            JOIN field_data_field_${field} AS f_${field} ON n.nid = f_${field}.entity_id
            JOIN field_data_field_${field}_name AS l_${field}
            ON  f_${field}.field_${field}_target_id = l_${field}.entity_id
            `;
        }
        if(fieldFilters[key]) {
            field = fieldFilters[key].field;
            if(key === 'for_sale') { // for sale is not present if never has been set
                join = ` LEFT JOIN field_data_field_${field} AS f_${field} ON n.nid = f_${field}.entity_id`;
            } else {
                join = ` JOIN field_data_field_${field} AS f_${field} ON n.nid = f_${field}.entity_id`;
            }
        }
        if(field && !fields_joined[field]) { // make sure only add join once
            joins += join;
           fields_joined[field] = true;
        }
    });
    if(filters.has_images || filters.has_images === false) {
        field = 'boat_image';
        joins += ` LEFT JOIN (
                    SELECT entity_id, count(*) as num FROM field_data_field_${field} GROUP BY entity_id
                ) image_count ON image_count.entity_id=n.nid`
    }
    const {data, wheres} = builtBoatFilter(filters);
    const query = `SELECT count(*) as num FROM node n ${joins} WHERE n.type='boat' AND n.status=1 ${wheres}`;
    try {
        const [c] = await db.query(query, data);
        return c[0].num;
    } catch(e) {
        console.log('error counting boats', e);
    }
    return 0;
}

const getFullDescription = async (db, id) => {
    const [l] = await db.query("SELECT body_value FROM field_data_body WHERE entity_id=?", [id]);
    if(l.length>0) {
        return l[0].body_value;
    }
 }

 const getImages = async (db, id) => {
    const [l] = await db.query(`
    SELECT
        field_boat_image_width as width, field_boat_image_height as height, 
        field_boat_image_alt as alt, field_boat_image_title as title,
       REPLACE(uri, 'public:/', 'https://oga.org.uk/sites/default/files') as uri,
       field_copyright_value as copyright
       FROM field_data_field_boat_image i 
       JOIN file_managed f ON i.field_boat_image_fid = f.fid 
       JOIN field_data_field_copyright c ON c.entity_id = f.fid
       WHERE i.entity_id=?`, [id]);
     if(l.length>0) {
         return l;
     }
 }

 const getTargetIdsForType = async (db, type) => {
     return (await db.query('SELECT title as name, nid as id FROM node WHERE type=?', [type]))[0];
 }

 const getTaxonomy = async (db, type) => {
    const [data] = await db.query('SELECT d.name FROM taxonomy_vocabulary v JOIN taxonomy_term_data d on d.vid = v.vid where v.machine_name=?', [type]);
    return (data).map(({name}) => name);
}

const getBoatsUnfiltered = async (db, {page, boatsPerPage}) => {
    const totalCount = await numPublishedBoats(db);
    const boatQuery = buildSummaryQuery();
    let start = 0;
    let pageSize = totalCount;
    if(boatsPerPage) {
       pageSize = boatsPerPage;
    }
    if(page) {
       start = (page-1)*pageSize;
    }
    const [boats] = await db.query(`${boatQuery} LIMIT ${start},${pageSize}`);
    const hasNextPage = start + pageSize < totalCount;
    const hasPreviousPage = page>1; 
    return {totalCount, hasNextPage, hasPreviousPage, boats}; 
}

const getBoats = async (db, filters) => {
    console.log('getBoats', filters);
    const totalCount = await numFilteredBoats(db, filters);
    console.log('totalCount', totalCount);
    const {data, wheres} = builtBoatFilter(filters);
    let joins = "";
    Object.keys(filters).forEach(key => {
        if(taxonomyFilters[key]) {
            field = taxonomyFilters[key].field;
            joins += ` JOIN taxonomy_term_data AS t_${field} ON f_${field}.field_${field}_tid = t_${field}.tid`;
        }
    });
    let boatQuery = buildSummaryQuery(joins, wheres);
    let orderField = 'field_boat_name_value';
    if(filters.sortBy) {
        orderField = {
            built:'field_year_built_value',
            name:'field_boat_name_value',
            oga_no:'field_boat_oga_no_value',
            updated:'changed'
        }[filters.sortBy];
    }
    if(filters.reverse) {
        boatQuery += ` ORDER BY ${orderField} DESC`;
    } else {
        boatQuery += ` ORDER BY ${orderField} ASC`;
    }
    const {page, boatsPerPage} = filters;
    let hasNextPage = false;
    let hasPreviousPage = false;
    if(page || boatsPerPage) {
        let pageSize = totalCount;
        if(boatsPerPage) {
           pageSize = boatsPerPage;
        }
        let start = 0;
        if(page) {
           start = (page-1)*pageSize;
        }
        boatQuery += ` LIMIT ${start},${pageSize}`;
        hasNextPage = start + pageSize < totalCount;
        hasPreviousPage = page>1; 
    }
    const [boats] = await db.query(boatQuery, data);
    return {totalCount, hasNextPage, hasPreviousPage, boats}; 
}

const getBoatHandicapData = async (db, id) => {
    const [r] = await db.query(buildBoatNumberQuery(id, handicapFields));
    return r;
}

const getBoatPropulsionData = async (db, id) => {
    const [r] = await db.query(buildBoatNumberQuery(id, propulsionFields));
    return r;
}

const getBoat = async (db, id) => {
    const [r] = await db.query(buildBoatNumberQuery(id, boatFields))
    return r[0];
}

const getBoatSummaries = async (db) => {
    const [r] = await db.query(buildSummaryQuery());
    return r;
}

module.exports = {
    getBoat,
    ownershipsByBoat,
    getTargetField,
    getBoatSummaries,
    getBoatHandicapData,
    getBoatPropulsionData,
    numUnpublishedBoats,
    numPublishedBoats,
    numBoats,
    getImages,
    getFullDescription,
    getTargetIdsForType,
    getTaxonomy,
    getBoats,
    getBoatsUnfiltered
}