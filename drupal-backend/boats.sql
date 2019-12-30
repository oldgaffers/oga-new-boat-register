    SELECT
        n.entity_id,
        n.field_boat_name_value as name,
        o.field_boat_oga_no_value as oga_no,
        y.field_year_built_value as year,
        p.field_place_built_value as whereBuilt,
        h.field_home_port_value as homePort,
        b.field_builder_target_id as builder,
        IFNULL(x.field_builder_name_value,'') as builder_name,
        d.field_designer_target_id as designer,
        IFNULL(w.field_designer_name_value,'') as designer_name,
        (SELECT name FROM taxonomy_term_data WHERE tid=r.field_rig_type_tid) as rig_type,
        (SELECT name FROM taxonomy_term_data WHERE tid=c.field_design_class_tid) as design_class,
        f.uri
    FROM 
    field_data_field_boat_name n
    LEFT JOIN field_data_field_designer d ON d.entity_id = n.entity_id
    LEFT JOIN field_data_field_boat_oga_no o ON o.entity_id = n.entity_id
    LEFT JOIN field_data_field_year_built y ON y.entity_id = n.entity_id
    LEFT JOIN field_data_field_boat_oga_no i ON i.entity_id = n.entity_id
    LEFT JOIN field_data_field_builder b ON b.entity_id = n.entity_id
    LEFT JOIN field_data_field_rig_type r ON r.entity_id = n.entity_id
    LEFT JOIN field_data_field_home_port h ON h.entity_id = n.entity_id
    LEFT JOIN field_data_field_place_built p ON p.entity_id = n.entity_id
    LEFT JOIN node ON node.nid = n.entity_id
    LEFT JOIN (
        SELECT entity_id, max(field_boat_image_fid) AS fid, max(rand())
        FROM field_data_field_boat_image GROUP BY entity_id
    ) z ON z.entity_id = n.entity_id
    LEFT JOIN file_managed f ON f.fid=z.fid
    LEFT JOIN field_data_field_design_class c ON c.entity_id = n.entity_id
    LEFT JOIN field_data_field_builder_name x ON x.entity_id=b.field_builder_target_id
    LEFT JOIN field_data_field_designer_name w ON w.entity_id=d.field_designer_target_id
    WHERE node.status = 1