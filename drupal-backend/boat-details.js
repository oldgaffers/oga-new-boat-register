
const handicapFields = [
    'biggest_down_wind_sail_foo', 'biggest_down_wind_sail_lea', 
    'biggest_down_wind_sail_luf', 'biggest_jib_foot', 
    'biggest_jib_leach', 'biggest_jib_luff', 'biggest_staysail_foot',
    'biggest_staysail_leach', 'biggest_staysail_luff',
    'fore_triangle_base', 'fore_triangle_height', 'foremast_foot', 'foremast_head',
    'foremast_luff', 'foretopsail_luff', 'foretopsail_perpendicular', 
    'main_sail_foot', 'mainsail_head', 'mainsail_luff', 'mainsail_type',
    'mizzen_foot', 'mizzen_head', 'mizzen_luff',
    'mizzen_topsail_luff', 'mizzen_topsail_perpendicul', 
    'no_head_sails', 'sailarea', 'topsail_luff', 'topsail_perpendicular'
    ];

const allFields = { 
    target_id: [ 'builder', 'designer'],
    dec_sq_feet: [ 'sailarea' ],
    dec_feet: [
        'draft', 'depth', 'draft_keel_down', 'draft_keel_up',
        'length_on_waterline', 'length_over_spars', 'length_overall',
    ],
    tid: [
        'propellor_type', 'rig_type', 'hull_type','construction_material',
        'design_class', 'generic_type', 'engine_fuel', 'engine_position', 
        'moving_keel_type', 'propellor_position', 'spar_material', 'home_country'
    ],
    value: [
    'approximate_year_of_build_',
'boat_name', 'boat_oga_no',
'call_sign', 'construction_method',
'current_function', 'engine_date',
'engine_make', 'engine_power', 'fish_no', 'for_sale',
'home_port', 'hp',
'location',
'more_info', 'moving_keel', 'moving_keel_weight',
'nhsr_no', 'nsbr_no', 'off_reg_no', 'original_function', 'other_registries',
'ownerships_notes', 'place_built', 'port_reg', 'prev_name',
'previous_engine', 'price', 'propellor_blades',
'reference', 'sail_no', 'sale_text',
'short_desc', 'special_tag', 'ssr_no'
]};

const buildQuery = (id) => {
    let fields = "";
    let joins = "";
    let sep = "\n";
    let i = 0;
    Object.keys(allFields).forEach(key => {
        allFields[key].forEach(field => {
            const asField = field.replace(/^boat_/, '');
            fields += `${sep}t${i}.field_${field}_${key} as ${asField}`
            sep = ",\n";
            joins += `LEFT JOIN field_data_field_${field} AS t${i} ON t${i}.entity_id=node.nid\n`
            i++;
        });
    });
    let query = `SELECT t0.entity_id, status as published, ${fields}
    FROM node\n${joins} WHERE field_boat_oga_no_value = ${id}`
    return query;
}

module.exports = { buildQuery }
