
const summaryFields = {
    target_id: ['builder', 'designer'],
    fid: ['boat_image'],
    value: [
        "boat_oga_no", "boat_name", "prev_name",
        "year_built", "place_built", "home_port",
        "for_sale", "short_desc", "sale_text", "price"
    ]
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
    dec_sq_feet: ['sailarea'],
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
    dec_sq_feet: ['sailarea'],
    target_id: ['builder', 'designer'],
    dec_feet: [
        'draft', 'depth', 'draft_keel_down', 'draft_keel_up', 'beam',
        'length_on_waterline', 'length_over_spars', 'length_overall',
    ],
    tid: [
        'rig_type', 'hull_type', 'construction_material',
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
    ]
};

const renames = {
    approximate_year_of_build_: 'approximate_year_of_build',
    fish_no: 'fishing_no',
    boat_image: 'image',
    boat_name: 'name',
    boat_oga_no: 'oga_no'
};

const buildFields = (fieldMap) => {
    let fields = "";
    let sep = "\n";
    Object.keys(fieldMap).forEach(key => {
        fieldMap[key].forEach(field => {
            let asField = field;
            if (renames[field]) asField = renames[field];
            if (key === 'tid') {
                fields += `${sep}(SELECT name FROM taxonomy_term_data WHERE tid= f_${field}.field_${field}_${key}) as ${asField}`
            } else if (key === 'fid') {
            } else {
                if (field === 'for_sale') {
                    fields += `${sep}ifnull(f_${field}.field_${field}_${key}='for-sale',false) as ${asField}`
                } else {
                    fields += `${sep}f_${field}.field_${field}_${key} as ${asField}`
                }
            }
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
            if (key === 'target_id') {
                joins += `\nLEFT JOIN field_data_field_${field}_name AS  l_${field} ON  l_${field}.entity_id= f_${field}.field_${field}_target_id `
            }
        });
    });
    return joins
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
    if (l.length > 0) {
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

const fieldMappings = {
    value: {
        name: { field: "boat_name" },
        oga_no: { field: "boat_oga_no" },
        year_built: { field: "year_built" },
        minYear: { field: "year_built" },
        maxYear: { field: "year_built" },
        for_sale: { field: "for_sale" }
    },
    target_id: {
        builder: { field: "builder" },
        designer: { field: "designer" }
    },
    tid: {
        constructionMaterial: { field: "construction_material" },
        designClass: { field: "design_class" },
        rigType: { field: "rig_type" },
        sailType: { field: "mainsail_type" },
        genericType: { field: "generic_type" }
    }
};

const builtBoatFilter = (filters) => {
    let wheres = "";
    let data = [];
    if (filters.has_images) {
        wheres += " AND image_count.num>0"
    }
    if (filters.has_images === false) {
        wheres += " AND (image_count.num=0 OR ISNULL(image_count.num))"
    }
    Object.keys(filters).forEach(key => {
        if (fieldMappings.tid[key]) {
            field = fieldMappings.tid[key].field;
            wheres += ` AND t_${field}.name = ?`;
            data.push(filters[key]);
        }
        if (fieldMappings.target_id[key]) {
            field = fieldMappings.target_id[key].field;
            wheres += ` AND l_${field}.field_${field}_name_value = ?`;
            data.push(filters[key]);
        }
        if (fieldMappings.value[key]) {
            field = fieldMappings.value[key].field;
            switch (key) {
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
                    wheres += ` AND f_${field}.field_${field}_value IS ${filters.for_sale ? 'NOT ' : ''}NULL`
                    // data.push(filters.for_sale);
                    break;
                default:
                    wheres += ` AND  f_${field}.field_${field}_value = ?`;
                    data.push(filters[key]);
            }
        }
    });
    return { data, wheres };
}

/*

DONE:
  we want a LEFT JOIN for every value field in the fields spec
  we want a LEFT JOIN for every tid field in the fields spec
  we want a LEFT JOIN for every target_id field in the fields spec
  we want a LEFT JOIN for every data field referenced in the fields spec unless its images

  we want a JOIN for every tid in the filter spec
  we want a JOIN for every target_id field in the filter spec

  JOINS should take precedence over LEFT JOINS

  we want a LEFT JOIN for every taxonomy referenced in the fields spec
  for images we want a special join depending on circumstance

TODO
  we want a JOIN for every value field in the filter spec unless it's for_sale

  we want a LEFT JOIN for prev_name if name is present
  */

const join_rule = {
    "builder":"target_id", 
    "designer":"target_id",
    "boat_image":"fid",
    "boat_oga_no": "value",
    "boat_name": "value",
    "prev_name": "value",
    "year_built": "value",
    "place_built": "value",
    "home_port": "value",
    "for_sale": "value",
    "short_desc": "value",
    "sale_text": "value",
    "price": "value",
    "rig_type": "tid",
    "generic_type": "tid", 
    "mainsail_type": "tid", 
    "design_class": "tid", 
    "construction_material": "tid"
}

const fieldsForFilters = {
    has_images: "boat_image",
    name: "boat_name",
    oga_no: "boat_oga_no",
    year_built: "year_built",
    minYear: "year_built",
    maxYear: "year_built",
    for_sale: "for_sale",
    designer: "designer",
    builder: "builder",
    constructionMaterial: "construction_material",
    designClass:  "design_class",
    rigType: "rig_type",
    sailType: "mainsail_type",
    genericType: "generic_type"
}

const getBoatsJoins = (filters, fields, justCounting) => {
    // collect the fields filters will use
    let filterField = [];
    if (filters) {
        Object.keys(filters).forEach(key => {
            const field = fieldsForFilters[key];
            if(field && !filterField.includes(field)) filterField.push(field);
        });
        if(filterField.includes('boat_name')) filterField.push('prev_name');
    }
    // collect the fields will return as values
    let selectedField = [];
    if (!justCounting) {
        if (fields) {
            Object.keys(fields).forEach(key => {
                selectedField = selectedField.concat(fields[key]);
            });
        }
    }
    // make an array of the difference
    onlySelected = [];
    selectedField.forEach(field => {
        if(!filterField.includes(field)) onlySelected.push(field);
    });
    // make the concat
    let selectedOrFiltered = onlySelected.concat(filterField);
    // now create the joins
    let joins = "";
    // first the primary fields
    selectedOrFiltered.forEach(field => {
        let joiner = " LEFT JOIN";
        if(filterField.includes(field) 
            && field != 'for_sale' 
            && field != 'boat_image'
            && field != 'prev_name'
            ) {
            joiner = " JOIN";
        }
        if(justCounting && !onlySelected[field] && (field == 'boat_image')) {
            joins += `${joiner} (
                SELECT entity_id, count(*) as num FROM field_data_field_${field} GROUP BY entity_id
            ) image_count ON image_count.entity_id=n.nid`;
        } else if(field == 'boat_image') {
            joins += `${joiner} (
                SELECT entity_id, max(field_boat_image_fid) AS fid, max(rand()), count(*) as num
                FROM field_data_field_boat_image GROUP BY entity_id
                ) image_count ON image_count.entity_id = n.nid`;
        } else {
            joins += `${joiner} field_data_field_${field} AS f_${field} ON f_${field}.entity_id = n.nid`
        }
    });
    // then the fields to be joined on to the primary fields
    selectedOrFiltered.forEach(field => {
        let joiner = " LEFT JOIN";
        if(filterField.includes(field) && field != 'for_sale' && field != 'boat_image') {
            joiner = " JOIN";
        }
        switch(join_rule[field]) {
            case 'fid':
                if(!justCounting) {
                    joins += `${joiner} file_managed f ON f.fid=image_count.fid`;
                }
                break;
            case 'target_id':
                joins += `${joiner} field_data_field_${field}_name AS l_${field} ON l_${field}.entity_id = f_${field}.field_${field}_target_id `
                break;
            case 'tid':
                joins += `${joiner} taxonomy_term_data AS t_${field} ON f_${field}.field_${field}_tid = t_${field}.tid`;
                break;
            default: // nothing to do
        }
    });
    return joins;
}

const getFullDescription = async (db, id) => {
    const [l] = await db.query("SELECT body_value FROM field_data_body WHERE entity_id=?", [id]);
    if (l.length > 0) {
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
       LEFT JOIN field_data_field_copyright c ON c.entity_id = f.fid
       WHERE i.entity_id=?`, [id]);
    if (l.length > 0) {
        return l;
    }
}

const getTargetIdsForType = async (db, type) => {
    return (await db.query('SELECT title as name, nid as id FROM node WHERE type=?', [type]))[0];
}

const getTaxonomy = async (db, type) => {
    const [data] = await db.query('SELECT d.name FROM taxonomy_vocabulary v JOIN taxonomy_term_data d on d.vid = v.vid where v.machine_name=?', [type]);
    return (data).map(({ name }) => name);
}

const getBoatsOrdering = (filters) => {
    let orderField = 'field_boat_name_value';
    if (filters.sortBy) {
        orderField = {
            built: 'field_year_built_value',
            name: 'field_boat_name_value',
            oga_no: 'field_boat_oga_no_value',
            updated: 'changed'
        }[filters.sortBy];
    }
    if (filters.reverse) {
        return ` ORDER BY ${orderField} DESC`;
    } else {
        return ` ORDER BY ${orderField} ASC`;
    }
}

const getBoatsLimits = (filters, totalCount) => {
    let r = "";
    let hasNextPage = false;
    let hasPreviousPage = false;
    const { page, boatsPerPage } = filters;
    if (page || boatsPerPage) {
        let pageSize = totalCount;
        if (boatsPerPage) {
            pageSize = boatsPerPage;
        }
        let start = 0;
        if (page) {
            start = (page - 1) * pageSize;
        }
        r += ` LIMIT ${start},${pageSize}`;
        hasNextPage = start + pageSize < totalCount;
        hasPreviousPage = page > 1;
    }
    return [r, hasNextPage, hasPreviousPage];
}

const getBoatsFields = () => {
    let fields = "n.nid as entity_id, n.changed as updated, n.status as published,"
    return fields + buildFields(summaryFields) + ", f.uri";
}

const getBoatsQuery = (fields, joins, wheres, ordering, limits) => {
    return `SELECT ${fields} FROM node AS n ${joins} WHERE n.type='boat' AND n.status = 1 ${wheres} ${ordering} ${limits}`;
}

const getBoatsUnfiltered = async (db, filters) => {
    const totalCount = await numPublishedBoats(db);
    const fields = getBoatsFields();
    const joins = getBoatsJoins(filters, summaryFields);
    const { data, wheres } = builtBoatFilter({});
    const [limits, hasNextPage, hasPreviousPage] = getBoatsLimits(filters);
    const query = getBoatsQuery(fields, joins, wheres, '', limits);
    const [boats] = await db.query(query, data);
    return { totalCount, hasNextPage, hasPreviousPage, boats };
}

const getBoatSummaries = async (db) => {
    const fields = getBoatsFields();
    const joins = getBoatsJoins({}, summaryFields);
    const { data, wheres } = builtBoatFilter({});
    const query = getBoatsQuery(fields, joins, wheres, '', '');
    const [boats] = await db.query(query, data);
    return boats;
}

const getBoats = async (db, filters) => {
    console.log('getBoats', filters);
    const totalCount = await numFilteredBoats(db, filters);
    console.log('totalCount', totalCount);
    const fields = getBoatsFields();
    const joins = getBoatsJoins(filters, summaryFields);
    const { data, wheres } = builtBoatFilter(filters);
    const ordering = getBoatsOrdering(filters);
    const [limits, hasNextPage, hasPreviousPage] = getBoatsLimits(filters, totalCount);
    const query = getBoatsQuery(fields, joins, wheres, ordering, limits);
    const [boats] = await db.query(query, data);
    return { totalCount, hasNextPage, hasPreviousPage, boats };
}

const numFilteredBoats = async (db, filters) => {
    const fields = "count(*) as num";
    const joins = getBoatsJoins(filters, summaryFields, true);
    const { data, wheres } = builtBoatFilter(filters);
    const query = getBoatsQuery(fields, joins, wheres, '', '');
    const [c] = await db.query(query, data);
    return c[0].num;
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
